import React, { Component, useState } from "react";
import "./App.css";
import OpenNFTContract from "./contracts/OpenNFT.json";
import NobelMainContract from "./contracts/NobelMain.json";
import NobelTokenContract from "./contracts/NobelToken.json";
import getWeb3 from "./getWeb3";
import {Modal, Button} from 'react-bootstrap';
import ipfsClient from 'ipfs-http-client';
const ipfs = ipfsClient('https://ipfs.infura.io:5001');



class App extends Component {
  state = { isLoaded: false, litters: [], refresh: false, currentAccount: '0x00000000000000000000', isRegistered: false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      // this.web3 = await new Web3("https://rinkeby.infura.io/v3/ca2f217cd62c4f8081cbfa6f236b609a");

      this.gas = 3000000;
      this.gasPrice = this.web3.utils.toWei('2','Gwei');
      console.log(this.gasPrice);

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();
      setInterval(
        async ()=>{
          this.accounts = await this.web3.eth.getAccounts();
          if(this.state.currentAccount !== this.accounts[0]){
            await this.changeUser(this.accounts[0]);
          }
          this.fetchUserStats(this.accounts[0], this.state.isRegistered);
        }, 1000
      )

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      const OpenNFTNetwork = OpenNFTContract.networks[this.networkId];
      this.OpenNFTInstance = new this.web3.eth.Contract(
        OpenNFTContract.abi,
        OpenNFTNetwork && OpenNFTNetwork.address,
      );

      const NodeMainNetwork = NobelMainContract.networks[this.networkId];
      this.NodeMainInstance = new this.web3.eth.Contract(
        NobelMainContract.abi,
        NodeMainNetwork && NodeMainNetwork.address,
      );

      this.changeUser(this.accounts[0]);

      this.fetchUserStats(this.accounts[0], this.state.isRegistered);

      this.fetchTokenIds();

      this.initialiseNobelTokenContract();

      this.listenToNftCreation();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      if(this.web3){
        this.setState({ isLoaded: true, currentAccount: this.accounts[0]});
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  onHide = () => {
    this.setState(
      {show: false}
    );
  }

  onShow = () => {
    this.setState(
      {show: true}
    );
  }

  register = async (userName) => {
    return await this.NodeMainInstance.methods.registerUser(userName).send(
      {
        from: this.state.currentAccount,
        gas: this.gas,
        gasPrice: this.gasPrice
      }
    ).on('receipt',(receipt)=>{
      this.setState({
        isRegistered: true
      });
      this.fetchUserStats(this.state.currentAccount)
      return true
    })
    .on('error',(error)=>{
      return false
    })
  }

  changeUser = async (account) => {
    const isRegistered = await this.NodeMainInstance
                            .methods.isRegistered(account).call();
    const newState = {
      currentAccount: account,
      isRegistered: isRegistered==0?false:true
    }
    newState.show = !newState.isRegistered?true:false;
    this.setState(
      {
        ...newState
      }
    )
  }

  giftReward = async (creator) => {
    const currentAccount = this.state.currentAccount;
    const balance = await this.NobelTokenInstance.methods.balanceOf(this.state.currentAccount).call();
    console.log(balance);
    if(balance<1){
      alert("Sorry, you don't have enough Nobel Token Balance. Earn Nobel tokens by destroying some Litter.");
      return;
    }
    return await this.NobelTokenInstance.methods.transfer(creator, 1).send({
      from: currentAccount,
      gas: this.gas,
      gasPrice: this.gasPrice
    }).on('receipt',(receipt)=>true)
      .on('error', (error)=>false);
  }

  initialiseNobelTokenContract = async () => {
    const NobelTokenAddress = await this.NodeMainInstance.methods.getNobelsContractAddress().call();
    console.log({NobelTokenAddress});
      this.NobelTokenInstance = new this.web3.eth.Contract(
        NobelTokenContract.abi,
        NobelTokenAddress
      );
  }

  fetchTokenIds = async () => {
    const litters = this.state.litters;
    const CurrentTokenId = await this.OpenNFTInstance.methods.tokenId().call();
    for(let i = 1; i<=CurrentTokenId; i++){
      const tokenUri = await this.OpenNFTInstance.methods.getTokenUri(i).call();
      const creator = await this.OpenNFTInstance.methods.getTokenCreator(i).call();
      const caption = await this.OpenNFTInstance.methods.getTokenCaption(i).call();
      const creatorName = await this.NodeMainInstance.methods.user_address_to_user_name(creator).call();
      const tokenId = i;
      litters.unshift({tokenUri, tokenId, creator, caption, creatorName });
    };
    this.setState({litters: litters});
  }

  listenToNftCreation = async () => {
    this.OpenNFTInstance.events.NftTokenCreated()
            .on('data',
                  async (receipt)=>{
                    const {creator, tokenId, tokenUri, caption} = receipt.returnValues;
                    const creatorName = await this.NodeMainInstance.methods.user_address_to_user_name(creator).call();
                    const litter = {creator, tokenId, tokenUri, caption, creatorName};
                    const litters = this.state.litters;
                    litters.unshift(litter);
                    this.setState({litters: litters});
                  }
              )
  }

  fetchUserStats = async (account, isRegistered) => {
    if(isRegistered){
      const userName = await this.NodeMainInstance
                            .methods.user_address_to_user_name(account).call();
      const litterBalance = await this.NodeMainInstance
                            .methods.getBalanceOfLitter(account).call();
      const nobelBalance = await this.NodeMainInstance
                            .methods.getBalanceOfNobels(account).call();
      this.setState({
        userName: userName,
        litterBalance: litterBalance,
        nobelBalance: nobelBalance
      });
    }
  }

  postLitterOnContract = async (uri, caption) => {
    const currentAccount = this.state.currentAccount;
    const response = await this.NodeMainInstance.methods
                  .createNobelLitter(uri, caption).send({
                    from: currentAccount,
                    gas: this.gas,
                    gasPrice: this.gasPrice
                  }).on('error',(error)=>{
                              alert("Litter Already Exists"); 
                              return false;
                            });
    console.log(response);
    await this.fetchUserStats(this.state.currentAccount);
    return true;
  }

  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App container">
        <div className={'row'}>
          <UserStats 
              userName={this.state.userName}
              userAddress={this.state.currentAccount} 
              totalLitters={this.state.litterBalance} 
              nobelBalance={this.state.nobelBalance} 
              />
        </div>
        <div className={'row'}>
          <PostLitter postLitterOnContract={this.postLitterOnContract} />
          <ViewLitters litters={this.state.litters} giftReward={this.giftReward} />
        </div>
        <RegisterUserModal show={this.state.show} onHide={this.onHide} register={this.register} />
      </div>
    );
  }
}

export default App;


const UserStats = ({userName, userAddress, totalLitters, nobelBalance}) => {


  return (
        <div className={'user-stats col-12 d-flex flex-wrap justify-content-around'}>
            <p className={'h5'} style={{wordBreak: 'break-all'}} >
              User Name:- {userName}
            </p>
            <p className={'h5'} style={{wordBreak: 'break-all'}} >
            Total Litters Sumbitted:- {totalLitters}
            </p>
            <p className={'h5'} style={{wordBreak: 'break-all'}} >
            Nobel Balance:- {nobelBalance}
            </p>
        </div>
  )


}

const PostLitter = ({postLitterOnContract, isRegistered}) => {

  const DESTROY_LITTER = "Destroy Litter!";
  const SORTING = "Sorting....";
  const DESTROYING = "Destroying....";

  const [isUser, setIsUser] = useState(isRegistered);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [file, setFile] = useState();
  const [previewImage, setPreviewImage] = useState();
  const [caption, setCaption] = useState();
  const [postingState, setPostingState] = useState(DESTROY_LITTER)

  const handleCaptionChange = (event) => {
    if(event.target.value!==null){
      setCaption(event.target.value);
    }
  }

  const handleInputFile = async  (event) => {
    if( event.target.files && event.target.files[0] ){
      const file = event.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setImageLoaded(true);
      setPostingState(SORTING);
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setPostingState(DESTROY_LITTER);
        setFile(Buffer(reader.result));
      }
    }
  }

  const handleDestroyLitter = async () => {
    if(postingState!==DESTROY_LITTER) return;
    if(file===null) return;
    setPostingState(DESTROYING)
    console.log(file);
    const result = await ipfs.add(file);
    console.log(result);
    const flag = await postLitterOnContract(
                                        result.path, caption || 'Awesome'
                                        )
    if(!flag) { alert("Destroying Failed"); return; }
    alert("Destroyed Successfully");
    setPostingState(DESTROY_LITTER);
  }


  return (
          <div className={'col-12 col-md-6 post-litter'} >
            <form >
              <div className={'custom-file mt-5 mb-3'}>
                <input 
                    type={'file'} 
                    onChange={handleInputFile}
                    placeholder={"Upload the litter"} 
                    className={'upload-litter custom-file-input'} 
                    id={'customFile'} 
                  />
                <label 
                    className={'custom-file-label'}
                    htmlFor={'customFile'}
                    >
                      Pick Up Litter...
                  </label>
              </div>
              <div className={"form-group mt-1 mb-3"}>
                <label htmlFor="exampleFormControlInput1">Something About Litter</label>
                <input type={"text"} onChange={handleCaptionChange} value={caption} className={"form-control"} id={"exampleFormControlInput1"} placeholder={"Worst"} />
              </div>
              {
                imageLoaded?
                    <div className={'litter-preview-container mt-3 mb-3 p-2'}>
                      <img src={previewImage} alt={'litter-preview'} className={'LitterPreview'} />
                    </div>
                    :
                    <></>
              }
              <div>
                <button type={'button'} onClick={handleDestroyLitter} className={'btn btn-danger mt-3 mb-3'} >
                  {postingState}
                </button>
              </div>
            </form>
          </div>
  )


}


const ViewLitters = ({litters, giftReward}) => {

  const renderLitters = (litters) =>
        litters.map(
            litter => <LitterCard litter={litter} key={litter.tokenId} giftReward={giftReward} />
          )

  return (
          <div className={'col-12 col-md-6 pt-5 view-litters'} >
            <h2>
              Litters by the community
            </h2>
            <div className={'mt-5 mb-5 p-2'}>
                {renderLitters(litters)}
            </div>
          </div>
  )

}

const LitterCard = ({litter, giftReward}) => {

  const [isGifting, setIsGifting] = useState(false);

  const giveReward = async () => {
    setIsGifting(true);
    alert(`Are you sure you want to gift ${litter.creator}, 1 Nobel Token`);
    const flag = await giftReward(litter.creator);
    if(!flag){
      alert("Sending Reward Failed");
      return;
    }
    alert("Sent");
    setIsGifting(false)
  }

  return (
          <div className={'w-100 d-flex justify-content-center'}>
            <div className={"card mt-2 mb-2"} style={{width: '20rem'}}>
                  <img src={`https://ipfs.infura.io/ipfs/${litter.tokenUri}`} className="card-img-top" alt="..." />
                  <div className="card-body">
                    <h5 className="card-title">{litter.creatorName}</h5>
                    <p className="card-body">{litter.caption}</p>
                    <button type={'button'} className="btn btn-primary" onClick={giveReward} >
                      {
                        isGifting?
                          "Sending...."
                          :
                          "Give 1 Nobel Token as Reward"
                      }
                    </button>
                  </div>
            </div>
          </div>
  )


}

function RegisterUserModal({show, onHide, register}) {

  const [isRegistering, setIsRegistering] = useState(false);
  const [userName, setUserName] = useState('')

  const registerUser = async () => {
    setIsRegistering(true);
    const flag = await register(userName);
    if(flag){
      alert('Success');
      setIsRegistering(false);
      onHide();
    }else {
      alert('Failed');
      setIsRegistering(false);
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Register here!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>You are not registered, register here!</h6>
        <div className={'form-group mt-4'}>
          <label htmlFor={'usernameInput'}>
            User Name
          </label>
          <input value={userName} onChange={(e)=>setUserName(e.target.value)} className={'form-control'} id={'usernameInput'} type={'text'} />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className={'btn btn-primary'} onClick={registerUser}>
          {
            isRegistering?'Registering...':'Register'
          }
        </button>
      </Modal.Footer>
    </Modal>
  );
}
import React, { Component, useState } from "react";
import "./App.css";
import OpenNFTContract from "./contracts/OpenNFT.json";
import NobelMainContract from "./contracts/NobelMain.json";
import NobelTokenContract from "./contracts/NobelToken.json";
import getWeb3 from "./getWeb3";

import ipfsClient from 'ipfs-http-client';
const ipfs = ipfsClient('https://ipfs.infura.io:5001');



class App extends Component {
  state = { isLoaded: false, litters: [] };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

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

      this.currentAccount= this.accounts[0];

      this.fetchUserStats(this.currentAccount);

      this.fetchTokenIds();

      this.listenToNftCreation();

      // const NodeTokenNetwork = NobelTokenContract.networks[this.networkId];
      // this.NodeTokenInstance = new this.web3.eth.Contract(
      //   NobelTokenContract.abi,
      //   NodeTokenNetwork && NodeTokenNetwork.address,
      // );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      if(this.web3){
        this.setState({ isLoaded: true});
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  fetchTokenIds = async () => {
    const litters = this.state.litters;
    const CurrentTokenId = await this.OpenNFTInstance.methods.tokenId().call();
    for(let i = 1; i<=CurrentTokenId; i++){
      const tokenUri = await this.OpenNFTInstance.methods.getTokenUri(i).call();
      const tokenId = i;
      litters.unshift({tokenUri, tokenId});
    };
    this.setState({litters: litters});
  }

  listenToNftCreation = async () => {
    this.OpenNFTInstance.events.NftTokenCreated()
            .on('data',
                  (receipt)=>{
                    const {creator, tokenId, tokenUri} = receipt.returnValues
                    const litter = {creator, tokenId, tokenUri};
                    const litters = this.state.litters;
                    litters.unshift(litter);
                    this.setState({litters: litters});
                  }
              )
  }

  fetchUserStats = async (account) => {
    const litterBalance = await this.NodeMainInstance
                          .methods.getBalanceOfLitter(account).call();
    const nobelBalance = await this.NodeMainInstance
                          .methods.getBalanceOfNobels(account).call();
    this.setState({
      litterBalance: litterBalance,
      nobelBalance: nobelBalance
    })
  }

  postLitterOnContract = async (uri) => {
    const response = await this.NodeMainInstance.methods
                  .createNobelLitter(uri).send({
                    from: this.currentAccount,
                    gas: 3000000,
                    gasPrice: 150000
                  });
    console.log(response);
    await this.fetchUserStats(this.currentAccount);
  }

  // fetchLitters = async () => {
  //   const response = await this.OpenNFTInstance.methods.
  // }

  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App container">
        <div className={'row'}>
          <UserStats 
              userAddress={this.currentAccount} 
              totalLitters={this.state.litterBalance} 
              nobelBalance={this.state.nobelBalance} 
              />
        </div>
        <div className={'row'}>
          <PostLitter postLitterOnContract={this.postLitterOnContract} />
          <ViewLitters litters={this.state.litters} />
        </div>
      </div>
    );
  }
}

export default App;


const UserStats = ({userAddress, totalLitters, nobelBalance}) => {


  return (
        <div className={'user-stats col-12 d-flex flex-wrap justify-content-around'}>
            <h4 >
              User Address:- {userAddress}
            </h4>
            <h4>
              Total Litters Sumbitted:- {totalLitters}
            </h4>
            <h4>
              Nobel Balance:- {nobelBalance}
            </h4>
        </div>
  )


}

const PostLitter = ({postLitterOnContract}) => {

  const [imageLoaded, setImageLoaded] = useState(false);
  const [file, setFile] = useState();
  const [previewImage, setPreviewImage] = useState();

  const handleInputFile = (event) => {
    if( event.target.files && event.target.files[0] ){
      const file = event.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setImageLoaded(true);
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = () => {
        setFile(Buffer(reader.result));
      }
    }
  }

  const handleDestroyLitter = async () => {
    console.log(file);
    const result = await ipfs.add(file);
    await postLitterOnContract(
      `https://ipfs.infura.io/ipfs/${result.path}`
      );
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
                  Destroy Litter!
                </button>
              </div>
            </form>
          </div>
  )


}


const ViewLitters = ({litters}) => {

  const renderLitters = (litters) =>
        litters.map(
            litter => <LitterCard litter={litter} key={litter.tokenId} />
          )

  return (
          <div className={'col-12 col-md-6 view-litters'} >
            <div className={'mt-5 mb-5 p-2 d-flex justify-content-center'}>
                {renderLitters(litters)}
            </div>
          </div>
  )

}

const LitterCard = ({litter}) => {

  const [imageLoaded, setImageLoaded] = useState(true);

  return (
          <div className="card" style={{width: '18rem'}}>
                  <img src={litter.tokenUri} className="card-img-top" alt="..." />
                  <div className="card-body">
                    <h5 className="card-title">Username</h5>
                    <a href="#" className="btn btn-primary">Give Reward</a>
                  </div>
            </div>
  )


}
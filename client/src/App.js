import React, { Component } from "react";
import "./App.css";
import OpenNFTContract from "./contracts/OpenNFT.json";
import NobelMainContract from "./contracts/NobelMain.json";
import NobelTokenContract from "./contracts/NobelToken.json";
import getWeb3 from "./getWeb3";
import MenuProvider from 'react-flexible-sliding-menu';
import ProfileMenu from './Components/ProfileMenu';
import ViewLitters from './Components/ViewLitters';
import PostLitter from './Components/PostLitter';
import RegisterUserModal from './Components/RegisterUserModal';
import TopBar from './Components/TopBar';
import UserStatsContext from './UserStatsContext';





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
      console.log(this.networkId);

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
    const userStats = {
      userName: this.state.userName,
      currentAccount: this.state.currentAccount, 
      litterBalance: this.state.litterBalance, 
      nobelBalance: this.state.nobelBalance
    }
    return (
      <div className="App container">
        <UserStatsContext.Provider value={userStats} >
          <MenuProvider 
                      MenuComponent={ProfileMenu} 
                      direction={'right'} 
                      width={'300px'} >
            <div className={'row'}>
              <TopBar />
            </div>
            <div className={'row'}>
              <PostLitter postLitterOnContract={this.postLitterOnContract} />
              <ViewLitters litters={this.state.litters} giftReward={this.giftReward} />
            </div>
          </MenuProvider> 
        </UserStatsContext.Provider>
        <RegisterUserModal show={this.state.show} onHide={this.onHide} register={this.register} />
      </div>
    );
  }
}

export default App;
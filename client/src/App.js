import React, { Component, useState } from "react";
import "./App.css";
import OpenNFTContract from "./contracts/OpenNFT.json";
import NobelMainContract from "./contracts/NobelMain.json";
import NobelTokenContract from "./contracts/NobelToken.json";
import getWeb3 from "./getWeb3";

import ipfsClient from 'ipfs-http-client';
const ipfs = ipfsClient('https://ipfs.infura.io:5001');



class App extends Component {
  state = { isLoaded: false };

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

  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App container">
        <div className={'row'}>
          <UserStats />
        </div>
        <div className={'row'}>
          <PostLitter />
          <ViewLitters />
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
              User Address:- 
            </h4>
            <h4>
              Total Litters Sumbitted:- 
            </h4>
            <h4>
              Nobel Balance:- 
            </h4>
        </div>
  )


}

const PostLitter = () => {

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
    console.log(`https://ipfs.infura.io/ipfs/${result.path}`);
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



  return (
          <div className={'col-12 col-md-6 view-litters'} >
            <div className={'mt-5 mb-5 p-2 d-flex justify-content-center'}>
                <LitterCard />
            </div>
          </div>
  )

}

const LitterCard = ({image, address}) => {

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
          <div className="card" style={{width: '18rem'}}>
                  {
                    imageLoaded?
                        <img src="..." className="card-img-top" alt="..." />
                        :
                        <></>
                  }
                  <div className="card-body">
                    <h5 className="card-title">User Address</h5>
                    <a href="#" className="btn btn-primary">Give Reward</a>
                  </div>
            </div>
  )


}
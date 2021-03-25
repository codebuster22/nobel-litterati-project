const path = require("path");
const HDWallet = require('@truffle/hdwallet-provider');
require('dotenv').config({path: '../.env'});

const mnemonic = process.env.MNEMONIC;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ganache_local: {
      provider: () => new HDWallet(mnemonic, 'http://127.0.0.1:7545'),
      host: 'http://127.0.0.1',
      port: 7545,
      network_id: 5777
    },
    rinkeby: {
      provider: () => new HDWallet(mnemonic, 'wss://rinkeby.infura.io/ws/v3/ca2f217cd62c4f8081cbfa6f236b609a'),
      // host: 'https://rinkeby.infura.io/v3/3c4066a3dd9642d4a05593f69e2937eb',
      network_id: 4
    }
  },
  compilers : {
    solc: {
      version: "^0.8.0"
    }
  }
};

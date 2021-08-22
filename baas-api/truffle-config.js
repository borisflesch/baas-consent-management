const PrivateKeyProvider = require("@truffle/hdwallet-provider");
const privateKeys = [
  "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63", "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
  "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
  "0xd39b6bd9bf5a5bd15d212bf5787000e5099dc97aff78ee3dcdd09c8202a808bb" // EXTERNAL, METAMASK
];
const privateKeyProvider = new PrivateKeyProvider(privateKeys, "http://127.0.0.1:8545", 0, 4);

module.exports = {
  networks: {
    besu: {
      provider: privateKeyProvider,
      network_id: "*",
      gasPrice: 0,
      gas: "0x47b760",
    }
  },
  compilers: {
    solc: {
      version: "^0.8.6"
    }
  }
};

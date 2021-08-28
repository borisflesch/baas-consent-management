const Web3 = require('web3');
const truffleConfig = require('./truffle-config');
const abiDecoder = require('abi-decoder');

async function main() {
    const web3 = new Web3(truffleConfig.networks.besu.provider);
    const txh = process.argv[2];
    web3.eth.getTransaction(txh, (error, result) => {
        if (error) {
            console.log(error);
            return;
        } else if (!result) {
            console.log("No result.");
            return;
        } else {
            abiDecoder.addABI(require('./build/contracts/ConsentsManager.json').abi);
            console.log(abiDecoder.decodeMethod(result.input));
        }
        
        process.exit();
    });
}

main();
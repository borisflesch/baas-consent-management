const express = require('express');
const app = express();
const port = 3000 || process.env.PORT;
const Web3 = require('web3');
const consentConnect = require('./connection/ConsentsManager.js');
const truffleConfig = require('./truffle-config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getAccounts', (req, res) => {
    consentConnect.start((answer) => {
        res.send(answer);
    });
});

app.get('/clinical-trials', async (req, res) => {
    res.send(await consentConnect.getClinicalTrials());
});

app.get('/consents/:patient', async (req, res) => {
    res.send(await consentConnect.getPatientConsents(req.params.patient));
});

app.post('/consents', async (req, res) => {
    res.send(await consentConnect.requestConsent(req.body));
});

app.post('/consents/:patient/:consentId/grant', async (req, res) => {
    res.send(await consentConnect.grantConsent({
        from: req.params.patient,
        consentId: req.params.consentId,
    }));
});

app.post('/consents/:patient/:consentId/revoke', async (req, res) => {
    res.send(await consentConnect.revokeConsent({
        from: req.params.patient,
        consentId: req.params.consentId,
    }));
});

app.post('/clinical-trials', async (req, res) => {
    res.send(await consentConnect.createClinicalTrial(req.body));
});

app.put('/clinical-trials/:clinicalTrialId', async (req, res) => {
    res.send(await consentConnect.updateClinicalTrial({
        ...req.body,
        clinicalTrialId: req.params.clinicalTrialId,
    }));
});

app.listen(port, () => {
    console.log("Application listening at http://localhost:" + port);
    
    consentConnect.web3 = new Web3(truffleConfig.networks.besu.provider);

    // const txh = "0x405c45e340228cedf5ca456e90c34cfaf5a63a8cbbd0a66f4281e852d16f9cac";
    // const txh = "0xf65fe9ff633b7b6bd85d26e4380ec8d7dec5579acc1f933462fb7de6f51433d5";
    // consentConnect.web3.eth.getTransaction(txh, (error, result) => {
    //     console.log(result);

    //     const abiDecoder = require('abi-decoder');
    //     abiDecoder.addABI(require('./build/contracts/ConsentsManager.json').abi);
    //     console.log(abiDecoder.decodeMethod(result.input));
    // });
    
    // consentConnect.web3.eth.subscribe('logs', {
    //     address: "0xF216B6b2D9E76F94f97bE597e2Cec81730520585"
    // }, (e) => {
    //     console.log(e);
    // })
});
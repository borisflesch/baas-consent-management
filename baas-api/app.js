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
});
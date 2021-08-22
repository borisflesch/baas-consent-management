const contract = require('@truffle/contract');

const consentmanagerArtifact = require('../build/contracts/ConsentsManager.json');
const ConsentManager = contract(consentmanagerArtifact);

const dataToClinicalTrialClauses = (data) => {
  const _generalInformation = [
    data.researchers,
    data.hospital,
    data.funders,
    data.naturesAndObjectives,
    data.voluntarinessOfParticipation,
    data.proceduresInvolved,
    data.genomeWideSequencingTechniques,
    data.potentialRisks,
    data.potentialBenefits,
    data.returnOfResults,
    data.withdrawalProcedures,
    data.compensationOrReimbursement,
    data.prospectsForCommercialization,
    data.studyDisseminationOrPublication,
    data.recontact,
    data.studyOversight,
  ];
  const _dataCollected = data.dataCollected;
  const _dataProcessingAndPurposes = data.dataProcessingAndPurposes;
  const _dataClauses = [
    data.dataStorageLocation,
    data.dataStorageDuration,
    data.dataAccessForResearch,
    data.dataAccessForAuditing,
    data.dataAccessAndSharing,
    data.dataProtectionsInPlace,
    data.openAccessDatabase,
  ];
  const _rareDiseaseClauses = [
    data.isRareDisease,
    data.rareDiseaseIntroductoryClause,
    data.familialParticipation,
    data.audioVisualImaging,
    data.recontactForMatching,
    data.dataLinkage,
  ];

  return [_generalInformation, _dataCollected, _dataProcessingAndPurposes, _dataClauses, _rareDiseaseClauses];
}

module.exports = {
  start: function(callback) {
    ConsentManager.setProvider(this.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        console.log("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        console.log("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }
      this.accounts = accs;
      this.account = this.accounts[2];

      callback(this.accounts);
    });
  },
  getClinicalTrials: async function() {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.getClinicalTrials.call();
      return res.valueOf().map(e => {
        return {
          id: e[0],
          parentId: e[1],
          createdBy: e[2],
          createdAt: e[3],
          generalInformation: e[4],
          dataCollected: e[5],
          dataProcessingAndPurposes: e[6],
          dataClauses: e[7],
          rareDiseaseClauses: e[8],
        }
      });
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  createClinicalTrial: async function(data) {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.createClinicalTrial(
        ...dataToClinicalTrialClauses(data),
        { from: data.from });
      console.log(res);
      return res.valueOf();
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  updateClinicalTrial: async function(data) {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.updateClinicalTrial(
        data.clinicalTrialId,
        ...dataToClinicalTrialClauses(data),
        { from: data.from });
      console.log(res);
      return res.valueOf();
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  getPatientConsents: async function(from) {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.getPatientConsents.call(from, { from });
      console.log(res);
      return res.valueOf().map(e => {
        return {
          id: e[0],
          parentId: e[1], // 0: institution; 1: funders
          clinicalTrialId: e[2],
          requestedBy: e[3],
          patient: e[4], // 0: risks; 1: benefits
          status: e[5],
          statusChangedAt: e[6],
          statusChangedBy: e[7],
          createdAt: e[8],
          expiresAt: e[9],
          additionalInformation: e[10],
          additionalArtifacts: e[11],
        }
      });
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  requestConsent: async function(data) {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.requestConsent(
        data.patientAddr, data.clinicalTrialId,
        data.parentId, data.expiresAt,
        data.additionalInformation, data.additionalArtifacts,
        { from: data.from });
      return res.valueOf();
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  grantConsent: async function(data) {
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.grantConsent(
        data.consentId,
        { from: data.from });
      return res.valueOf();
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },
  revokeConsent: async function(data) {
    this.web3.eth.handleRevert = true;
    ConsentManager.setProvider(this.web3.currentProvider);
    try {
      const instance = await ConsentManager.deployed();
      const res = await instance.revokeConsent(
        data.consentId,
        { from: data.from });
      return res.valueOf();
    } catch (e) {
      console.log(e);
      return "Error 404";
    }
  },

  
}
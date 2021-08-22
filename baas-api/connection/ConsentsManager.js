const contract = require('@truffle/contract');

const consentmanagerArtifact = require('../build/contracts/ConsentsManager.json');
const ConsentManager = contract(consentmanagerArtifact);

const apiToBaasClinicalTrialData = (data) => {
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
};

const baasToApiClinicalTrialData = (data) => {
  return {
    researchers: data._generalInformation[0],
    hospital: data._generalInformation[1],
    funders: data._generalInformation[2],
    naturesAndObjectives: data._generalInformation[3],
    voluntarinessOfParticipation: data._generalInformation[4],
    proceduresInvolved: data._generalInformation[5],
    genomeWideSequencingTechniques: data._generalInformation[6],
    potentialRisks: data._generalInformation[7],
    potentialBenefits: data._generalInformation[8],
    returnOfResults: data._generalInformation[9],
    withdrawalProcedures: data._generalInformation[10],
    compensationOrReimbursement: data._generalInformation[11],
    prospectsForCommercialization: data._generalInformation[12],
    studyDisseminationOrPublication: data._generalInformation[13],
    recontact: data._generalInformation[14],
    studyOversight: data._generalInformation[15],
    dataCollected: data._dataCollected,
    dataProcessingAndPurposes: data._dataProcessingAndPurposes,
    dataStorageLocation: data._dataClauses[0],
    dataStorageDuration: data._dataClauses[1],
    dataAccessForResearch: data._dataClauses[2],
    dataAccessForAuditing: data._dataClauses[3],
    dataAccessAndSharing: data._dataClauses[4],
    dataProtectionsInPlace: data._dataClauses[5],
    openAccessDatabase: data._dataClauses[6],
    isRareDisease: data._rareDiseaseClauses[0],
    rareDiseaseIntroductoryClause: data._rareDiseaseClauses[1],
    familialParticipation: data._rareDiseaseClauses[2],
    audioVisualImaging: data._rareDiseaseClauses[3],
    recontactForMatching: data._rareDiseaseClauses[4],
    dataLinkage: data._rareDiseaseClauses[5],
  }
};

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
          ...baasToApiClinicalTrialData({
            _generalInformation: e[4],
            _dataCollected: e[5],
            _dataProcessingAndPurposes: e[6],
            _dataClauses: e[7],
            _rareDiseaseClauses: e[8],
          }),
        };
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
        ...apiToBaasClinicalTrialData(data),
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
        ...apiToBaasClinicalTrialData(data),
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
          parentId: e[1],
          clinicalTrialId: e[2],
          requestedBy: e[3],
          patient: e[4],
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
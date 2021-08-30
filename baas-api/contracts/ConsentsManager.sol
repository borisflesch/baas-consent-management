// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract ConsentsManager {

    enum ConsentStatus{ REQUESTED, GRANTED, REJECTED, REVOKED, EXPIRED }
    
    struct Consent {
        uint id;
        uint parentId;
        uint clinicalTrialId;

        address requestedBy;
        address patient;
        ConsentStatus status;
        uint statusChangedAt;
        address statusChangedBy;
        uint createdAt;
        uint expiresAt;
        string additionalInformation;
        string additionalArtifacts;
    }
    
    struct ClinicalTrial {
        uint id;
        uint parentId;
        address createdBy;
        uint createdAt;

        // General information
        string[] generalInformation;
        /*string researchers;
        string hospital;
        string funders;
        string naturesAndObjectives;
        string voluntarinessOfParticipation;
        string proceduresInvolved;
        string genomeWideSequencingTechniques;
        string potentialRisks;
        string potentialBenefits;
        string returnOfResults;
        string withdrawalProcedures;
        string compensationOrReimbursement;
        string prospectsForCommercialization;
        string studyDisseminationOrPublication;
        string recontact;
        string studyOversight;*/

        // Data
        string[] dataCollected;
        string[] dataProcessingAndPurposes;
        string[] dataClauses;
        /*string dataStorageLocation;
        string dataStorageDuration;
        string dataAccessForResearch;
        string dataAccessForAuditing;
        string dataAccessAndSharing;
        string dataProtectionsInPlace;
        bool openAccessDatabase;*/

        // Rare diseases specific clauses
        string[] rareDiseaseClauses;
        /*bool isRareDisease;
        string rareDiseaseIntroductoryClause;
        string familialParticipation;
        string audioVisualImaging;
        string recontactForMatching;
        string dataLinkage;*/
    }
    
    struct PatientConsents {
        uint count;
        /* Consent[] consents; */
        mapping(uint => Consent) consents;
    }
    
    uint patientsCount = 0;
    mapping(uint => address) public patients;
    mapping(address => PatientConsents) public patientsConsents;
    
    uint public clinicalTrialsCount = 0;
    mapping(uint => ClinicalTrial) public clinicalTrials;
    
    address[] public researchers = [0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73]; // Address of researchers
    
    /**
     * Check if the msg sender address is in smart contract's stored researchers
     */
    function isResearcher() private view returns (bool) {
        for (uint i = 0; i < researchers.length; i++) {
            if (researchers[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Create a new clinical trial
     */
    function createClinicalTrial(
        string[] memory _generalInformation, string[] memory _dataCollected,
        string[] memory _dataProcessingAndPurposes, string[] memory _dataClauses,
        string[] memory _rareDiseaseClauses
    ) public {
        require(isResearcher(), "Only researchers can create a clinical trial");
        
        clinicalTrialsCount++;
        clinicalTrials[clinicalTrialsCount] = ClinicalTrial({
            id: clinicalTrialsCount,
            parentId: 0,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            generalInformation: _generalInformation,
            dataCollected: _dataCollected,
            dataProcessingAndPurposes: _dataProcessingAndPurposes,
            dataClauses: _dataClauses,
            rareDiseaseClauses: _rareDiseaseClauses
        });
    }
    
    /**
     * Update an existing clinical trial
     */
    function updateClinicalTrial(
        uint _clinicalTrialId,
        string[] memory _generalInformation, string[] memory _dataCollected,
        string[] memory _dataProcessingAndPurposes, string[] memory _dataClauses,
        string[] memory _rareDiseaseClauses
    ) public {
        require(isResearcher(), "Only researchers can create a clinical trial");
        require(_clinicalTrialId >= 1 && _clinicalTrialId <= clinicalTrialsCount, "Invalid clinical trial ID");
        
        /*ClinicalTrial storage oldClinicalTrial = clinicalTrials[_clinicalTrialId];*/
        
        // Create new clinical trial with old version as 'parentId'
        clinicalTrialsCount++;
        clinicalTrials[clinicalTrialsCount] = ClinicalTrial({
            id: clinicalTrialsCount,
            parentId: _clinicalTrialId,
            createdBy: msg.sender,
            createdAt: block.timestamp,
            generalInformation: _generalInformation,
            dataCollected: _dataCollected,
            dataProcessingAndPurposes: _dataProcessingAndPurposes,
            dataClauses: _dataClauses,
            rareDiseaseClauses: _rareDiseaseClauses
        });
        
        // Early expiration of all consents associated with the previous clinical trial version
        for (uint i = 0; i < patientsCount; i++) {
            PatientConsents storage patientConsents = patientsConsents[patients[i+1]];
            for (uint j = 0; j < patientConsents.count; j++) {
                Consent storage consent = patientConsents.consents[j+1];
                if (consent.clinicalTrialId == _clinicalTrialId) {
                    consent.status = ConsentStatus.EXPIRED;
                    consent.statusChangedAt = block.timestamp;
                    consent.statusChangedBy = address(this);
                    
                    // Request new consent
                    requestConsent(patients[i+1], clinicalTrialsCount, j+1,
                                consent.expiresAt, consent.additionalInformation,
                                consent.additionalArtifacts);
                }
            }
        }
    }
    
    
    /**
     * Request consent to a patient (as a researcher)
     */
    function requestConsent(
        address _patientAddr, uint _clinicalTrialId, uint _parentId,
        uint _expiresAt, string memory _additionalInformation,
        string memory _additionalArtifacts
    ) public {
        require(isResearcher(), "Only researchers can require consent");
        require(_clinicalTrialId >= 1 && _clinicalTrialId <= clinicalTrialsCount, "Invalid clinical trial ID");
        
        PatientConsents storage patientConsents = patientsConsents[_patientAddr];
        
        if (patientConsents.count == 0) {
            patientsCount++;
            patients[patientsCount] = _patientAddr;
        }
        
        patientConsents.count++;
        patientConsents.consents[patientConsents.count] = Consent({
            id: patientConsents.count,
            parentId: _parentId,
            clinicalTrialId: _clinicalTrialId,
            requestedBy: msg.sender,
            patient: _patientAddr,
            status: ConsentStatus.REQUESTED,
            statusChangedAt: block.timestamp,
            statusChangedBy: msg.sender,
            createdAt: block.timestamp,
            expiresAt: _expiresAt,
            additionalInformation: _additionalInformation,
            additionalArtifacts: _additionalArtifacts
        });
    }
    
    /**
     * Grant consent as a patient
     */
    function grantConsent(uint _consentId) public {
        PatientConsents storage patientConsents = patientsConsents[msg.sender];
        require(_consentId >= 1 && _consentId <= patientConsents.count, "Invalid consent ID");
        require(patientConsents.consents[_consentId].status == ConsentStatus.REQUESTED, "Consent not in 'REQUESTED' status");
        patientConsents.consents[_consentId].status = ConsentStatus.GRANTED;
    }
    
    /**
     * Reject consent as a patient
     */
    function rejectConsent(uint _consentId) public {
        PatientConsents storage patientConsents = patientsConsents[msg.sender];
        require(_consentId >= 1 && _consentId <= patientConsents.count, "Invalid consent ID");
        require(patientConsents.consents[_consentId].status == ConsentStatus.REQUESTED, "Consent not in 'REQUESTED' status");
        patientConsents.consents[_consentId].status = ConsentStatus.REJECTED;
    }
    
    /**
     * Revoke consent as a patient
     */
    function revokeConsent(uint _consentId) public {
        PatientConsents storage patientConsents = patientsConsents[msg.sender];
        require(_consentId >= 1 && _consentId <= patientConsents.count, "Invalid consent ID");
        patientConsents.consents[_consentId].status = ConsentStatus.REVOKED;
    }
    
    /**
     * Fetch all clinical trials registered
     */
    function getClinicalTrials() public view returns (ClinicalTrial[] memory) {
        ClinicalTrial[] memory ret = new ClinicalTrial[](clinicalTrialsCount);
        for (uint i = 0; i < clinicalTrialsCount; i++) {
            ret[i] = clinicalTrials[i+1];
        }
        return ret;
    }
    
    /**
     * Fetch all consents attached to the given clinical trial
     */
    function getClinicalTrialConsents(uint _clinicalTrialId) public view returns (Consent[] memory) {
        require(isResearcher(), "Access not allowed");
        require(_clinicalTrialId >= 1 && _clinicalTrialId <= clinicalTrialsCount, "Invalid clinical trial ID");
        
        // Determine the number of consents (non-dynamic array)
        uint consentsNb = 0;
        for (uint i = 0; i < patientsCount; i++) {
            PatientConsents storage patientConsents = patientsConsents[patients[i+1]];
            for (uint j = 0; j < patientConsents.count; j++) {
                Consent storage consent = patientConsents.consents[j+1];
                if (consent.clinicalTrialId == _clinicalTrialId) {
                    consentsNb++;
                }
            }
        }
        
        // Store all consents in an array that will be returned
        Consent[] memory consents = new Consent[](consentsNb);
        uint consentCount = 0;
        for (uint i = 0; i < patientsCount; i++) {
            PatientConsents storage patientConsents = patientsConsents[patients[i+1]];
            for (uint j = 0; j < patientConsents.count; j++) {
                Consent storage consent = patientConsents.consents[j+1];
                if (consent.clinicalTrialId == _clinicalTrialId) {
                    consents[consentCount++] = consent;
                }
            }
        }

        return consents;
    }
    
    /**
     * Fetch all consents associated to a patient
     */
    function getPatientConsents(address _patientAddr) public view returns (Consent[] memory) {
        require(_patientAddr == msg.sender || isResearcher(), "Access not allowed");
        
        Consent[] memory consents = new Consent[](patientsConsents[_patientAddr].count);
        for (uint i = 0; i < patientsConsents[_patientAddr].count; i++) {
            consents[i] = patientsConsents[_patientAddr].consents[i+1];
        }

        return consents;
    }   
}
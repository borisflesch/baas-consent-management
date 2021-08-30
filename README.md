# BaaS for Consent Management for Clinical Trials

## Requirements

- Node.js (tested on v16.5.0) — https://nodejs.org/
- Hyperledger Besu — https://besu.hyperledger.org/en/stable/HowTo/Get-Started/Installation-Options/Install-Binaries/

## Quickstart

1. Clone this repository
2. Open four terminals in folders `blockchain-besu/node-{1,2,3,4}`
3. Run the command `besu --config-file=config.toml` in each terminal to start the four nodes of the blockchain (which are pre-configured)
4. Navigate to `baas-api`
5. Run the following commands to install dependencies and start the server:
```
npm install
npm run start
```

## Fetch and decode data from a TXH (transaction hash)

1. Navigate to the folder `baas-api`
2. Run the following command: `node txh-decode.js <txh>`

Output example for `node txh-decode.js 0xfbf439b8d5adbc2e853dc04abbdcf1409d087544c6234153100436efb24a5279`:
```json
{
  "name": "requestConsent",
  "params": [
    {
      "name": "_patientAddr",
      "value": "0xe8faea3207b2c31c6d238b25e35219fbd318582a",
      "type": "address"
    },
    { "name": "_clinicalTrialId", "value": "1", "type": "uint256" },
    { "name": "_parentId", "value": "0", "type": "uint256" },
    { "name": "_expiresAt", "value": "1629208887", "type": "uint256" },
    { "name": "_additionalInformation", "value": "", "type": "string" },
    { "name": "_additionalArtifacts", "value": "", "type": "string" }
  ]
}
```

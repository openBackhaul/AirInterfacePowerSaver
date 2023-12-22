'use strict';
const createHttpError = require('http-errors');
const PowerSavingStatus = require("./individualServices/powerSavingStatus");
const PssAttributes = require('./individualServices/powerSavingAttributes');
const responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
const IndividualServiceUtility = require('./individualServices/IndividualServiceUtility');
const ReactivateTransmittersOfLink = require('./individualServices/ReactivateTransmittersOfLink');

const softwareUpgrade = require('./individualServices/SoftwareUpgrade');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');


/**
 * Initiates process of embedding a new release
 *
 * body V1_bequeathyourdataanddie_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.bequeathYourDataAndDie = async function (body, user, originator, xCorrelator, traceIndicator, customerJourney, operationServerName) {

  let newApplicationDetails = body;
  let currentReleaseNumber = await HttpServerInterface.getReleaseNumberAsync();
  let newReleaseNumber = body["new-application-release"];

  if (newReleaseNumber !== currentReleaseNumber) {

    softwareUpgrade.upgradeSoftwareVersion(user, xCorrelator, traceIndicator, customerJourney, newApplicationDetails)
      .catch(err => console.log(`upgradeSoftwareVersion failed with error: ${err}`));
  }
}


/**
 * @description Deletes Link from the power saving status table
 *
 * @param body V1_deletelinkfrompowersavingstatustable_body 
 * @returns responds 200 if restore activities open or 204 if succcessfully deleted
 **/

///this service shall be updated after getting clarification 
// ultimately this code will delete an entry if both modules are empty
exports.deleteLinkFromPowerSavingTable = function (body) {
  return new Promise(async function (resolve, reject) {
    let response = {};
    try {
      let linkId = body[PssAttributes.LINK.LINK_ID];
      /****************************************************************************************
      * get power saving status entry for given link-id
      ****************************************************************************************/
      let powerSavingStatusEntryResponse = await PowerSavingStatus.getPowerSavingStatusOfLink(linkId);
      let took = powerSavingStatusEntryResponse.took;
      let powerSavingStatusOfLink = powerSavingStatusEntryResponse.powerSavingStatusEntry;
      if (powerSavingStatusOfLink != undefined && Object.keys(powerSavingStatusOfLink).length != 0) {
        let moduleToRestoreOriginalStateList = powerSavingStatusOfLink[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
        let deviationFromOriginalStateList = powerSavingStatusOfLink[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST];

        if (moduleToRestoreOriginalStateList.length != 0) {
          /****************************************************************************************
          * do not delete if module-to-restore-original-state-list is not empty : returns 200
          ****************************************************************************************/
          response.responseCode = responseCodeEnum.code.OK;
          let responseBody = {};
          responseBody[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = moduleToRestoreOriginalStateList;
          response.responseBody = responseBody;
          response.took = took;
        } else {
          /****************************************************************************************
          * exclusively delete if deviation-from-original-state-list is empty: returns 204
          ****************************************************************************************/
          if (deviationFromOriginalStateList.length == 0) {
            let deleteResponse = await PowerSavingStatus.deletePowerSavingStatusOfLinkAsync(linkId);
            if (deleteResponse.took) {
              response.responseCode = responseCodeEnum.code.NO_CONTENT;
              response.took = took + deleteResponse.took;
            } else {
              throw new createHttpError.InternalServerError();
            }
          }
        }
      } else {
        /****************************************************************************************
        * if link does not exist, return 204 as per idempotence
        ****************************************************************************************/
        response.responseCode = responseCodeEnum.code.NO_CONTENT;
        response.took = took;
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
    resolve(response);
  });
}


/**
 * @description Provides the list of affected links by some deviation
 *
 * @param body V1_listaffectedlinks_body 
 * @returns link-id-list : link-id(s) that are affected by the given deviation
 **/
exports.listAffectedLinks = function (body) {
  return new Promise(async function (resolve, reject) {
    let responseBody = {};
    try {
      let deviationFromOriginalState = body["deviation-from-original-state"];
      let powerSavingStatusTableResponse = await PowerSavingStatus.getPowerSavingStatusTable();
      let powerSavingStatusList = powerSavingStatusTableResponse.powerSavingStatusEntryTable;
      let affectedLinkIds = [];
      for (let i = 0; i < powerSavingStatusList.length; i++) {
        let deviationFromOriginalStateList = powerSavingStatusList[i][PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST];
        if (deviationFromOriginalStateList.includes(deviationFromOriginalState)) {
          affectedLinkIds.push(powerSavingStatusList[i][PssAttributes.LINK.LINK_ID]);
        }
      }
      responseBody.response = {
        "link-id-list": affectedLinkIds
      };
      responseBody.took = powerSavingStatusTableResponse.took;
    } catch (error) {
      console.log(error);
      reject(error);
    }
    resolve(responseBody);
  });
}


/**
 * @description Exports the power saving status table
 *
 * @returns the power saving status table
 **/
exports.listPowerSavingStatus = function () {
  return new Promise(async function (resolve, reject) {
    let responseBody = {};
    try {
      let powerSavingStatusTableResponse = await PowerSavingStatus.getPowerSavingStatusTable();
      responseBody.response = powerSavingStatusTableResponse.powerSavingStatusEntryTable;
      responseBody.took = powerSavingStatusTableResponse.took;
    } catch (error) {
      console.log(error);
      reject(error);
    }
    resolve(responseBody);
  });
}


/**
 * @description Provides the list of Links that require a given restore activity
 *
 * @param body V1_listtoberestoredlinks_body 
 * @returns link-id-list : link-id(s) that are required to be restored
 **/
exports.listToBeRestoredLinks = function (body) {
  return new Promise(async function (resolve, reject) {
    let responseBody = {};
    try {
      let moduleToRestoreOriginalState = body["module-to-restore-original-state"];
      let powerSavingStatusTableResponse = await PowerSavingStatus.getPowerSavingStatusTable();
      let powerSavingStatusList = powerSavingStatusTableResponse.powerSavingStatusEntryTable;
      let affectedLinkIds = [];
      for (let i = 0; i < powerSavingStatusList.length; i++) {
        let moduleToRestoreOriginalStateList = powerSavingStatusList[i][PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
        if (moduleToRestoreOriginalStateList.includes(moduleToRestoreOriginalState)) {
          affectedLinkIds.push(powerSavingStatusList[i][PssAttributes.LINK.LINK_ID]);
        }
      }
      responseBody.response = {
        "link-id-list": affectedLinkIds
      };
      responseBody.took = powerSavingStatusTableResponse.took;
    } catch (error) {
      console.log(error);
      reject(error);
    }
    resolve(responseBody);
  });
}


/**
 * @description Provides the power saving status of Link
 *
 * @param body V1_providepowersavingstatusoflink_body 
 * @returns the power saving status of Link
 **/
exports.providePowerSavingStatusOfLink = function (body) {
  return new Promise(async function (resolve, reject) {
    let responseBody = {};
    try {
      let linkId = body[PssAttributes.LINK.LINK_ID];
      let powerSavingStatusEntryResponse = await PowerSavingStatus.getPowerSavingStatusOfLink(linkId);
      /****************************************************************************************
       * provide empty power saving status modules if link-id not present in ES
       ****************************************************************************************/
      if (powerSavingStatusEntryResponse.powerSavingStatusEntry == undefined || Object.keys(powerSavingStatusEntryResponse.powerSavingStatusEntry).length == 0) {
        let powerSavingStatusEntry = {};
        powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = [];
        powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = [];
        powerSavingStatusEntryResponse.powerSavingStatusEntry = powerSavingStatusEntry;
      } else {
        delete powerSavingStatusEntryResponse.powerSavingStatusEntry[PssAttributes.LINK.LINK_ID];
      }
      responseBody.response = powerSavingStatusEntryResponse.powerSavingStatusEntry;
      responseBody.took = powerSavingStatusEntryResponse.took;
    } catch (error) {
      console.log(error);
      reject(error);
    }
    resolve(responseBody);
  });
}


/**
 * Provides transmitter status of parallel links
 *
 * body V1_providetransmitterstatusofparallellinks_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200_2
 **/
exports.provideTransmitterStatusOfParallelLinks = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "request-id": "305251234-101120-1400"
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Reactivates transmitters of link
 *
 * body V1_reactivatetransmittersoflink_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns requestId Identifier of the request for all transmitters reactivation
 **/
exports.reactivateTransmittersOfLink = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(async function (resolve, reject) {
    try {
      let requestHeaders = {
        user: user,
        originator: originator,
        xCorrelator: xCorrelator,
        traceIndicator: traceIndicator,
        customerJourney: customerJourney
      };
      /****************************************************************************************
       * forms and responds with generated request-id for user reference
       ****************************************************************************************/
      let linkId = body[PssAttributes.LINK.LINK_ID];
      let requestId = await IndividualServiceUtility.generateRequestID(linkId);
      let response = {
        'request-id': requestId
      };
      /****************************************************************************************
       * triggers further callbacks to happen in background 
       *      RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction
       ****************************************************************************************/
      ReactivateTransmittersOfLink.RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction(body, requestId, requestHeaders);
      resolve(response);
      
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}


/**
 * @description Receives activation status of power saving
 *
 * @param body V1_receivepowersavingactivationstatus_body 
 * @param user String User identifier from the system starting the service call
 * @param originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * @param xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param traceIndicator String Sequence of request numbers along the flow
 * @param customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.receivePowerSavingActivationStatus = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    try {
      let requestId = body["request-id"];
      let statusOfLink = body["status-of-link"];
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * @description Receives deactivation status of power saving
 *
 * @param body V1_receivepowersavingdeactivationstatus_body 
 * @param user String User identifier from the system starting the service call
 * @param originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * @param xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * @param traceIndicator String Sequence of request numbers along the flow
 * @param customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.receivePowerSavingDeactivationStatus = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    try {
      let requestId = body["request-id"];
      let statusOfLink = body["status-of-link"];
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}


/**
 * Receives transmitter status of parallel links
 *
 * body V1_receivetransmitterstatusofparallellinks_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * no response value expected for this operation
 **/
exports.receiveTransmitterStatusOfParallelLinks = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    resolve();
  });
}


/**
 * @description Update or create an entry for a linkId in the power saving status table
 *
 * @param body V1_recordpowersavingstatus_body 
 * @returns took : time took to complete backend operation
 **/
exports.recordPowerSavingStatus = function (body) {
  return new Promise(async function (resolve, reject) {
    let took = 0;
    try {
      /****************************************************************************************
       * Find matching oneOf expected schema for given input
       ****************************************************************************************/
      let schemaMatched = "";
      if (body.hasOwnProperty(PssAttributes.LINK.LINK_ID)) {
        if (body.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.ADD) && body.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD)) {
          schemaMatched = "AddDeviationToPowerSavingStatus";
        } else if (!body.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.ADD) && body.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD)) {
          schemaMatched = "DocumentMeasureForUndefinedState";
        } else if (body.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.REMOVE) && body.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.REMOVE)) {
          schemaMatched = "RemoveDeviationFromPowerSavingStatus";
        }
      }

      let linkId = "";
      let addDeviationFromOriginalState = "";
      let addModuleToRestoreOriginalState = "";
      let removeDeviationFromOriginalState = "";
      let removeModuleToRestoreOriginalState = "";

      switch (schemaMatched) {
        case "AddDeviationToPowerSavingStatus":
          /****************************************************************************************
          * add deviation to a power saving status entry
          ****************************************************************************************/
          linkId = body[PssAttributes.LINK.LINK_ID];
          addDeviationFromOriginalState = body[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.ADD];
          addModuleToRestoreOriginalState = body[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD];
          took = await PowerSavingStatus.addDeviationToPowerSavingStatusEntry(linkId, addDeviationFromOriginalState, addModuleToRestoreOriginalState);
          break;
        case "RemoveDeviationFromPowerSavingStatus":
          /****************************************************************************************
          * remove deviation from a power saving status entry
          ****************************************************************************************/
          linkId = body[PssAttributes.LINK.LINK_ID];
          removeDeviationFromOriginalState = body[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.REMOVE];
          removeModuleToRestoreOriginalState = body[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.REMOVE];
          took = await PowerSavingStatus.removeDeviationFromPowerSavingStatusEntry(linkId, removeDeviationFromOriginalState, removeModuleToRestoreOriginalState);
          break;
        case "DocumentMeasureForUndefinedState":
          /****************************************************************************************
          * document measure for resolving a potentially undefined state
          ****************************************************************************************/
          linkId = body[PssAttributes.LINK.LINK_ID];
          addModuleToRestoreOriginalState = body[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD];
          took = await PowerSavingStatus.documentMeasureForUndefinedState(linkId, addModuleToRestoreOriginalState);
          break;
        default:
          throw new createHttpError.BadRequest;
      }

    } catch (error) {
      console.log(error);
      reject(error);
    }
    let response = {
      "took": took
    }
    resolve(response);
  });
}


/**
 * Switches redundant transmitter pair off
 *
 * body V1_switchredundanttransmitterpairoff_body 
 * user String User identifier from the system starting the service call
 * originator String 'Identification for the system consuming the API, as defined in  [/core-model-1-4:control-construct/logical-termination-point={uuid}/layer-protocol=0/http-client-interface-1-0:http-client-interface-pac/http-client-interface-configuration/application-name]' 
 * xCorrelator String UUID for the service execution flow that allows to correlate requests and responses
 * traceIndicator String Sequence of request numbers along the flow
 * customerJourney String Holds information supporting customer’s journey to which the execution applies
 * returns inline_response_200
 **/
exports.switchRedundantTransmitterPairOff = function (body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  return new Promise(function (resolve, reject) {
    var examples = {};
    examples['application/json'] = {
      "request-id": "305251234-101120-1400"
    };
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


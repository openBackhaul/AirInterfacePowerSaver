'use strict';

const createHttpError = require("http-errors");
const PssAttributes = require('./powerSavingAttributes');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const eventDispatcher = require('./EventDispatcherWithResponse');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');

var requestorDataMap = new Map();

/**
 * This method combines a set of callbacks that initiates transactions for reactivating all transmitters of link.
 * 1. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReadPowerSavingStatusOfLink
 * 2. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.Response
 * 3. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.DetermineLinkEndpoints
 * 4. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchTransmittersOn
 * 5. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReportPowerSavingStatus
 * 6. RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchBothTransmittersOff
 * @param {Object} requestorData Data provided by user in request-body.
 * @param {String} requestId Identifier of the request for all transmitters reactivation
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 **/
exports.RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction = async function (requestorData, requestId, requestHeaders) {
    try {
        /****************************************************************************************************
         * setting the request data in a map for future reference
        *****************************************************************************************************/
        requestorDataMap.set(requestId, { requestorData, requestHeaders });

        let linkId = requestorData[PssAttributes.LINK.LINK_ID];
        let traceIndicatorIncrementer = 1;
        /****************************************************************************************************
         * ReadPowerSavingStatusOfLink
        *****************************************************************************************************/
        let powerSavingStatusOfLink = await GetPowerSavingStatusOfLink(linkId, requestHeaders, traceIndicatorIncrementer++);

        let moduleToRestoreOriginalStateList = [];
        let statusOfLink = "";
        if (powerSavingStatusOfLink != undefined) {
            if (powerSavingStatusOfLink.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST)) {
                moduleToRestoreOriginalStateList = powerSavingStatusOfLink[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
                if (!moduleToRestoreOriginalStateList.includes("AllTransmittersOn")) {
                    /****************************************************************************************************
                     * If module-to-restore-original-state-list does not contain "AllTransmittersOn", then Response = "NotQualified", exit
                    *****************************************************************************************************/ 
                    statusOfLink = "NotQualified";
                    ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
                } else {
                    /****************************************************************************************************
                     * If module-to-restore-original-state-list contain "AllTransmittersOn", then DetermineLinkEndpoints
                    *****************************************************************************************************/ 
                    let linkEndPointsData = await DetermineLinkEndpoints(linkId, requestHeaders, traceIndicatorIncrementer++);
                    let mountName;
                    let uuid;
                    let localId;
                    let IfSwitchTransmittersOnFailedForAtleastOneEndPoint = false;
                    if (linkEndPointsData.length == 2) {
                        for (let i = 0; i < linkEndPointsData.length; i++) {
                            mountName = linkEndPointsData[i]["control-construct"];
                            uuid = linkEndPointsData[i]["logical-termination-point"];
                            localId = linkEndPointsData[i]["layer-protocol"];
                            let responseCode = await SwitchTransmittersOn(mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer++);
                            if (responseCode != 204) {
                                IfSwitchTransmittersOnFailedForAtleastOneEndPoint = true;
                                break;
                            }
                        }
                        if (IfSwitchTransmittersOnFailedForAtleastOneEndPoint) {
                            /****************************************************************************************************
                             * If atleast one odlResponseCode of SwitchTransmittersOn != 204, then SwitchTransmittersOff
                            *****************************************************************************************************/
                            let IfSwitchTransmittersOffFailedForAtleastOneEndPoint = false;
                            for (let j = 0; j < linkEndPointsData.length; j++) {
                                mountName = linkEndPointsData[j]["control-construct"];
                                uuid = linkEndPointsData[j]["logical-termination-point"];
                                localId = linkEndPointsData[j]["layer-protocol"];
                                let responseCode = await SwitchTransmittersOff(mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer++);
                                if (responseCode != 204) {
                                    IfSwitchTransmittersOffFailedForAtleastOneEndPoint = true;
                                    break;
                                }
                            }
                            if (IfSwitchTransmittersOffFailedForAtleastOneEndPoint) {
                                /****************************************************************************************************
                                 * If atleast one odlResponseCode of SwitchTransmittersOff != 204, 
                                 *      then Response = "UndefinedState", ReportPowerSavingStatus = document measure for resolving a potentially undefined state
                                *****************************************************************************************************/ 
                                statusOfLink = "UndefinedState";
                                ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
                                let requestBodyForDocumemtMeasure = {};
                                requestBodyForDocumemtMeasure[PssAttributes.LINK.LINK_ID] = linkId;
                                requestBodyForDocumemtMeasure[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD] = "AllTransmittersOn";
                                ReportPowerSavingStatus(requestBodyForDocumemtMeasure, requestHeaders, traceIndicatorIncrementer++);
                            } else {
                                /****************************************************************************************************
                                    * If both odlResponseCode of SwitchTransmittersOff = 204, 
                                    *      then Response = "RedundantTransmittersOff", ReportPowerSavingStatus = AddDeviation to power saver entry
                                *****************************************************************************************************/ 
                                statusOfLink = "RedundantTransmittersOff";
                                ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
                                let requestBodyForAddDeviation = {};
                                requestBodyForAddDeviation[PssAttributes.LINK.LINK_ID] = linkId;
                                requestBodyForAddDeviation[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.ADD] = "RedundantTransmittersOff";
                                requestBodyForAddDeviation[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.ADD] = "AllTransmittersOn";
                                ReportPowerSavingStatus(requestBodyForAddDeviation, requestHeaders, traceIndicatorIncrementer++);
                            }
                        } else {
                            /****************************************************************************************************
                             * If both odlResponseCode of SwitchTransmittersOn = 204, 
                             *      then Response = "AllTransmittersOn", ReportPowerSavingStatus = RemoveDeviation from power saver entry
                            *****************************************************************************************************/ 
                            statusOfLink = "AllTransmittersOn";
                            ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
                            let requestBodyForRemovingDeviation = {};
                            requestBodyForRemovingDeviation[PssAttributes.LINK.LINK_ID] = linkId;
                            requestBodyForRemovingDeviation[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.REMOVE] = "RedundantTransmittersOff";
                            requestBodyForRemovingDeviation[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.REMOVE] = "AllTransmittersOn";
                            ReportPowerSavingStatus(requestBodyForRemovingDeviation, requestHeaders, traceIndicatorIncrementer++);
                        }
                    }
                }
            } else {
                statusOfLink = "NotQualified";
                ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
            }
        } else {
            statusOfLink = "NotQualified";
            ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer++);
        }

        requestorDataMap.delete(requestId);

        return;

    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }

}

/**
 * This method Reads Power saving status of link
 * @param {Object} linkId Identifier of the microwave link for which transmitters shall be reactivated
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} powerSavingStatusOfLink 
 **/
async function GetPowerSavingStatusOfLink(linkId, requestHeaders, traceIndicatorIncrementer) {
    let powerSavingStatusOfLink = {};
    try {
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReadPowerSavingStatusOfLink
         *     AIPS://v1/provide-power-saving-status-of-link
         *****************************************************************************************************/
        let forwardingNameForPowerSavingStatusOfLink = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReadPowerSavingStatusOfLink";
        let consequentOperationForPowerSavingStatusOfLink = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForPowerSavingStatusOfLink);
        let operationClientUuid = consequentOperationForPowerSavingStatusOfLink.operationClientUuid;
        let requestBody = {
            "link-id": linkId
        };
        powerSavingStatusOfLink = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "POST",
            {}
        );
        return powerSavingStatusOfLink;
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
}

/**
 * This method Receives end-point-list of link
 * @param {Object} linkId Identifier of the microwave link for which transmitters shall be reactivated
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} linkEndPoints 
 **/
async function DetermineLinkEndpoints(linkId, requestHeaders, traceIndicatorIncrementer) {
    let linkEndPoints = {};
    try {
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.DetermineLinkEndpoints
         *     MWDI://core-model-1-4:network-control-domain=cache/link={uuid}
         *****************************************************************************************************/
        let forwardingNameForDetermineLinkEndpoints = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.DetermineLinkEndpoints";
        let consequentOperationForDetermineLinkEndpoints = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForDetermineLinkEndpoints);
        let operationClientUuid = consequentOperationForDetermineLinkEndpoints.operationClientUuid;
        let operationName = consequentOperationForDetermineLinkEndpoints.operationName;
        let pathParamList = [];
        pathParamList.push(linkId);
        let params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList);

        let coreModelLinkResponse = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            {},
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "GET",
            params
        );
        if (coreModelLinkResponse != undefined) {
            let linkEndPointsData = coreModelLinkResponse["core-model-1-4:link"][0];
            if (linkEndPointsData != undefined) {
                //including the condition that response may contain link based on more than one schema (generic and minimum for rest)
                if (linkEndPointsData.hasOwnProperty("end-point-list")) {
                    linkEndPoints = linkEndPointsData["end-point-list"];
                }
            }
        }

        return linkEndPoints;
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
}

/**
 * This method Responds to requestor with status of link based on transaction made
 * @param {String} statusOfLink Status of Link after attempting to activate power saving
 * @param {Object} requestorData Data provided by user in request-body.
 * @param {String} requestId Identifier of the request for all transmitters reactivation
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 **/
async function ReactivateTransmitterOfLinkResponse(statusOfLink, requestorData, requestId, requestHeaders, traceIndicatorIncrementer) {
    let response;
    try {
        let requestBody = {
            "request-id": requestId,
            "status-of-link": statusOfLink
        };
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.Response
         *     request.body#requestor-receive-operation
         *****************************************************************************************************/
        let operationServerUuid = await OperationServerInterface.getOperationServerUuidAsync(requestorData["requestor-receive-operation"]);
        let operationKey = await OperationServerInterface.getOperationKeyAsync(operationServerUuid);
        let httpRequestHeader = new RequestHeader(
            requestHeaders.user,
            requestHeaders.originator,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            operationKey
        );
        response = await IndividualServiceUtility.triggerRestRequest(
            "POST",
            requestorData["requestor-protocol"],
            requestorData["requestor-address"],
            requestorData["requestor-port"],
            requestorData["requestor-receive-operation"],
            httpRequestHeader,
            requestBody,
            {}
        );
        return response;
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }

}

/**
 * This method configures the transmitter-is-on to true for respective device
 * @param {String} mountName Identifier of the device from the link endpoint address triplet
 * @param {Object} uuid Identifier of the LTP from the link endpoint address triplet
 * @param {String} localId Identifier of the LayerProtocol from the link endpoint address triplet
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Integer} response-code
 **/
async function SwitchTransmittersOn(mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer) {
    let responseCode;
    try {
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchTransmittersOn
         *     MWDG://core-model-1-4:network-control-domain=live/control-construct={mountName}
         *          /logical-termination-point={uuid}/layer-protocol={localId}
         *          /air-interface-2-0:air-interface-pac/air-interface-configuration/transmitter-is-on
         *****************************************************************************************************/
        let forwardingNameForSwitchTransmitterOn = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchTransmittersOn";
        let consequentOperationForSwitchTransmitterOn = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForSwitchTransmitterOn);
        let operationClientUuid = consequentOperationForSwitchTransmitterOn.operationClientUuid;
        let operationName = consequentOperationForSwitchTransmitterOn.operationName;
        let pathParamList = [];
        pathParamList.push(mountName, uuid, localId);
        let requestBody = {
            "air-interface-2-0:transmitter-is-on": true
        };
        let params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList);
        let result = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "PUT",
            params
        );
        responseCode = result["response-code"];
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
    return responseCode;
}

/**
 * This method configures the transmitter-is-on to false for respective device
 * @param {String} mountName Identifier of the device from the link endpoint address triplet
 * @param {Object} uuid Identifier of the LTP from the link endpoint address triplet
 * @param {String} localId Identifier of the LayerProtocol from the link endpoint address triplet
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Integer} response-code
 **/
async function SwitchTransmittersOff(mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer) {
    let responseCode;
    try {
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchBothTransmittersOff
         *     MWDG://core-model-1-4:network-control-domain=live/control-construct={mountName}
         *          /logical-termination-point={uuid}/layer-protocol={localId}
         *          /air-interface-2-0:air-interface-pac/air-interface-configuration/transmitter-is-on
         *****************************************************************************************************/
        let forwardingNameForSwitchTransmitterOff = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchBothTransmittersOff";
        let consequentOperationForSwitchTransmitterOff = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForSwitchTransmitterOff);
        let operationClientUuid = consequentOperationForSwitchTransmitterOff.operationClientUuid;
        let operationName = consequentOperationForSwitchTransmitterOff.operationName;
        let pathParamList = [];
        pathParamList.push(mountName, uuid, localId);
        let requestBody = {
            "air-interface-2-0:transmitter-is-on": false
        };
        let params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList);
        let result = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "PUT",
            params
        );
        responseCode = result["response-code"];
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
    return responseCode;
}

/**
 * This method configures the power-saving-status of given link.
 * @param {String} requestBody request body to be sent in the request
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 **/
async function ReportPowerSavingStatus(requestBody, requestHeaders, traceIndicatorIncrementer) {
    let response = {};
    try {
        /****************************************************************************************************
         *   RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReportPowerSavingStatus
         *     AIPS://v1/record-power-saving-status
         *****************************************************************************************************/
        let forwardingNameForReportPowerSavingStatus = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReportPowerSavingStatus";
        let consequentOperationForReportPowerSavingStatus = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForReportPowerSavingStatus);
        let operationClientUuid = consequentOperationForReportPowerSavingStatus.operationClientUuid;
        response = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "POST",
            {}
        );
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
    return response;
}
'use strict';

const createHttpError = require("http-errors");
const PssAttributes = require('../powerSavingAttributes');
const IndividualServiceUtility = require('../IndividualServiceUtility');
const linkRelatedSwitchingOperationUtility = require("./linkRelatedSwitchingOperationUtility")
const prepareForwardingAutomation = require("../PrepareForwardingAutomation");
const eventDispatcher = require('../EventDispatcherWithResponse');
const EventDispatcherWithResponse = require('../EventDispatcherWithResponse');

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
        requestorDataMap.set(requestId, {
            requestorData,
            requestHeaders
        });

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
                    let forwardingNameForDetermineLinkEndpoints = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.DetermineLinkEndpoints";
                    let linkEndPointsData = await prepareForwardingAutomation.DetermineLinkEndpoints(forwardingNameForDetermineLinkEndpoints, linkId, requestHeaders, traceIndicatorIncrementer++);
                    let mountName;
                    let uuid;
                    let localId;
                    let IfSwitchTransmittersOnFailedForAtleastOneEndPoint = false;
                    if (linkEndPointsData.length == 2) {
                        let forwardingNameForSwitchTransmitterOn = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchTransmittersOn";
                        for (let i = 0; i < linkEndPointsData.length; i++) {
                            mountName = linkEndPointsData[i]["control-construct"];
                            uuid = linkEndPointsData[i]["logical-termination-point"];
                            localId = linkEndPointsData[i]["layer-protocol"];
                            let responseCode = await linkRelatedSwitchingOperationUtility.SwitchTransmittersOn(forwardingNameForSwitchTransmitterOn, mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer++);
                            if (responseCode != 204) {
                                IfSwitchTransmittersOnFailedForAtleastOneEndPoint = true;
                                break;
                            }
                        }
                        if (IfSwitchTransmittersOnFailedForAtleastOneEndPoint) {
                            /****************************************************************************************************
                             * If atleast one odlResponseCode of SwitchTransmittersOn != 204, then SwitchTransmittersOff
                             *****************************************************************************************************/
                            let forwardingNameForSwitchTransmitterOff = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.SwitchBothTransmittersOff";
                            let IfSwitchTransmittersOffFailedForAtleastOneEndPoint = false;
                            for (let j = 0; j < linkEndPointsData.length; j++) {
                                mountName = linkEndPointsData[j]["control-construct"];
                                uuid = linkEndPointsData[j]["logical-termination-point"];
                                localId = linkEndPointsData[j]["layer-protocol"];
                                let responseCode = await linkRelatedSwitchingOperationUtility.SwitchTransmittersOff(forwardingNameForSwitchTransmitterOff, mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer++);
                                if (responseCode != 204) {
                                    IfSwitchTransmittersOffFailedForAtleastOneEndPoint = true;
                                    break;
                                }
                            }
                            let forwardingNameForReportPowerSavingStatus = "RequestForReactivatingAllTransmittersOfLinkInitiatesTransaction.ReportPowerSavingStatus";
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
                                linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, requestBodyForDocumemtMeasure, requestHeaders, traceIndicatorIncrementer++);
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
                                linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, requestBodyForAddDeviation, requestHeaders, traceIndicatorIncrementer++);
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
                            linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, requestBodyForRemovingDeviation, requestHeaders, traceIndicatorIncrementer++);
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
            "POST", {}
        );
        return powerSavingStatusOfLink;
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
        response = await EventDispatcherWithResponse.BuildAndTriggerRestRequestToRequestor(
            requestorData["requestor-protocol"],
            requestorData["requestor-address"],
            requestorData["requestor-port"],
            requestorData["requestor-receive-operation"],
            requestHeaders,
            requestBody,
            "POST",
            traceIndicatorIncrementer
        );
        return response;
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }

}
/**
 * @file This module provides functionality to prepare and send /v1/switch-redundant-transmitter-pair-off service forwardings
 * @module PrepareSwitchRedundantTransmitterPairOffForwarding.js
 **/

const individualServiceUtility = require('../IndividualServiceUtility');
const EventDispatcherWithResponse = require('../EventDispatcherWithResponse');
const onfFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const tcpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/TcpServerInterface')
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const linkRelatedSwitchingOperationUtility = require("./linkRelatedSwitchingOperationUtility");
const prepareForwardingAutomation = require("../PrepareForwardingAutomation");
const switchOffTXPairRequestMap = new Map();
const switchOffTXPairTransactionMap = new Map();

/**
 * This method performs the set of procedure to provide transmitter status of parallel links.
 * @param {Object}  requestBodyOfSwitchRedundantTransmitterPairOff request-body provided for service provideTransmitterStatusOfParallelLinks
 * @param {String}  requestIdOfSwitchRedundantTransmitterPairOff Id that is generated when request for service  provideTransmitterStatusOfParallelLinks received.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * The following are the list of forwarding-construct that will be automated to provide transmitter status of parallel links. 
 * 1. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.GetInfoAboutParallelLinks
 * 2. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.Response
 * 3. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.DetermineLinkEndpoints
 * 4. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOff
 * 5. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOn
 * 6. RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.ReportPowerSavingStatus
 * **/
exports.switchRedundantTransmitterPairOff = async function (requestBodyOfSwitchRedundantTransmitterPairOff, requestIdOfSwitchRedundantTransmitterPairOff, requestHeaders) {

    /****************************************************************************************
     * Fetching and setting the required variables
     ****************************************************************************************/

    let traceIndicatorIncrementer = 1;
    let linkId = requestBodyOfSwitchRedundantTransmitterPairOff["link-id"];

    /*************************************************************************************************************
     * Initiates the transaction by addressing the callback 
     * RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.GetInfoAboutParallelLinks
     **************************************************************************************************************/

    let provideTransmitterStatusOfParallelLinksRequestId = await getInfoAboutParallelLinks(linkId, requestHeaders, traceIndicatorIncrementer++)

    /*************************************************************************************************************
     * Store the request id of the initiated transaction in Map for further mapping of requests
     **************************************************************************************************************/

    requestBodyOfSwitchRedundantTransmitterPairOff.traceIndicator = requestHeaders.traceIndicator;
    requestBodyOfSwitchRedundantTransmitterPairOff.traceIndicatorIncrementer = traceIndicatorIncrementer;
    switchOffTXPairRequestMap.set(requestIdOfSwitchRedundantTransmitterPairOff, requestBodyOfSwitchRedundantTransmitterPairOff)
    switchOffTXPairTransactionMap.set(provideTransmitterStatusOfParallelLinksRequestId, requestIdOfSwitchRedundantTransmitterPairOff);
}

/**
 * Prepare attributes and automate 
 *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.GetInfoAboutParallelLinks
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {String} returns provideTransmitterStatusOfParallelLinksRequestId
 */
async function getInfoAboutParallelLinks(linkId, requestHeaders, traceIndicatorIncrementer) {
    let provideTransmitterStatusOfParallelLinksRequestId = "";
    let forwardingName = "RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.GetInfoAboutParallelLinks";
    let getInfoAboutParallelLinksRequestBody = {};

    /******************************************************************************************************************
     * Prepare request and send to callback
     *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.GetInfoAboutParallelLinks
     *  AIPS://v1/provide-transmitter-status-of-parallel-links
     *****************************************************************************************************************/

    getInfoAboutParallelLinksRequestBody.linkId = linkId;
    let requestorAddress = await tcpServerInterface.getLocalAddress();
    getInfoAboutParallelLinksRequestBody.requestorAddress = requestorAddress
    if ("ipv-4-address" in requestorAddress) {
        getInfoAboutParallelLinksRequestBody.requestorAddress = {
            ipAddress: requestorAddress
        }
    }
    getInfoAboutParallelLinksRequestBody.requestorPort = await tcpServerInterface.getLocalPort();
    getInfoAboutParallelLinksRequestBody.requestorProtocol = await tcpServerInterface.getLocalProtocol();
    getInfoAboutParallelLinksRequestBody.requestorReceiveOperation = await OperationServerInterface.getOperationNameAsync("aips-0-0-5-op-s-is-501")
    getInfoAboutParallelLinksRequestBody = await onfFormatter.modifyJsonObjectKeysToKebabCase(getInfoAboutParallelLinksRequestBody);
    let consequentOperationClient = await individualServiceUtility.getConsequentOperationClient(forwardingName);
    let provideTransmitterStatusOfParallelLinksResponse = await EventDispatcherWithResponse.dispatchEvent(
        consequentOperationClient.operationClientUuid,
        getInfoAboutParallelLinksRequestBody,
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        "POST"
    )
    if (provideTransmitterStatusOfParallelLinksResponse) {
        provideTransmitterStatusOfParallelLinksRequestId = provideTransmitterStatusOfParallelLinksResponse["request-id"];
    }
    return provideTransmitterStatusOfParallelLinksRequestId;
}

/**
 * Prepare attributes and automate 
 *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.Response
 * @param {String}  switchOffTXPairRequestId request ID that is generated during the transaction.
 * @param {Object}  switchOffTXPairRequestorDetails requestor details that initiated SwitchingRedundantTransmitterPairOff transaction. 
 * @param {List}  parallelLinkList contains parallel links list .
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
async function responseOfSwitchOffTXPairRequestor(switchOffTXPairRequestId, switchOffTXPairRequestorDetails, parallelLinkList, requestHeaders, traceIndicatorIncrementer) {
    let linkId = switchOffTXPairRequestorDetails["link-id"];
    let requestorProtocol = switchOffTXPairRequestorDetails["requestor-protocol"];
    let requestorAddress = await individualServiceUtility.getConfiguredRemoteAddress(switchOffTXPairRequestorDetails["requestor-address"]);
    let requestorPort = switchOffTXPairRequestorDetails["requestor-port"];
    let requestorReceiveOperation = switchOffTXPairRequestorDetails["requestor-receive-operation"];

    /******************************************************************************************************************
     * Prepare request and send to callback
     *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.Response
     *  switchOffTXPairRequestorDetails#requestor-receive-operation
     *****************************************************************************************************************/

    let statusOfLinkAndTraceIndicatorIncrementer = await formulateStatusOfLink(parallelLinkList, linkId, requestHeaders, traceIndicatorIncrementer);
    let statusOfLink = statusOfLinkAndTraceIndicatorIncrementer.statusOfLink;
    traceIndicatorIncrementer = statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer;
    let body = await onfFormatter.modifyJsonObjectKeysToKebabCase({
        requestId: switchOffTXPairRequestId,
        statusOfLink: statusOfLink
    });
    EventDispatcherWithResponse.BuildAndTriggerRestRequestToRequestor(requestorProtocol, requestorAddress, requestorPort, requestorReceiveOperation, requestHeaders, body, "POST", traceIndicatorIncrementer++);
}

/**
 *  Checks for the request id in the  switchOffTXPairTransactionMap if exists proceeds with the execution of callback
 *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.Response otherwis just returns.
 * @param {String}  provideTransmitterStatusOfParallelLinksRequestId request ID that is generated during provideTransmitterStatusOfParallelLinks.
 * @param {Object}  parallelLinkList contains parallel links list .
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 */
exports.receiveTransmitterStatusOfParallelLinks = async function (provideTransmitterStatusOfParallelLinksRequestId, parallelLinkList, requestHeaders) {
    let switchOffTXPairRequestorDetails = {};
    let switchOffTXPairRequestId = switchOffTXPairTransactionMap.get(provideTransmitterStatusOfParallelLinksRequestId);
    if (switchOffTXPairRequestId && switchOffTXPairRequestId != "") {
        switchOffTXPairRequestorDetails = switchOffTXPairRequestMap.get(switchOffTXPairRequestId);
    }
    if (Object.keys(switchOffTXPairRequestorDetails).length > 0) {
        requestHeaders.traceIndicator = switchOffTXPairRequestorDetails.traceIndicator;
        traceIndicatorIncrementer = switchOffTXPairRequestorDetails.traceIndicatorIncrementer;
        responseOfSwitchOffTXPairRequestor(switchOffTXPairRequestId, switchOffTXPairRequestorDetails, parallelLinkList, requestHeaders, traceIndicatorIncrementer)
    }

    /******************************************************************************************************************
     *  Delete data from switchOffTXPairRequestMap and switchOffTXPairTransactionMap
     *****************************************************************************************************************/

    switchOffTXPairRequestMap.delete(switchOffTXPairRequestId);
    switchOffTXPairTransactionMap.delete(provideTransmitterStatusOfParallelLinksRequestId);
    return;
}

/**
 * Formulates status of link
 * @param {List}    parallelLinks contains parallel links list .
 * @param {String}  linkId Id of the initial link. 
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
async function formulateStatusOfLink(parallelLinks, intialLinkId, requestHeaders, traceIndicatorIncrementer) {
    let statusOfLink = "NotQualified";
    let statusOfLinkAndTraceIndicatorIncrementer = {};
    if (parallelLinks.length >= 2) {

        /******************************************************************************************************************
         * For each parallel link get the link if linkId != intialLinkId then
         * If for the link interfaceStatus === "INTERFACE_STATUS_TYPE_UP" && transmissionModeMax === transmissionModeCur
         *  return statusOfLink as 'NotQualified'
         * else DetermineLinkEndPoints for intialLink and getStatusOfLink for linkEndPointDetails
         *****************************************************************************************************************/

        for (let i = 0; i < parallelLinks.length; i++) {
            let linkId = parallelLinks[i]["link-id"];
            if (linkId != intialLinkId) {
                let transmitterStatusList = parallelLinks[i]["transmitter-status-list"];
                /******************************************************************************************************************
                 * To be updated based on the decision made on issue
                 *  https://github.com/openBackhaul/AirInterfacePowerSaver/issues/77
                 *****************************************************************************************************************/

                for (let j = 0; j < transmitterStatusList.length; j++) {
                    let transmissionModeMax = transmitterStatusList[j]["transmission-mode-max"];
                    let interfaceStatus = transmitterStatusList[j]["interface-status"];
                    let transmissionModeCur = transmitterStatusList[j]["transmission-mode-cur"];
                    if (!(interfaceStatus === "INTERFACE_STATUS_TYPE_UP" && transmissionModeMax === transmissionModeCur)) {
                        statusOfLinkAndTraceIndicatorIncrementer.statusOfLink = statusOfLink;
                        statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer = traceIndicatorIncrementer;
                        return statusOfLinkAndTraceIndicatorIncrementer;
                    }
                }
            }
        }
        /******************************************************************************************************************
         *  Prepare request and send to callback
         *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.DetermineLinkEndpoints
         *****************************************************************************************************************/
        let forwardingNameForDetermineLinkEndpoints = "RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.DetermineLinkEndpoints";
        let endPointList = await prepareForwardingAutomation.DetermineLinkEndpoints(forwardingNameForDetermineLinkEndpoints, intialLinkId, requestHeaders, traceIndicatorIncrementer++);
        if (endPointList && endPointList.length !== 0) {
            statusOfLinkAndTraceIndicatorIncrementer = await getStatusOfLink(intialLinkId, endPointList, requestHeaders, traceIndicatorIncrementer);
            return statusOfLinkAndTraceIndicatorIncrementer;
        }
    }
    statusOfLinkAndTraceIndicatorIncrementer.statusOfLink = statusOfLink;
    statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return statusOfLinkAndTraceIndicatorIncrementer;
}

/**
 * Get status of link
 * @param {String}  linkId Id of the initial link. 
 * @param {List}    endPointList end points list of the intial link.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
async function getStatusOfLink(linkId, endPointList, requestHeaders, traceIndicatorIncrementer) {
    let statusOfLinkAndTraceIndicatorIncrementer = {};
    let forwardingNameForReportPowerSavingStatus = "RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.ReportPowerSavingStatus";

    /******************************************************************************************************************
     * switchBothTransmittersOff for endPointList 
     * If not atleastOneSwitchTransmittersOffFailed ReportPowerSavingStatus
     * { addDeviationFromOriginalState: 'RedundantTransmittersOff',
     *   addModuleToRestoreOriginalState: 'AllTransmittersOn' } and return statusOfLink 'RedundantTransmittersOff'
     * else switchBothTransmittersOn for endPointList
     *****************************************************************************************************************/

    let switchBothTransmittersOffResponse = await switchBothTransmittersOff(endPointList, requestHeaders, traceIndicatorIncrementer);
    traceIndicatorIncrementer = switchBothTransmittersOffResponse.traceIndicatorIncrementer;
    let atleastOneSwitchTransmittersOffFailed = switchBothTransmittersOffResponse.atleastOneSwitchTransmittersOffFailed;
    if (!atleastOneSwitchTransmittersOffFailed) {
        await linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, {
            linkId: linkId,
            addDeviationFromOriginalState: 'RedundantTransmittersOff',
            addModuleToRestoreOriginalState: 'AllTransmittersOn'
        }, requestHeaders, traceIndicatorIncrementer++);
        statusOfLinkAndTraceIndicatorIncrementer.statusOfLink = "RedundantTransmittersOff";
        statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer = traceIndicatorIncrementer;
        return statusOfLinkAndTraceIndicatorIncrementer;
    } else {

        /******************************************************************************************************************
         * switchBothTransmittersOn for endPointList 
         * If not atleastOneSwitchTransmittersOnFailed ReportPowerSavingStatus
         * { removeDeviationFromOriginalState: 'RedundantTransmittersOff',
         *   removeModuleToRestoreOriginalState: 'AllTransmittersOn' } and return statusOfLink 'AllTransmittersOn'
         * else ReportPowerSavingStatus { addModuleToRestoreOriginalState: 'AllTransmittersOn' }
         *   and return statusOfLink for "UndefinedState"
         *****************************************************************************************************************/

        let switchBothTransmittersOnResponse = await switchBothTransmittersOn(endPointList, requestHeaders, traceIndicatorIncrementer);
        traceIndicatorIncrementer = switchBothTransmittersOnResponse.traceIndicatorIncrementer;
        let atleastOneSwitchTransmittersOnFailed = switchBothTransmittersOnResponse.atleastOneSwitchTransmittersOnFailed;
        if (!atleastOneSwitchTransmittersOnFailed) {
            await linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, {
                linkId: linkId,
                removeDeviationFromOriginalState: 'RedundantTransmittersOff',
                removeModuleToRestoreOriginalState: 'AllTransmittersOn'
            }, requestHeaders, traceIndicatorIncrementer++);
            statusOfLinkAndTraceIndicatorIncrementer.statusOfLink = "AllTransmittersOn";
            statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer = traceIndicatorIncrementer;
            return statusOfLinkAndTraceIndicatorIncrementer;
        } else {
            await linkRelatedSwitchingOperationUtility.ReportPowerSavingStatus(forwardingNameForReportPowerSavingStatus, {
                linkId: linkId,
                addModuleToRestoreOriginalState: 'AllTransmittersOn'
            }, requestHeaders, traceIndicatorIncrementer++);
            statusOfLinkAndTraceIndicatorIncrementer.statusOfLink = "UndefinedState";
            statusOfLinkAndTraceIndicatorIncrementer.traceIndicatorIncrementer = traceIndicatorIncrementer;
            return statusOfLinkAndTraceIndicatorIncrementer;
        }
    }
}


/**
 * Prepare attributes and automate 
 *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOff
 * @param {List}    endPointList end point details list of the link .
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
async function switchBothTransmittersOff(endPointList, requestHeaders, traceIndicatorIncrementer) {
    let atleastOneSwitchTransmittersOffFailed = true;
    let switchBothTransmittersOff = {};
    let forwardingName = "RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOff";

    /******************************************************************************************************************
     *  Prepare request and send to callback
     *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOff
     *****************************************************************************************************************/
    for (let i = 0; i < endPointList.length; i++) {
        let endPoint = endPointList[i];
        let mountName = endPoint["control-construct"];;
        let uuid = endPoint["logical-termination-point"];
        let localId = endPoint["layer-protocol"];
        let switchBothTransmittersOffResponseCode = await linkRelatedSwitchingOperationUtility.SwitchTransmittersOff(
            forwardingName,
            mountName,
            uuid,
            localId,
            requestHeaders,
            traceIndicatorIncrementer++
        )
        if (!switchBothTransmittersOffResponseCode || !switchBothTransmittersOffResponseCode.toString().startsWith("2")) {
            atleastOneSwitchTransmittersOffFailed = true;
            break;
        } else {
            atleastOneSwitchTransmittersOffFailed = false;
        }
    }
    switchBothTransmittersOff.atleastOneSwitchTransmittersOffFailed = atleastOneSwitchTransmittersOffFailed;
    switchBothTransmittersOff.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return switchBothTransmittersOff;
}

/**
 * Prepare attributes and automate 
 *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOn
 * @param {List}    endPointList end point details list of the link .
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
async function switchBothTransmittersOn(endPointList, requestHeaders, traceIndicatorIncrementer) {
    let atleastOneSwitchTransmittersOnFailed = true;
    let switchBothTransmittersOn = {};
    let forwardingName = "RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOn";

    /******************************************************************************************************************
     *  Prepare request and send to callback
     *  RequestForSwitchingRedundantTransmitterPairOffInitiatesTransaction.SwitchBothTransmittersOn
     *****************************************************************************************************************/
    for (let i = 0; i < endPointList.length; i++) {
        let endPoint = endPointList[i];
        let mountName = endPoint["control-construct"];
        let uuid = endPoint["logical-termination-point"];
        let localId = endPoint["layer-protocol"];
        let switchBothTransmittersOnResponseCode = await linkRelatedSwitchingOperationUtility.SwitchTransmittersOn(
            forwardingName,
            mountName,
            uuid,
            localId,
            requestHeaders,
            traceIndicatorIncrementer++
        )
        if (!switchBothTransmittersOnResponseCode || !switchBothTransmittersOnResponseCode.toString().startsWith("2")) {
            atleastOneSwitchTransmittersOnFailed = true;
            break;
        } else {
            atleastOneSwitchTransmittersOnFailed = false;
        }
    }
    switchBothTransmittersOn.atleastOneSwitchTransmittersOnFailed = atleastOneSwitchTransmittersOnFailed;
    switchBothTransmittersOn.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return switchBothTransmittersOn;
}
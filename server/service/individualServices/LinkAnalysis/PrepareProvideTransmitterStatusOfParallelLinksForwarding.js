/**
 * @file This module provides functionality to prepare and send /v1/provide-transmitter-status-of-parallel-links service forwardings
 * @module PrepareProvideTransmitterStatusOfParallelLinksForwarding.js
 **/

const individualServiceUtility = require('../IndividualServiceUtility');
const EventDispatcherWithResponse = require('../EventDispatcherWithResponse')
const onfFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');

/**
 * This method performs the set of procedure to provide transmitter status of parallel links.
 * @param {Object}  provideTransmitterStatusOfParallelLinksRequestBody request-body provided for service provideTransmitterStatusOfParallelLinks
 * @param {String}  requestId Id that is generated when request for service  provideTransmitterStatusOfParallelLinks received.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * The following are the list of forwarding-construct that will be automated to provide transmitter status of parallel links. 
 * 1. RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetParallelLinks
 * 2. RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.Response
 * 3. RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.DetermineLinkEndpoints
 * 4. RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceConfigFromCache
 * 5. RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceStatusFromLive
 * **/
exports.provideTransmitterStatusOfParallelLinks = async function (provideTransmitterStatusOfParallelLinksRequestBody, requestId, requestHeaders) {

    /****************************************************************************************
     * Fetching and setting the required variables
     ****************************************************************************************/

    let linkId = provideTransmitterStatusOfParallelLinksRequestBody["link-id"];
    let traceIndicator = requestHeaders.traceIndicator;
    let traceIndicatorIncrementer = Number(traceIndicator.charAt(traceIndicator.lastIndexOf(".") + 1));

    /*************************************************************************************************************
     *  Fetch parallel links by addressing callback 
     * RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetParallelLinks
     **************************************************************************************************************/

    let parallelLinks = await getParallelLinks(linkId, requestHeaders, traceIndicatorIncrementer++);

    /*****************************************************************************************************
     *  Formulate the request-body for callback and send request
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.Response
     ******************************************************************************************************/

    let parallelLinkListResponse = await formulateRequestBodyforResponse(parallelLinks, requestHeaders, traceIndicatorIncrementer);
    response(provideTransmitterStatusOfParallelLinksRequestBody, requestId, parallelLinkListResponse, requestHeaders);
}

/**
 * Prepare attributes and automate 
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetParallelLinks
 * @param {String}  linkId Identifier of the microwave link in the planning
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {List} returns parallelLinkList
 */
async function getParallelLinks(linkId, requestHeaders, traceIndicatorIncrementer) {
    let parallelLinkList = [];
    let forwardingName = "RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetParallelLinks";

    /******************************************************************************************************************
     * Prepare request and send to callback
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetParallelLinks
     *  MWDI://v1/provide-list-of-parallel-links
     *****************************************************************************************************************/

    let getParallelLinksRequestBody = {};
    getParallelLinksRequestBody.linkId = linkId;
    getParallelLinksRequestBody = await onfFormatter.modifyJsonObjectKeysToKebabCase(getParallelLinksRequestBody);
    let consequentOperationClient = await individualServiceUtility.getConsequentOperationClient(forwardingName);
    let parallelLinksResponse = await EventDispatcherWithResponse.dispatchEvent(
        consequentOperationClient.operationClientUuid,
        getParallelLinksRequestBody,
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        "POST"
    )
    if (parallelLinksResponse && Object.keys(parallelLinksResponse).length != 0) {
        parallelLinkList = parallelLinksResponse["parallel-link-list"];
    }
    return parallelLinkList;
}

/**
 * Prepare attributes and automate 
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.Response
 * @param {Object}  provideTransmitterStatusOfParallelLinksRequestBody request-body provided for service provideTransmitterStatusOfParallelLinks
 * @param {Object}  parallelLinkListResponse contains parallel-link-list and traceIndicatorIncrementer
 * @param {String}  requestId Id that is generated when request for service  provideTransmitterStatusOfParallelLinks received.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 */
async function response(provideTransmitterStatusOfParallelLinksRequestBody, requestId, parallelLinkListResponse, requestHeaders) {
    let requestorProtocol = provideTransmitterStatusOfParallelLinksRequestBody["requestor-protocol"];
    let requestorAddress = await individualServiceUtility.getConfiguredRemoteAddress(provideTransmitterStatusOfParallelLinksRequestBody["requestor-address"]);
    let requestorPort = provideTransmitterStatusOfParallelLinksRequestBody["requestor-port"];
    let requestorReceiveOperation = provideTransmitterStatusOfParallelLinksRequestBody["requestor-receive-operation"];

    /****************************************************************************************************
     *   Prepare request and send to 
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.Response
     *     provideTransmitterStatusOfParallelLinksRequestBody#requestor-receive-operation
     *****************************************************************************************************/
    let traceIndicatorIncrementer = 1;
    let requestBody = {
        requestId: requestId
    }
    if (parallelLinkListResponse) {
        traceIndicatorIncrementer = parallelLinkListResponse.traceIndicatorIncrementer;
        if (parallelLinkListResponse.parallelLinkList) {
            requestBody.parallelLinkList = parallelLinkListResponse.parallelLinkList;
        }
    }
    requestBody = await onfFormatter.modifyJsonObjectKeysToKebabCase(requestBody);
    EventDispatcherWithResponse.BuildAndTriggerRestRequestToRequestor(
        requestorProtocol,
        requestorAddress,
        requestorPort,
        requestorReceiveOperation,
        requestHeaders,
        requestBody,
        "POST",
        traceIndicatorIncrementer++);
}

/**
 * Prepare requestBody for callback 
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.Response by addressing callbacks
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.DetermineLinkEndpoints
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceConfigFromCache
 *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceStatusFromLive
 * @param {List}  parallelLinks parallel links list 
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator 
 * @returns parallelLinkListResponse contains parallel-link-list and traceIndicatorIncrementer
 */
async function formulateRequestBodyforResponse(parallelLinks, requestHeaders, traceIndicatorIncrementer) {
    let parallelLinkList = [];
    let parallelLinkListResponse = {};
    if (parallelLinks && parallelLinks.length !== 0) {
        for (let i = 0; i < parallelLinks.length; i++) {
            let parallelLinkDetails = {};
            let transmitterStatusList = [];
            let linkId = parallelLinks[i];
            if (parallelLinks.length > 1) {

                /****************************************************************************************
                 *  Fetching linkEndPointsDetails mountName , uuid , localId 
                 ****************************************************************************************/

                let linkEndPointsDetailsList = await determineLinkEndPoints(linkId, requestHeaders, traceIndicatorIncrementer++);
                if (linkEndPointsDetailsList) {
                    for (let j = 0; j < linkEndPointsDetailsList.length; j++) {
                        let linkEndPoint = linkEndPointsDetailsList[j];
                        let transmitterStatus = {
                            "transmissionModeMax": "",
                            "interfaceStatus": "",
                            "transmissionModeCur": "",
                        };

                        /****************************************************************************************
                         *  Fetching airInterfaceConfigFromCache, airInterfaceStatusFromLive 
                         *       and formulating transmitter-status-list
                         ****************************************************************************************/

                        let airInterfaceConfigFromCache = await getAirInterfaceConfigFromCache(linkEndPoint, requestHeaders, traceIndicatorIncrementer++);
                        let airInterfaceStatusFromLive = await getAirInterfaceStatusFromLive(linkEndPoint, requestHeaders, traceIndicatorIncrementer++);
                        if (airInterfaceConfigFromCache && airInterfaceStatusFromLive) {
                            if (airInterfaceConfigFromCache["transmission-mode-max"]) {
                                transmitterStatus.transmissionModeMax = airInterfaceConfigFromCache["transmission-mode-max"];
                            }
                            if (airInterfaceStatusFromLive["interface-status"]) {
                                transmitterStatus.interfaceStatus = airInterfaceStatusFromLive["interface-status"];
                            }
                            if (airInterfaceStatusFromLive["transmission-mode-cur"]) {
                                transmitterStatus.transmissionModeCur = airInterfaceStatusFromLive["transmission-mode-cur"];
                            }
                            transmitterStatusList.push(transmitterStatus);
                        }
                    }
                }
            }
            parallelLinkDetails.linkId = linkId;
            parallelLinkDetails.transmitterStatusList = transmitterStatusList;
            parallelLinkList.push(parallelLinkDetails);
        }
    }
    parallelLinkListResponse.parallelLinkList = parallelLinkList;
    parallelLinkListResponse.traceIndicatorIncrementer = traceIndicatorIncrementer;
    return parallelLinkListResponse;
}

/**
 * This method Receives end-point-list of link
 * @param {Object} linkId Identifier of the microwave link for which transmitters shall be reactivated
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {List} linkEndPointDetails 
 **/
async function determineLinkEndPoints(linkId, requestHeaders, traceIndicatorIncrementer) {
    let linkEndPointDetails = {};
    let linkEndPointDetailsList = [];
    let forwardingName = "RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.DetermineLinkEndpoints";
    let consequentOperationClient = await individualServiceUtility.getConsequentOperationClient(forwardingName);
    /****************************************************************************************************
     *   Prepare request and send to
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi
     *                                                                            .DetermineLinkEndpoints
     *     MWDI://core-model-1-4:network-control-domain=cache/link={uuid}
     *****************************************************************************************************/
    let pathParamList = [];
    pathParamList.push(linkId);
    let params = {};
    params = await individualServiceUtility.getQueryAndPathParameter(
        consequentOperationClient.operationName,
        pathParamList
    )
    let linkEndPointsResponse = await EventDispatcherWithResponse.dispatchEvent(
        consequentOperationClient.operationClientUuid, {},
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        "GET",
        params
    )
    if (linkEndPointsResponse && Object.keys(linkEndPointsResponse) !== 0) {
        let linkEndPoints = linkEndPointsResponse["core-model-1-4:link"];
        if (linkEndPoints && linkEndPoints.length !== 0) {
            let endPointsList = linkEndPoints[0]["end-point-list"];
            if (endPointsList) {
                for (let i = 0; i < endPointsList.length; i++) {
                    let endPoint = endPointsList[i];
                    if (Object.keys(endPoint) !== 0) {
                        linkEndPointDetails.mountName = endPoint["control-construct"];
                        linkEndPointDetails.uuid = endPoint["logical-termination-point"];
                        linkEndPointDetails.localId = endPoint["layer-protocol"];
                        linkEndPointDetailsList.push(linkEndPointDetails);
                    }
                }
            }
        }
    }
    return linkEndPointDetailsList;
}

/**
 * Prepare attributes and automate  
 * RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceStatusFromLive
 * @param {Object}  linkEndPointsDetails contains link end point details mountname , uuid, localId.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceStatusFromLive for linkEndPointsDetails
 */
async function getAirInterfaceStatusFromLive(linkEndPointsDetails, requestHeaders, traceIndicatorIncrementer) {
    let airInterfaceStatusFromLive = {};
    let forwardingName = "RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceStatusFromLive";
    let consequentOperationClient = await individualServiceUtility.getConsequentOperationClient(forwardingName);

    /****************************************************************************************************
     *   Prepare request and send to
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.
     *                                                                      GetAirInterfaceStatusFromLive
     *     MWDI://core-model-1-4:network-control-domain=live/control-construct={mountName}/
     *      logical-termination-point={uuid}/layer-protocol={localId}/
     *        air-interface-2-0:air-interface-pac/air-interface-status
     *****************************************************************************************************/

    let pathParamList = [];
    linkEndPointsDetails = undefined;
    if (linkEndPointsDetails) {
        pathParamList.push(linkEndPointsDetails.mountName);
        pathParamList.push(linkEndPointsDetails.uuid);
        pathParamList.push(linkEndPointsDetails.localId);
    }
    let params = {};
    let fields = await individualServiceUtility.getStringProfileInstanceValue(forwardingName);
    params = await individualServiceUtility.getQueryAndPathParameter(
        consequentOperationClient.operationName,
        pathParamList,
        fields
    )
    let airInterfaceStatusFromLiveResponse = await EventDispatcherWithResponse.dispatchEvent(
        consequentOperationClient.operationClientUuid, {},
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        "GET",
        params
    )
    if (airInterfaceStatusFromLiveResponse && Object.keys(airInterfaceStatusFromLiveResponse).length !== 0) {
        airInterfaceStatusFromLive = airInterfaceStatusFromLiveResponse["air-interface-2-0:air-interface-status"];
    }
    return airInterfaceStatusFromLive;
}

/**
 * Prepare attributes and automate  
 * RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceConfigFromCache
 * @param {Object}  linkEndPointsDetails contains link end point details mountname , uuid, localId.
 * @param {Object}  requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} returns airInterfaceConfiguration for linkEndPointsDetails
 */
async function getAirInterfaceConfigFromCache(linkEndPointsDetails, requestHeaders, traceIndicatorIncrementer) {
    let airInterfaceConfigFromCache = {};
    let forwardingName = "RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.GetAirInterfaceConfigFromCache";
    let consequentOperationClient = await individualServiceUtility.getConsequentOperationClient(forwardingName);

    /****************************************************************************************************
     *   Prepare request and send to
     *  RequestForProvidingTransmitterStatusOfParallelLinksCausesReadingTransmitterStatusFromMwdi.
     *                                                                      GetAirInterfaceConfigFromCache
     *     MWDI://core-model-1-4:network-control-domain=cache/control-construct={mountName}/
     *       logical-termination-point={uuid}/layer-protocol={localId}/
     *        air-interface-2-0:air-interface-pac/air-interface-configuration
     *****************************************************************************************************/

    let pathParamList = [];
    linkEndPointsDetails = undefined;
    if (linkEndPointsDetails) {
        pathParamList.push(linkEndPointsDetails.mountName);
        pathParamList.push(linkEndPointsDetails.uuid);
        pathParamList.push(linkEndPointsDetails.localId);
    }
    let params = {};
    let fields = await individualServiceUtility.getStringProfileInstanceValue(forwardingName);
    params = await individualServiceUtility.getQueryAndPathParameter(
        consequentOperationClient.operationName,
        pathParamList,
        fields
    );
    let airInterfaceConfigFromCacheResponse = await EventDispatcherWithResponse.dispatchEvent(
        consequentOperationClient.operationClientUuid, {},
        requestHeaders.user,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        "GET",
        params
    )
    if (airInterfaceConfigFromCacheResponse && Object.keys(airInterfaceConfigFromCacheResponse).length !== 0) {
        airInterfaceConfigFromCache = airInterfaceConfigFromCacheResponse["air-interface-2-0:air-interface-configuration"];
    }
    return airInterfaceConfigFromCache;
}
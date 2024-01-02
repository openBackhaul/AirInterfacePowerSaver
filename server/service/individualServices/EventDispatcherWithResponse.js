'use strict';

const LogicalTerminationPoint = require('onf-core-model-ap/applicationPattern/onfModel/models/LogicalTerminationPoint');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const HttpServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpServerInterface');
const HttpClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/HttpClientInterface');
const OnfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const RequestHeader = require('onf-core-model-ap/applicationPattern/rest/client/RequestHeader');
const RestRequestBuilder = require('onf-core-model-ap/applicationPattern/rest/client/RequestBuilder');
const ExecutionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');
const OperationServerInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationServerInterface');
const restClient = require('onf-core-model-ap/applicationPattern/rest/client/Client');

/**
 * This function formulates the request body based on the operation name and application 
 * @param {String} operationClientUuid uuid of the client operation that needs to be addressed
 * @param {object} httpRequestBody request body for the operation
 * @param {String} user username of the request initiator. 
 * @param {String} xCorrelator UUID for the service execution flow that allows to correlate requests and responses. 
 * @param {String} traceIndicator Sequence number of the request. 
 * @param {String} customerJourney Holds information supporting customer’s journey to which the execution applies.
 * @param {String} httpMethod method of the request if undefined defaults to POST
 * @param {Object} params path and query parameters
 */
exports.dispatchEvent = async function (operationClientUuid, httpRequestBody, user, xCorrelator, traceIndicator, customerJourney, httpMethod, params) {
    let responseData = {};
    let operationKey = await OperationClientInterface.getOperationKeyAsync(
        operationClientUuid);
    let operationName = await OperationClientInterface.getOperationNameAsync(
        operationClientUuid);

    let httpClientUuid = await LogicalTerminationPoint.getServerLtpListAsync(operationClientUuid);
    let serverApplicationName = await HttpClientInterface.getApplicationNameAsync(httpClientUuid[0]);
    let serverApplicationReleaseNumber = await HttpClientInterface.getReleaseNumberAsync(httpClientUuid[0]);
    let originator = await HttpServerInterface.getApplicationNameAsync();

    let httpRequestHeader = new RequestHeader(
        user,
        originator,
        xCorrelator,
        traceIndicator,
        customerJourney,
        operationKey
    );
    httpRequestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeader);

    let response = await RestRequestBuilder.BuildAndTriggerRestRequest(
        operationClientUuid,
        httpMethod,
        httpRequestHeader,
        httpRequestBody,
        params
    );
    let responseCode = response.status;
    if (responseCode.toString().startsWith("2")) {
        responseData = response.data;
        if ("code" in responseData) {
            if (!(responseData[code].toString().startsWith("2"))) {
                responseData = {};
            }
        }
    } else {
        ExecutionAndTraceService.recordServiceRequestFromClient(serverApplicationName, serverApplicationReleaseNumber, xCorrelator, traceIndicator, user, originator, operationName, responseCode, httpRequestBody, response.data)
            .catch((error) => console.log(`record service request ${JSON.stringify({
                xCorrelator,
                traceIndicator,
                user,
                originator,
                serverApplicationName,
                serverApplicationReleaseNumber,
                operationName,
                responseCode,
                reqBody: httpRequestBody,
                resBody: response.data
            })} failed with error: ${error.message}`));
    }
    return responseData;
}

/**
 * This function Builds and trigger request to the requestor 
 * @param {String} requestorProtocol protocol to address the requestor
 * @param {String} requestorAddress address of the requestor
 * @param {String} requestorPort port to address the requestor 
 * @param {String} requestorReceiveOperation operation name to address the requestor. 
 * @param {Object} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc. 
 * @param {Object} requestBody request body for the operation
 * @param {String} httpMethod method of the request
 * @param {Integer} traceIndicatorIncrementer traceIndicatorIncrementer to increment the trace indicator
 */
exports.BuildAndTriggerRestRequestToRequestor = async function (requestorProtocol, requestorAddress, requestorPort, requestorReceiveOperation, requestHeaders, requestBody, httpMethod, traceIndicatorIncrementer) {
    let url = requestorProtocol.toLowerCase() + "://" + requestorAddress + ":" + requestorPort +
        requestorReceiveOperation;

    /******************************************************************************************************************
     *  Fetching of Operation key to be updated based on the decision made on issue
     *  https://github.com/openBackhaul/AirInterfacePowerSaver/issues/114
     *****************************************************************************************************************/

    let operationUuid = await OperationServerInterface.getOperationServerUuidAsync(requestorReceiveOperation);
    let operationKey = await OperationServerInterface.getOperationKeyAsync(operationUuid);
    let originator = await HttpServerInterface.getApplicationNameAsync();
    let httpRequestHeader = new RequestHeader(
        requestHeaders.user,
        originator,
        requestHeaders.xCorrelator,
        requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
        requestHeaders.customerJourney,
        operationKey
    );
    httpRequestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(httpRequestHeader);
    let request = {
        method: httpMethod,
        url: url,
        headers: httpRequestHeader,
        data: requestBody
    }
    let responseBody = await restClient.post(request);
    return responseBody;
}
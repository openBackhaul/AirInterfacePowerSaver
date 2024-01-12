const IndividualServiceUtility = require('../IndividualServiceUtility');
const eventDispatcher = require('../EventDispatcherWithResponse');
const createHttpError = require('http-errors');

/**
 * This method configures the transmitter-is-on to true for respective device
 * @param {String} mountName Identifier of the device from the link endpoint address triplet
 * @param {Object} uuid Identifier of the LTP from the link endpoint address triplet
 * @param {String} localId Identifier of the LayerProtocol from the link endpoint address triplet
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Integer} response-code
 **/
exports.SwitchTransmittersOn = async function (forwardingNameForSwitchTransmitterOn, mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer) {
    let responseCode;
    try {
        /****************************************************************************************************
         *     MWDG://core-model-1-4:network-control-domain=live/control-construct={mountName}
         *          /logical-termination-point={uuid}/layer-protocol={localId}
         *          /air-interface-2-0:air-interface-pac/air-interface-configuration/transmitter-is-on
         *****************************************************************************************************/
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
exports.SwitchTransmittersOff = async function (forwardingNameForSwitchTransmitterOff, mountName, uuid, localId, requestHeaders, traceIndicatorIncrementer) {
    let responseCode;
    try {
        /****************************************************************************************************
         *     MWDG://core-model-1-4:network-control-domain=live/control-construct={mountName}
         *          /logical-termination-point={uuid}/layer-protocol={localId}
         *          /air-interface-2-0:air-interface-pac/air-interface-configuration/transmitter-is-on
         *****************************************************************************************************/
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
exports.ReportPowerSavingStatus = async function (forwardingNameForReportPowerSavingStatus, requestBody, requestHeaders, traceIndicatorIncrementer) {
    let response = {};
    try {
        /****************************************************************************************************
         *     AIPS://v1/record-power-saving-status
         *****************************************************************************************************/
        let consequentOperationForReportPowerSavingStatus = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForReportPowerSavingStatus);
        let operationClientUuid = consequentOperationForReportPowerSavingStatus.operationClientUuid;
        response = await eventDispatcher.dispatchEvent(
            operationClientUuid,
            requestBody,
            requestHeaders.user,
            requestHeaders.xCorrelator,
            requestHeaders.traceIndicator + "." + traceIndicatorIncrementer,
            requestHeaders.customerJourney,
            "POST", {}
        );
    } catch (error) {
        console.log(error);
        return (new createHttpError.InternalServerError(`${error}`));
    }
    return response;
}
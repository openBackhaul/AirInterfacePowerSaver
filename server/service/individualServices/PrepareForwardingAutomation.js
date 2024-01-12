const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');
const IndividualServiceUtility = require('./IndividualServiceUtility');
const eventDispatcher = require('./EventDispatcherWithResponse');
const createHttpError = require('http-errors');

exports.OAMLayerRequest = function (uuid) {
    return new Promise(async function (resolve, reject) {
      let forwardingConstructAutomationList = [];
      try {
  
        /***********************************************************************************
         * forwardings for application layer topology
         ************************************************************************************/
        let applicationLayerTopologyForwardingInputList = await prepareALTForwardingAutomation.getALTForwardingAutomationInputForOamRequestAsync(
          uuid
        );
  
        if (applicationLayerTopologyForwardingInputList) {
          for (let i = 0; i < applicationLayerTopologyForwardingInputList.length; i++) {
            let applicationLayerTopologyForwardingInput = applicationLayerTopologyForwardingInputList[i];
            forwardingConstructAutomationList.push(applicationLayerTopologyForwardingInput);
          }
        }
  
        resolve(forwardingConstructAutomationList);
      } catch (error) {
        reject(error);
      }
    });
  }


  /**
 * This method Receives end-point-list of link
 * @param {Object} linkId Identifier of the microwave link for which transmitters shall be reactivated
 * @param {String} requestHeaders Holds information of the requestHeaders like Xcorrelator , CustomerJourney,User etc.
 * @param {Object} traceIndicatorIncrementer to increment the trace indicator
 * @returns {Object} linkEndPoints 
 **/
exports.DetermineLinkEndpoints = async function (forwardingNameForDetermineLinkEndpoints, linkId, requestHeaders, traceIndicatorIncrementer) {
  let linkEndPoints = [];
  try {
      /****************************************************************************************************
       *     MWDI://core-model-1-4:network-control-domain=cache/link={uuid}
       *****************************************************************************************************/
      let consequentOperationForDetermineLinkEndpoints = await IndividualServiceUtility.getConsequentOperationClient(forwardingNameForDetermineLinkEndpoints);
      let operationClientUuid = consequentOperationForDetermineLinkEndpoints.operationClientUuid;
      let operationName = consequentOperationForDetermineLinkEndpoints.operationName;
      let pathParamList = [];
      pathParamList.push(linkId);
      let params = await IndividualServiceUtility.getQueryAndPathParameter(operationName, pathParamList);

      let coreModelLinkResponse = await eventDispatcher.dispatchEvent(
          operationClientUuid, {},
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
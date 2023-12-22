const prepareALTForwardingAutomation = require('onf-core-model-ap-bs/basicServices/services/PrepareALTForwardingAutomation');

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
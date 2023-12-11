'use strict';

var IndividualServices = require('../service/IndividualServicesService');
var responseCodeEnum = require('onf-core-model-ap/applicationPattern/rest/server/ResponseCode');
var restResponseHeader = require('onf-core-model-ap/applicationPattern/rest/server/ResponseHeader');
var restResponseBuilder = require('onf-core-model-ap/applicationPattern/rest/server/ResponseBuilder');
var executionAndTraceService = require('onf-core-model-ap/applicationPattern/services/ExecutionAndTraceService');

module.exports.bequeathYourDataAndDie = function bequeathYourDataAndDie(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.bequeathYourDataAndDie(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteLinkFromPowerSavingTable = async function deleteLinkFromPowerSavingTable(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = "";
  let responseBodyToDocument = "";
  await IndividualServices.deleteLinkFromPowerSavingTable(body)
    .then(async function (responseBody) {
      responseCode = responseBody.responseCode;
      responseBodyToDocument = responseBody.responseBody; 
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    }).catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.listAffectedLinks = async function listAffectedLinks(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.listAffectedLinks(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.response;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    }).catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.listPowerSavingStatus = async function listPowerSavingStatus(req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.listPowerSavingStatus()
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.response;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.listToBeRestoredLinks = async function listToBeRestoredLinks(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.listToBeRestoredLinks(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.response;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    }).catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.providePowerSavingStatusOfLink = async function providePowerSavingStatusOfLink(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.OK;
  let responseBodyToDocument = {};
  await IndividualServices.providePowerSavingStatusOfLink(body)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody.response;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.provideTransmitterStatusOfParallelLinks = function provideTransmitterStatusOfParallelLinks(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.provideTransmitterStatusOfParallelLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.reactivateTransmittersOfLink = function reactivateTransmittersOfLink(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.reactivateTransmittersOfLink(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receivePowerSavingActivationStatus = async function receivePowerSavingActivationStatus(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  let responseBodyToDocument = {};
  await IndividualServices.receivePowerSavingActivationStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.receivePowerSavingDeactivationStatus = async function receivePowerSavingDeactivationStatus(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  let responseBodyToDocument = {};
  IndividualServices.receivePowerSavingDeactivationStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(async function (responseBody) {
      responseBodyToDocument = responseBody;
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      restResponseBuilder.buildResponse(res, responseCode, responseBody, responseHeader);
    })
    .catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.receiveTransmitterStatusOfParallelLinks = function receiveTransmitterStatusOfParallelLinks(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.receiveTransmitterStatusOfParallelLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.recordPowerSavingStatus = async function recordPowerSavingStatus(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  let startTime = process.hrtime();
  let responseCode = responseCodeEnum.code.NO_CONTENT;
  let responseBodyToDocument = undefined;
  await IndividualServices.recordPowerSavingStatus(body)
    .then(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url, responseBody.took);
      restResponseBuilder.buildResponse(res, responseCode, responseBodyToDocument, responseHeader);
    }).catch(async function (responseBody) {
      let responseHeader = await restResponseHeader.createResponseHeader(xCorrelator, startTime, req.url);
      let sentResp = restResponseBuilder.buildResponse(res, undefined, responseBody, responseHeader);
      responseCode = sentResp.code;
      responseBodyToDocument = sentResp.body;
    });
  executionAndTraceService.recordServiceRequest(xCorrelator, traceIndicator, user, originator, req.url, responseCode, req.body, responseBodyToDocument);
};

module.exports.switchRedundantTransmitterPairOff = function switchRedundantTransmitterPairOff(req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.switchRedundantTransmitterPairOff(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

'use strict';

var utils = require('../utils/writer.js');
var IndividualServices = require('../service/IndividualServicesService');

module.exports.bequeathYourDataAndDie = function bequeathYourDataAndDie (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.bequeathYourDataAndDie(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteLinkFromPowerSavingTable = function deleteLinkFromPowerSavingTable (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.deleteLinkFromPowerSavingTable(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listAffectedLinks = function listAffectedLinks (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listAffectedLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listPowerSavingStatus = function listPowerSavingStatus (req, res, next, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listPowerSavingStatus(user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.listToBeRestoredLinks = function listToBeRestoredLinks (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.listToBeRestoredLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.providePowerSavingStatusOfLink = function providePowerSavingStatusOfLink (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.providePowerSavingStatusOfLink(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.provideTransmitterStatusOfParallelLinks = function provideTransmitterStatusOfParallelLinks (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.provideTransmitterStatusOfParallelLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.reactivateTransmittersOfLink = function reactivateTransmittersOfLink (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.reactivateTransmittersOfLink(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receivePowerSavingActivationStatus = function receivePowerSavingActivationStatus (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.receivePowerSavingActivationStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receivePowerSavingDeactivationStatus = function receivePowerSavingDeactivationStatus (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.receivePowerSavingDeactivationStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.receiveTransmitterStatusOfParallelLinks = function receiveTransmitterStatusOfParallelLinks (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.receiveTransmitterStatusOfParallelLinks(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.recordPowerSavingStatus = function recordPowerSavingStatus (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.recordPowerSavingStatus(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.switchRedundantTransmitterPairOff = function switchRedundantTransmitterPairOff (req, res, next, body, user, originator, xCorrelator, traceIndicator, customerJourney) {
  IndividualServices.switchRedundantTransmitterPairOff(body, user, originator, xCorrelator, traceIndicator, customerJourney)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

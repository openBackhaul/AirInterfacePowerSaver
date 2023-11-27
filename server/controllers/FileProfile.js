'use strict';

var utils = require('../utils/writer.js');
var FileProfile = require('../service/FileProfileService');

module.exports.getFileProfileFileDescription = function getFileProfileFileDescription (req, res, next, uuid) {
  FileProfile.getFileProfileFileDescription(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getFileProfileFileIdentifier = function getFileProfileFileIdentifier (req, res, next, uuid) {
  FileProfile.getFileProfileFileIdentifier(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getFileProfileFileName = function getFileProfileFileName (req, res, next, uuid) {
  FileProfile.getFileProfileFileName(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getFileProfileOperation = function getFileProfileOperation (req, res, next, uuid) {
  FileProfile.getFileProfileOperation(uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putFileProfileFileName = function putFileProfileFileName (req, res, next, body, uuid) {
  FileProfile.putFileProfileFileName(body, uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putFileProfileOperation = function putFileProfileOperation (req, res, next, body, uuid) {
  FileProfile.putFileProfileOperation(body, uuid)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

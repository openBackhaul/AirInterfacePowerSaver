'use strict';


/**
 * Returns the description of the file
 *
 * uuid String 
 * returns inline_response_200_25
 **/
exports.getFileProfileFileDescription = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "file-profile-1-0:file-description" : "Holds administrator-names, user-names, authorization codes and allowed-methods."
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns the identifier of the file
 *
 * uuid String 
 * returns inline_response_200_24
 **/
exports.getFileProfileFileIdentifier = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "file-profile-1-0:file-identifier" : "applicationData"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns the name of the file
 *
 * uuid String 
 * returns inline_response_200_26
 **/
exports.getFileProfileFileName = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "file-profile-1-0:file-name" : "application-data.json"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Returns the allowed operation on the file
 *
 * uuid String 
 * returns inline_response_200_27
 **/
exports.getFileProfileOperation = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "file-profile-1-0:operation" : "file-profile-1-0:OPERATION_TYPE_READ_ONLY"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Configures name of the file
 *
 * body Fileprofileconfiguration_filename_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileFileName = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Configures the allowed operation on the file
 *
 * body Fileprofileconfiguration_operation_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putFileProfileOperation = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


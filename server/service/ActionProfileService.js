'use strict';

const fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');

/**
 * Returns the reference on the consequent operation
 *
 * uuid String 
 * returns inline_response_200_18
 **/
exports.getActionProfileConsequentOperationReference = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "action-profile-1-0:consequent-operation-reference": value
  };
}

/**
 * Returns whether to be presented in new browser window
 *
 * uuid String 
 * returns inline_response_200_17
 **/
exports.getActionProfileDisplayInNewBrowserWindow = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "action-profile-1-0:display-in-new-browser-window": value
  };
}

/**
 * Returns the list of input values
 *
 * uuid String 
 * returns inline_response_200_16
 **/
exports.getActionProfileInputValueListt = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "action-profile-1-0:input-value-list": value
  };
}


/**
 * Returns the Label of the Action
 *
 * uuid String 
 * returns inline_response_200_15
 **/
exports.getActionProfileLabel = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "action-profile-1-0:label": value
  };
}


/**
 * Returns the name of the Operation
 *
 * uuid String 
 * returns inline_response_200_14
 **/
exports.getActionProfileOperationName = async function(url) {
  const value = await fileOperation.readFromDatabaseAsync(url);
  return {
    "action-profile-1-0:operation-name": value
  };
}


/**
 * Configures the reference on the consequent operation
 *
 * body Actionprofileconfiguration_consequentoperationreference_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putActionProfileConsequentOperationReference = async function(body,url) {
  await fileOperation.writeToDatabaseAsync(url, body, false);
}


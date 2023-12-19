'use strict';

var fileOperation = require('onf-core-model-ap/applicationPattern/databaseDriver/JSONDriver');
const { elasticsearchService, getApiKeyAsync, getIndexAliasAsync } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const ElasticsearchPreparation = require('./individualServices/ElasticsearchPreparation');

/**
 * Returns API key
 *
 * uuid String 
 * returns inline_response_200_56
 **/
exports.getElasticsearchClientApiKey = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "elasticsearch-client-interface-1-0:api-key": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns index alias
 *
 * uuid String 
 * returns inline_response_200_57
 **/
exports.getElasticsearchClientIndexAlias = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "elasticsearch-client-interface-1-0:index-alias": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns life cycle state of the connection towards Elasticsearch
 *
 * uuid String 
 * returns inline_response_200_60
 **/
exports.getElasticsearchClientLifeCycleState = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "elasticsearch-client-interface-1-0:life-cycle-state": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns operational state of the connection towards Elasticsearch
 *
 * uuid String 
 * returns inline_response_200_59
 **/
exports.getElasticsearchClientOperationalState = function(url) {
  return new Promise(async function (resolve, reject) {
    try {
      var value = await fileOperation.readFromDatabaseAsync(url);
      var response = {};
      response['application/json'] = {
        "elasticsearch-client-interface-1-0:operational-state": value
      };
      if (Object.keys(response).length > 0) {
        resolve(response[Object.keys(response)[0]]);
      } else {
        resolve();
      }
    } catch (error) {
      reject();
    }
  });
}


/**
 * Returns service records policy
 *
 * uuid String 
 * returns inline_response_200_58
 **/
exports.getElasticsearchClientServiceRecordsPolicy = function(uuid) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "elasticsearch-client-interface-1-0:service-records-policy" : {
    "service-records-policy-name" : "eatl_service_records_policy",
    "phases" : {
      "hot" : {
        "min-age" : "30s",
        "actions" : {
          "rollover" : {
            "max-age" : "5d"
          }
        }
      },
      "delete" : {
        "min-age" : "5d",
        "actions" : { }
      }
    }
  }
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Configures API key
 *
 * body Auth_apikey_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putElasticsearchClientApiKey = async function(url, body, uuid) {
  let oldValue = await getApiKeyAsync(uuid);
  if (oldValue !== body['elasticsearch-client-interface-1-0:api-key']) {
    await fileOperation.writeToDatabaseAsync(url, body, false);
    // recreate the client with new connection data
    await elasticsearchService.getClient(true, uuid);
    await ElasticsearchPreparation();
  }
}


/**
 * Configures index alias
 *
 * body Elasticsearchclientinterfaceconfiguration_indexalias_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putElasticsearchClientIndexAlias = async function(url, body, uuid) {
  let oldValue = await getIndexAliasAsync(uuid);
  if (oldValue !== body['elasticsearch-client-interface-1-0:index-alias']) {
    await fileOperation.writeToDatabaseAsync(url, body, false);
    await ElasticsearchPreparation();
  }
}


/**
 * Configures service records policy
 *
 * body Elasticsearchclientinterfaceconfiguration_servicerecordspolicy_body 
 * uuid String 
 * no response value expected for this operation
 **/
exports.putElasticsearchClientServiceRecordsPolicy = function(body,uuid) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


'use strict';
const createHttpError = require('http-errors');
const PssAttributes = require('./powerSavingAttributes');
const { getIndexAliasAsync, createResultArray, elasticsearchService } = require('onf-core-model-ap/applicationPattern/services/ElasticsearchService');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();

/**
   * @description add deviation to a power saving status entry for given link
   * @param {String} linkId Identifier of the microwave link for which the entry shall be created or updated
   * @param {String} addDeviationFromOriginalState Name of the module causing a deviation from the original state
   * @param {String} addModuleToRestoreOriginalState Name of the module to restore the original state
   * @returns {Promise<String>} took
   */
exports.addDeviationToPowerSavingStatusEntry = async function (linkId, addDeviationFromOriginalState, addModuleToRestoreOriginalState) {
  let took = 0;
  try {
    let response = await exports.getPowerSavingStatusOfLink(linkId);
    let powerSavingStatusEntry = response.powerSavingStatusEntry;
    took = response.took;
    if (powerSavingStatusEntry == undefined) {
      /****************************************************************************************
       * Creating an entry in power saving status table If link-id is not present
       ****************************************************************************************/
      let powerSavingStatusEntryToBeCreated = {};
      powerSavingStatusEntryToBeCreated[PssAttributes.LINK.LINK_ID] = linkId;
      powerSavingStatusEntryToBeCreated[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = [addDeviationFromOriginalState];
      powerSavingStatusEntryToBeCreated[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = [addModuleToRestoreOriginalState];
      response = await exports.createOrUpdatePowerSavingStatusOfLinkAsync(powerSavingStatusEntryToBeCreated);
      took = took + response.took;
    } else {
      /****************************************************************************************
       * Updating the existing entry in power saving status table for given link-id
       ****************************************************************************************/
      let deviationFromOriginalStateList = [];
      if (powerSavingStatusEntry.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST)) {
        deviationFromOriginalStateList = powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST];
      }
      deviationFromOriginalStateList.push(addDeviationFromOriginalState);
      powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = [... new Set(deviationFromOriginalStateList)];

      let moduleToRestoreOriginalStateList = [];
      if (powerSavingStatusEntry.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST)) {
        moduleToRestoreOriginalStateList = powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
      }
      moduleToRestoreOriginalStateList.push(addModuleToRestoreOriginalState);
      powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = [... new Set(moduleToRestoreOriginalStateList)];

      response = await exports.createOrUpdatePowerSavingStatusOfLinkAsync(powerSavingStatusEntry);
      took = took + response.took;
    }
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError(`${error}`);
  }
  return took;
}

/**
   * @description remove deviation from a power saving status entry for given link
   * @param {String} linkId Identifier of the microwave link for which the entry shall be updated
   * @param {String} addDeviationFromOriginalState Name of the module causing a deviation from the original state
   * @param {String} addModuleToRestoreOriginalState Name of the module to restore the original state
   * @returns {Promise<String>} took
   */
exports.removeDeviationFromPowerSavingStatusEntry = async function (linkId, removeDeviationFromOriginalState, removeModuleToRestoreOriginalState) {
  let took = 0;
  try {
    let response = await exports.getPowerSavingStatusOfLink(linkId);
    let powerSavingStatusEntry = response.powerSavingStatusEntry;
    took = response.took;
    if (powerSavingStatusEntry != undefined) {
      /****************************************************************************************
       * Remove matching entry from power saving status table
       ****************************************************************************************/
      if (powerSavingStatusEntry.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST)) {
        let deviationFromOriginalStateList = powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST];
        powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = deviationFromOriginalStateList.filter((deviationFromOriginalState) => {
          return deviationFromOriginalState != removeDeviationFromOriginalState;
        });
      }
      if (powerSavingStatusEntry.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST)) {
        let moduleToRestoreOriginalStateList = powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
        powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = moduleToRestoreOriginalStateList.filter((moduleToRestoreOriginalState) => {
          return moduleToRestoreOriginalState != removeModuleToRestoreOriginalState;
        });
      }
      response = await exports.createOrUpdatePowerSavingStatusOfLinkAsync(powerSavingStatusEntry);
      took = took + response.took;
    }
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError(`${error}`);
  }
  return took;
}

/**
   * @description document measure for resolving a potentially undefined state for given link
   * @param {String} linkId Identifier of the microwave link for which the entry shall be created or updated
   * @param {String} addModuleToRestoreOriginalState Name of the module to restore the original state
   * @returns {Promise<String>} took
   */
exports.documentMeasureForUndefinedState = async function (linkId, addModuleToRestoreOriginalState) {
  let took = 0;
  try {
    let response = await exports.getPowerSavingStatusOfLink(linkId);
    let powerSavingStatusEntry = response.powerSavingStatusEntry;
    took = response.took;
    if (powerSavingStatusEntry == undefined) {
      /****************************************************************************************
       * Creating an entry in power saving status table If link-id is not present
       ****************************************************************************************/
      let powerSavingStatusEntryToBeCreated = {};
      powerSavingStatusEntryToBeCreated[PssAttributes.LINK.LINK_ID] = linkId;
      powerSavingStatusEntryToBeCreated[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = [];
      powerSavingStatusEntryToBeCreated[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = [addModuleToRestoreOriginalState];
      response = await exports.createOrUpdatePowerSavingStatusOfLinkAsync(powerSavingStatusEntryToBeCreated);
      took = took + response.took;
    } else {
      /****************************************************************************************
       * Updating the existing entry in power saving status table for given link-id
       ****************************************************************************************/
      if (!powerSavingStatusEntry.hasOwnProperty(PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST)) {
        powerSavingStatusEntry[PssAttributes.DEVIATION_FROM_ORIGINAL_STATE.LIST] = [];
      }

      let moduleToRestoreOriginalStateList = [];
      if (powerSavingStatusEntry.hasOwnProperty(PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST)) {
        moduleToRestoreOriginalStateList = powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST];
      }
      moduleToRestoreOriginalStateList.push(addModuleToRestoreOriginalState);
      powerSavingStatusEntry[PssAttributes.MODULE_TO_RESTORE_ORIGINAL_STATE.LIST] = [... new Set(moduleToRestoreOriginalStateList)];

      response = await exports.createOrUpdatePowerSavingStatusOfLinkAsync(powerSavingStatusEntry);
      took = took + response.took;
    }
  } catch (error) {
    console.log(error);
    return new createHttpError.InternalServerError(`${error}`);
  }
  return took;
}

/**
   * @description Given any link-id, return its power saving status entry from Elasticsearch.
   * @param {String} linkId document id configured for given link and it's power saving status.
   * @returns {Promise<Object>} { powerSavingStatusEntry, took }
   */
exports.getPowerSavingStatusOfLink = async function (linkId) {
  let indexAlias = await getIndexAliasAsync();
  let client = await elasticsearchService.getClient(false);
  let res = await client.search({
    index: indexAlias,
    filter_path: "took, hits.hits",
    body: {
      "query": {
        "term": {
          "_id": linkId
        }
      }
    }
  });
  if (res.body.hits === undefined) {
    console.log(`Power saving status for link  ${linkId} is not present`);
    return { "took": res.body.took };
  }
  let powerSavingStatusEntry = createResultArray(res);
  return { "powerSavingStatusEntry": powerSavingStatusEntry[0], "took": res.body.took };
}

/**
   * @description Exports the power saving status table from Elasticsearch.
   * @returns {Promise<Object>} { powerSavingStatusEntryTable, took }
   */
exports.getPowerSavingStatusTable = async function () {
  let indexAlias = await getIndexAliasAsync();
  let client = await elasticsearchService.getClient(false);
  let res = await client.search({
    index: indexAlias,
    from: 0,
    size: 9999,
    body: {
      "query": {
        match_all: {} 
      }
    }
  });
  if (res.body.hits === undefined) {
    console.log(`Power saving status table could not be retrieved`);
    return {"powerSavingStatusEntryTable": [], "took": res.body.took };
  }
  let powerSavingStatusEntryTable = createResultArray(res);
  return { powerSavingStatusEntryTable, "took": res.body.took };
}

/**
* @description Creates or updates a link and it's power saving status in Elastic search.
* @param {Object} powerSavingStatusOfLink the link to be updated
* @returns {Promise<Object>} { took }
**/
exports.createOrUpdatePowerSavingStatusOfLinkAsync = async function (powerSavingStatusOfLink) {

  let indexAlias = await getIndexAliasAsync();
  let client = await elasticsearchService.getClient(false);
  let startTime = process.hrtime();
  let linkId = powerSavingStatusOfLink[PssAttributes.LINK.LINK_ID];
  let res = await lock.acquire(linkId, async () => {
    let response;
    response = await client.index({
      index: indexAlias,
      id: linkId,
      refresh: true,
      body: powerSavingStatusOfLink
    });
    return response;
  });
  let backendTime = process.hrtime(startTime);
  if (res.body.result === 'created' || res.body.result === 'updated') {
    return { "took": backendTime[0] * 1000 + backendTime[1] / 1000000 };
  }
}

/**
* @description Creates or updates a link and it's power saving status in Elastic search.
* @param {Object} powerSavingStatusOfLink the link to be updated
* @returns {Promise<Object>} { took }
**/
exports.deletePowerSavingStatusOfLinkAsync = async function (linkId) {
  let indexAlias = await getIndexAliasAsync();
  let client = await elasticsearchService.getClient(false);
  let startTime = process.hrtime();
  let res = await lock.acquire(linkId, async () => {
    let response;
    response = await client.delete({
      index: indexAlias,
      refresh: true,
      id: linkId
    });
    return response;
  });
  let backendTime = process.hrtime(startTime);
  if (res.body.result === 'deleted') {
    return { "took": backendTime[0] * 1000 + backendTime[1] / 1000000 };
  }
}
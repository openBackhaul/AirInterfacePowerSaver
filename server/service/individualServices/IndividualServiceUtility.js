'use strict';

const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');
const onfAttributes = require('onf-core-model-ap/applicationPattern/onfModel/constants/OnfAttributes');
const OperationClientInterface = require('onf-core-model-ap/applicationPattern/onfModel/models/layerProtocols/OperationClientInterface');
const ForwardingDomain = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingDomain');
const ForwardingConstruct = require('onf-core-model-ap/applicationPattern/onfModel/models/ForwardingConstruct');
const OnfAttributeFormatter = require('onf-core-model-ap/applicationPattern/onfModel/utility/OnfAttributeFormatter');
const restClient = require('onf-core-model-ap/applicationPattern/rest/client/Client');
const createHttpError = require('http-errors');
const Qs = require('qs');

/**
 * This function fetches the string value from the string profile based on the expected string name.
 * @param {String} expectedStringName string name of the string profile.
 * @return {String} string value of the string profile.
 */
exports.getStringProfileInstanceValue = async function (expectedStringName) {
  let stringValue = "";
  try {
    let stringProfileName = "string-profile-1-0:PROFILE_NAME_TYPE_STRING_PROFILE";
    let stringProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(stringProfileName);

    for (let i = 0; i < stringProfileInstanceList.length; i++) {
      let stringProfileInstance = stringProfileInstanceList[i];
      let stringProfilePac = stringProfileInstance[onfAttributes.STRING_PROFILE.PAC];
      let stringProfileCapability = stringProfilePac[onfAttributes.STRING_PROFILE.CAPABILITY];
      let stringName = stringProfileCapability[onfAttributes.STRING_PROFILE.STRING_NAME];
      if (stringName == expectedStringName) {
        console.log(stringName);
        let stringProfileConfiguration = stringProfilePac[onfAttributes.STRING_PROFILE.CONFIGURATION];
        stringValue = stringProfileConfiguration[onfAttributes.STRING_PROFILE.STRING_VALUE];
        break;
      }
    }
    console.log(stringValue);
    return stringValue;

  } catch (error) {
    console.log(`getStringProfileInstanceValue is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}

/**
 * This function formulates the query and path parameters from operationName and fields.
 * @param {String} operationName name of the operation to fetch path parameters key .
 * @param {List} pathParamList path parameters value list.
 * @param {String} fields query parameters.
 * @return {Object} params that contains query and path parameters.
 */
exports.getQueryAndPathParameter = async function (operationName, pathParamList, fields) {
  try {
    let pathParams = new Map();
    let queryParams = {};
    let params = {};

    if (pathParamList && (pathParamList.length !== 0)) {
      let pathParamMatches = operationName.match(/\{(.*?)\}/g);
      for (let i = 0; i < pathParamList.length; i++) {
        pathParams.set(pathParamMatches[i], pathParamList[i]);
      }
      params.path = pathParams;
    }

    if (fields && fields !== "") {
      queryParams.fields = fields;
      params.query = queryParams;
    }

    return params;

  } catch (error) {
    console.log(`getQueryAndPathParameter is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
}


/**
 * This function gets the consequent operation details like op-c uuid , operation-name, field parameters.
 * @param {String} forwardingConstructName name of the forwarding construct to fetch consequent op-c uuid.
 * @return {Object} consequentOperationClient that contains op-c uuid , operation-name.
 */
exports.getConsequentOperationClient = async function (forwardingConstructName) {
  let consequentOperationClient = {};
  try {
    let forwardingConstructInstance = await ForwardingDomain.getForwardingConstructForTheForwardingNameAsync(forwardingConstructName);
    let outputFcPortForFc = await ForwardingConstruct.getOutputFcPortsAsync(forwardingConstructInstance[onfAttributes.GLOBAL_CLASS.UUID]);
    consequentOperationClient.operationClientUuid = outputFcPortForFc[0][onfAttributes.FC_PORT.LOGICAL_TERMINATION_POINT];
    consequentOperationClient.operationName = await OperationClientInterface.getOperationNameAsync(consequentOperationClient.operationClientUuid);
  } catch (error) {
    console.log(`consequentOperationClient is not success with ${error}`);
    return new createHttpError.InternalServerError();
  }
  return consequentOperationClient;
}

/**
 * This function generates the request-id
 * @param {String} linkId Identifier of the microwave link for which user requested data.
 * @return {requestId} requestId that is generated in the format "linkId-CurrentDate-CurrentTime".
 */
exports.generateRequestId = async function (linkId) {
  let requestId = '';
  try {
    let currentDate = new Date();
    let formattedDate = currentDate.getDate().toString() +
      (currentDate.getMonth() + 1).toString() +
      currentDate.getFullYear().toString() + '-' +
      currentDate.getHours().toString() +
      currentDate.getMinutes().toString() +
      currentDate.getSeconds().toString();
    requestId = linkId + '-' + formattedDate;
    return requestId;
  } catch (error) {
    console.log(error);
    return (new createHttpError.InternalServerError(`${error}`));
  }
}

/**
 * This function triggers the rest request based on data given. 
 * @param {String} httpMethod http method of the request.
 * @param {String} remoteProtocol remote protocol for trigerring the request.
 * @param {Object} remoteAddress remote address for trigerring the request
 * @param {String} remotePort remote port for trigerring the request 
 * @param {String} operationName operation name to which the request shall be trigerred.
 * @param {Object} requestHeader Holds information about all required header parameters to be sent in request.
 * @param {Object} requestBody request body to be sent in request
 * @param {Object} params path and query parameters
 * @return response Response receiving from the request
 */
exports.triggerRestRequest = async function (httpMethod, remoteProtocol, remoteAddress, remotePort, operationName, requestHeader, requestBody, params) {
  try {
    let pathParams = new Map();
    let queryParams = {};
    if (params) {
      queryParams = params.query;
      pathParams = params.path;
      if (pathParams) {
        pathParams.forEach((value, param) => {
          operationName = operationName.replace(param, value)
        });
      }
    }
    remoteAddress = await exports.getConfiguredRemoteAddress(remoteAddress);
    let remotePath = remoteProtocol.toLowerCase() + "://" + remoteAddress + ":" + remotePort;
    if (operationName.indexOf("/") !== 0) {
      operationName = "/" + operationName
    }
    let url = remotePath + operationName;
    requestHeader = OnfAttributeFormatter.modifyJsonObjectKeysToKebabCase(requestHeader);
    let request = {
      method: httpMethod,
      url: url,
      headers: requestHeader,
      data: requestBody,
      paramsSerializer: function (params) {
        return Qs.stringify(params, {
          arrayFormat: 'brackets'
        })
      }
    }
    let response = await restClient.post(request);
    console.log("\n callback : " + httpMethod + " " + url + " header :" + JSON.stringify(requestHeader) +
      "body :" + JSON.stringify(requestBody) + "response code:" + response.status)
    return response;
  } catch (error) {
    console.log(error);
    return (new createHttpError.InternalServerError(`${error}`));
  }
}

/**
 * This function gets the configured remote address from the given object.
 * @param {Object} remoteAddress remote address object that contains actual ip-address/domain-name
 * @return {String} filtered remote-address
 */
exports.getConfiguredRemoteAddress = async function (remoteAddress) {
  let domainName = onfAttributes.TCP_CLIENT.DOMAIN_NAME;
  if (domainName in remoteAddress) {
    remoteAddress = remoteAddress["domain-name"];
  } else {
    remoteAddress = remoteAddress[
      onfAttributes.TCP_CLIENT.IP_ADDRESS][
      onfAttributes.TCP_CLIENT.IPV_4_ADDRESS
    ];
  }
  return remoteAddress;
}
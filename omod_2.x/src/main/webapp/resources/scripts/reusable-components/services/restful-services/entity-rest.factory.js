/*
 * The contents of this file are subject to the OpenMRS Public License
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://license.openmrs.org
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and
 * limitations under the License.
 *
 * Copyright (C) OpenHMIS.  All Rights Reserved.
 *
 */

(function() {
  'use strict';

  /* Factory module which exposes entity CRUD methods for making restful calls. */

  angular.module('app.restfulServices').factory('EntityRestFactory', EntityRestFactory);

  EntityRestFactory.$inject = ['RestfulService'];

  function EntityRestFactory(RestfulService) {

    var service = {
      setCustomBaseUrl: setCustomBaseUrl,
      setBaseUrl: setBaseUrl,
      loadEntity: loadEntity,
      saveOrUpdateEntity: saveOrUpdateEntity,
      retireOrUnretireEntity: retireOrUnretireEntity,
      purgeEntity: purgeEntity,
      loadEntities: loadEntities,
      loadResults: loadResults,
      post: RestfulService.post,
    }

    return service;

    /* Sets a custom url */
    function setCustomBaseUrl(url){
      RestfulService.setBaseUrl(url);
    }

    /* Set base url */
    function setBaseUrl(resource, version) {
      if(!angular.isDefined(version)){
        version = 'v2';
      }
      var baseUrl = "/openmrs/ws/rest/" + version + "/" + resource + "/";
      RestfulService.setBaseUrl(baseUrl);
    }

    /* Required parameters: rest_entity_name and uuid */
    function loadEntity(baseParams, successCallback, errorCallback) {
      var rest_entity_name;
      var uuid;

      if ("rest_entity_name" in baseParams) {
        rest_entity_name = baseParams['rest_entity_name'];
      } else {
        var msg = 'openhmis.inventory.general.error.restName';
        commonErrorHandler(errorCallback, msg);
      }

      if ("uuid" in baseParams) {
        uuid = baseParams['uuid'];
      } else {
        var msg = 'openhmis.inventory.general.error.uuid';
        commonErrorHandler(errorCallback, msg);
      }

      RestfulService.one(rest_entity_name, uuid, successCallback, errorCallback);
    }

    /* Checks for duplicated names */
    function checkExistingEntity(rest_entity_name, search_query, successCallback, errorCallback) {
      var params = {
        includeAll: true,
        q: search_query,
        startIndex: 1,
        limit: 1
      };
      RestfulService.all(rest_entity_name, params, successCallback, errorCallback);
    }

    /*
     * Either persist a new entity or update an existing one
     */
    function saveOrUpdateEntity(baseParams, openmrsObject, successCallback, errorCallback) {
      var rest_entity_name;
      var uuid = '';

      if ("rest_entity_name" in baseParams) {
        rest_entity_name = baseParams['rest_entity_name'];
      } else {
        var msg = 'openhmis.inventory.general.error.restName';
        commonErrorHandler(errorCallback, msg);
      }

      if (angular.isDefined(openmrsObject.uuid) && openmrsObject.uuid !== '') {
        uuid = openmrsObject.uuid;
      } else {
        // remove fields which are not required
        delete openmrsObject.uuid;
        if (angular.isDefined(openmrsObject.retireReason)) {
          delete openmrsObject.retireReason;
        }
      }

      // purge should not be sent along with the object
      if (angular.isDefined(openmrsObject.purge)) {
        delete openmrsObject.purge;
      }

      RestfulService.saveOrUpdate(rest_entity_name, uuid, openmrsObject, successCallback, errorCallback);
    }

    /* Required attributes: entity_name, uuid, retired, retireReason */
    function retireOrUnretireEntity(baseParams, openmrsObject, successCallback, errorCallback) {
      var rest_entity_name;
      var retired;
      var uuid;

      if ("rest_entity_name" in baseParams) {
        rest_entity_name = baseParams['rest_entity_name'];
      } else {
        var msg = 'openhmis.inventory.general.error.restName'
        commonErrorHandler(errorCallback, msg);
      }

      if (angular.isDefined(openmrsObject.uuid)) {
        uuid = openmrsObject.uuid;
      } else {
        var msg = 'openhmis.inventory.general.error.uuid';
        commonErrorHandler(errorCallback, msg);
      }

      if (angular.isDefined(openmrsObject.retired)) {
        retired = openmrsObject.retired;
      } else {
        var msg = 'openhmis.inventory.general.error.retired';
        commonErrorHandler(errorCallback, msg);
      }

      // purge should not be sent along with the openmrsobject
      if (angular.isDefined(openmrsObject.purge)) {
        delete openmrsObject.purge;
      }

      if (!retired) {
        openmrsObject.retired = true;
        if (!angular.isDefined(openmrsObject.retireReason)) {
          var msg = 'openhmis.inventory.general.error.retireReason';
          commonErrorHandler(errorCallback, msg);
        } else {
          RestfulService.remove(rest_entity_name, uuid, {
            "reason": openmrsObject.retireReason
          }, successCallback, errorCallback);
        }
      } else {
        openmrsObject.retired = false;
        if (angular.isDefined(openmrsObject.retireReason)) {
          delete openmrsObject.retireReason;
        }
        RestfulService.saveOrUpdate(rest_entity_name, uuid, openmrsObject, successCallback, errorCallback);
      }
    }

    /* Delete an entity. Required params: rest_entity_name, uuid, purge */
    function purgeEntity(baseParams, openmrsObject, successCallback, errorCallback) {
      var rest_entity_name;
      var uuid;

      if ("rest_entity_name" in baseParams) {
        rest_entity_name = baseParams['rest_entity_name'];
      } else {
        var msg = 'openhmis.inventory.general.error.restName';
        commonErrorHandler(errorCallback, msg);
      }

      if (angular.isDefined(openmrsObject.uuid)) {
        uuid = openmrsObject.uuid;
      } else {
        var msg = 'openhmis.inventory.general.error.uuid';
        commonErrorHandler(errorCallback, msg);
      }

      RestfulService.remove(rest_entity_name, uuid, openmrsObject, successCallback, errorCallback);
    }

    /*
     * load all entities.
     */
    function loadEntities(requestParams, successCallback, errorCallback) {
      var rest_entity_name;
      if ("rest_entity_name" in requestParams) {
        rest_entity_name = requestParams['rest_entity_name'];
      } else {
        var msg = 'openhmis.inventory.general.error.restName'
        commonErrorHandler(errorCallback, msg);
      }

      delete requestParams['rest_entity_name'];

      RestfulService.all(rest_entity_name, requestParams, successCallback, errorCallback);
    }

      /**
       * Retrieves any restful objects which are not openmrs data objects
       * @param resource
       * @param successCallback
       * @param errorCallback
       */
    function loadResults(requestParams, successCallback, errorCallback){
        var resource;
        if("resource" in requestParams){
          resource = requestParams['resource'];
          delete requestParams['resource'];
        }
      RestfulService.all(resource, requestParams, successCallback, errorCallback);
    }

    /*
     * error handler
     */
    function commonErrorHandler(errorCallback, msg) {
      var error = emr.errorMessage(msg);
      console.log('ERROR:::' + msg);
    }
  }
})();
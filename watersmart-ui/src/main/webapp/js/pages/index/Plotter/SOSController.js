Ext.ns("WaterSMART");

WaterSMART.SOSController = Ext.extend(Ext.util.Observable, {
    sosGetCaps : undefined,
    loading : false,
    constructor : function (config) {

        WaterSMART.SOSController.superclass.constructor.call(this, config);
        this.addEvents(
            'capstoreLoaded'
        );
    },
    getCaps : function (url) {
        LOG.debug('WaterSMART.SOSController::getCaps()');
        this.loading = true;
        var sos = new OpenLayers.SOSClient({
            url: url,
            controller: this
        });
    },
    capsLoaded : function (args) {
        LOG.debug('WaterSMART.SOSController::capsLoaded()');
        this.loading = false;
        LOG.debug("SOS GetCapabilites store loaded");
    },
    getOffering : function (offering) {
        LOG.debug('WaterSMART.SOSController::getOfferring()');
        if (!this.sosGetCaps || !this.sosGetCaps.contents) {
            return undefined;
        }
        return this.sosGetCaps.contents.offeringList[offering];
    }
});

OpenLayers.SOSClient = OpenLayers.Class({
    url: null,
    controller: null,
    capsformat: new OpenLayers.Format.SOSCapabilities(),
    initialize: function (options) {
        LOG.debug('WaterSMART.SOSClient::initialize()');
        OpenLayers.Util.extend(this, options);
        var params = {'service': 'SOS', 'request': 'GetCapabilities', 'version': '1.0.0'};
        var paramString = OpenLayers.Util.getParameterString(params);
        url = OpenLayers.Util.urlAppend(this.url, paramString);
        OpenLayers.Request.GET({
            url: url,
            success: this.parseSOSCaps,
            failure: function(response) {
                LOG.debug('Loading SOS GetCaps failed: ' + response.responseText);
                this.controller.loading = false;
            },
            scope: this
        });
    },
    getFois: function() {
        LOG.debug('WaterSMART.SOSClient::getFois()');
        var result = [];
        this.offeringCount = 0;
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            this.offeringCount++;
            for (var i=0, len=offering.featureOfInterestIds.length; i<len; i++) {
                var foi = offering.featureOfInterestIds[i];
                if (OpenLayers.Util.indexOf(result, foi) === -1) {
                    result.push(foi);
                }
            }
        }
        return result;
    },
    parseSOSCaps: function(response) {
        LOG.debug('WaterSMART.SOSClient::parseSOSCaps()');
        // cache capabilities for future use
        this.SOSCapabilities = this.capsformat.read(response.responseXML || response.responseText);
        this.controller.sosGetCaps = this.SOSCapabilities;
        this.controller.capsLoaded();
    },
    getTitleForObservedProperty: function(property) {
        LOG.debug('WaterSMART.SOSClient::getTitleForObservedProperty()');
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return offering.name;
            }
        }
        return '';
    },
    destroy: function () {
    },
    CLASS_NAME: "OpenLayers.SOSClient"
});
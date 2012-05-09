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
        this.loading = true;
        var sos = new OpenLayers.SOSClient({
            url: url,
            controller: this
        });
    },
    capsLoaded : function (args) {
        this.loading = false;
        LOG.debug("SOS GetCapabilites store loaded");
    },
    getOffering : function (offering) {
        return this.sosGetCaps.contents.offeringList[offering];
    }
});

OpenLayers.SOSClient = OpenLayers.Class({
    url: null,
    controller: null,
//    map: null,
    capsformat: new OpenLayers.Format.SOSCapabilities(),
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        var params = {'service': 'SOS', 'request': 'GetCapabilities', 'version': '1.0.0'};
        var paramString = OpenLayers.Util.getParameterString(params);
        url = OpenLayers.Util.urlAppend(this.url, paramString);
        OpenLayers.Request.GET({
            url: url,
            success: this.parseSOSCaps,
            failure: function(response) {
                LOG.debug(response);
            },
            scope: this
        });
    },
    getFois: function() {
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
        // cache capabilities for future use
        this.SOSCapabilities = this.capsformat.read(response.responseXML || response.responseText);
        this.controller.sosGetCaps = this.SOSCapabilities;
        this.controller.capsLoaded();
    },
    getTitleForObservedProperty: function(property) {
        for (var name in this.SOSCapabilities.contents.offeringList) {
            var offering = this.SOSCapabilities.contents.offeringList[name];
            if (offering.observedProperties[0] === property) {
                return offering.name;
            }
        }
    },
    destroy: function () {
    },
    CLASS_NAME: "OpenLayers.SOSClient"
});
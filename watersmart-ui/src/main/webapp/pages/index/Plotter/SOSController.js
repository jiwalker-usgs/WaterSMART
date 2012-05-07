Ext.ns("WaterSMART");

WaterSMART.SOSController = Ext.extend(Ext.util.Observable, {
    sosGetCapsStore : undefined,
    loading : false,
    constructor : function (config) {

        WaterSMART.SOSController.superclass.constructor.call(this, config);
        this.addEvents(
            'capstoreLoaded'
        );
    },
    loadCapstore : function (url) {
        this.loading = true;
        var sosCapsStore = new CIDA.SOSGetCapabilitiesStore({
            url : url + '?Service=SOS&Request=GetCapabilities&Version=1.0.0',
            listeners : {
                load : this.capstoreLoaded,
                scope : this
            }
        });
        sosCapsStore.load();
    },
    capstoreLoaded : function (args) {
        this.sosGetCapsStore = args;
        this.loading = false;
        LOG.debug("SOS GetCapabilites store loaded");
        this.fireEvent('capstoreLoaded');
    }
});
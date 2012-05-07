if (Ext.isIE) { // http://www.mail-archive.com/users@openlayers.org/msg01838.html
    document.namespaces;
}

var VIEWPORT;

Ext.onReady(function() {
    initializeLogging();
    LOG.info('onReady.js::Logging Initialized');
    
    initializeAjax();
    LOG.info('onReady.js::AJAX Initialized');
    
    initializeLoadMask();
    LOADMASK.show();
    LOG.info('onReady.js::Load Mask Initialized');
    
    initializeQuickTips();
    LOG.info('onReady.js::Quick Tips Initialized');
    
    initializeNotification();
    LOG.info('onReady.js::Notifications Initialized');
	
    LOG.debug('onReady.js::Getting ready to load CSW Record Store');
    
    var parentCswStore = new CIDA.CSWGetRecordsStore({
        url : "service/geonetwork/csw",
        storeId : 'parentCswStore',
        opts : {
            resultType : 'results',
            outputSchema : 'http://www.isotc211.org/2005/gmd',
            Query : {
                ElementSetName : {
                    value: 'full'
                },
                Constraint : {
                    Filter : {
                        type : '==',
                        property : 'ParentIdentifier',
                        value : CONFIG.CSW_PARENT_IDENTIFIER
                    },
                    version : '1.1.0'
                }
            }
        },
        listeners : {
            load : this.cswStoreFirstLoad,
            exception : function() {
                NOTIFY.warn({ msg : 'An error has occured - Application may not work properly.'})
            }, 
            scope : this
        }
        
    });
    parentCswStore.load();
});

function cswStoreFirstLoad(store) {
    LOG.debug('onReady.js::CSW Record Store loaded ' + store.totalLength + ' record(s)');

    var commonAttr = CONFIG.COMMON_ATTR;

    var sosController = new WaterSMART.SOSController({
        
    });

    var map = new WaterSMART.Map({
        sosController : sosController,
        commonAttr : commonAttr
    });
        
    var modelRunSelPanel = new WaterSMART.ModelRunSelectionPanel({
        sosController : sosController,
        commonAttr : commonAttr,
        cswStore : store,
        mapPanel : map
    });
        
    var forms = new Ext.Panel({
        region: 'east',
        border: false,
        layout: 'border',
        collapsible: true,
        width: '30%',
        autoShow: true,
        items: [ modelRunSelPanel ]
    });

    var bodyPanel = new Ext.Panel({
        region: 'center',
        border: false,
        layout : 'border',
        autoShow: true,
        items : [
        forms,
        map
        ]
    });
	
    var headerPanel = new Ext.Panel({
        id: 'header-panel',
        region: 'north',
        height: 'auto',
        border : false,
        autoShow: true,
        contentEl: 'usgs-header-panel'
    });
    var footerPanel = new Ext.Panel({
        id: 'footer-panel',
        region: 'south',
        height: 'auto',
        border : false,
        autoShow: true,
        contentEl: 'usgs-footer-panel'
    });
	
    VIEWPORT = new Ext.Viewport({
        renderTo : document.body,
        layout : 'border',
        items : [
        headerPanel,
        bodyPanel,
        footerPanel
        ]
    });
    LOADMASK.hide();
    
    store.un('load', this.cswStoreFirstLoad, this);
}

function initializeAjax() {
    
    Ext.Ajax.addEvents(
        "ajax-request-firing",
        "ajax-requests-complete",
        "ajax-request-exception"
        );
        
    Ext.Ajax.on('beforerequest', function(connection, options) {
        if (!Ext.Ajax.isLoading()) {
            Ext.Ajax.fireEvent('ajax-request-firing', 
            {
                connection : connection, 
                options : options
            });
        }
    }, this);
    Ext.Ajax.on('requestcomplete', function(connection, response, options) {
        if (!Ext.Ajax.isLoading()) {
            Ext.Ajax.fireEvent('ajax-requests-complete', 
            {
                connection : connection, 
                response : response, 
                options : options
            });
        }
    }, this);
    Ext.Ajax.on('requestexception', function(connection, response, options) {
        LOG.error(response);
        if (!Ext.Ajax.isLoading()) {
            Ext.Ajax.fireEvent('ajax-request-exception', 
            {
                connection : connection, 
                response : response, 
                options : options
            });
        }
    }, this);
}

function initializeQuickTips() {
    LOG.debug('onReady.js::initializeQuickTips(): Initializing Quicktips');
    Ext.QuickTips.init();

    Ext.apply(Ext.QuickTips.getQuickTip(), {
        maxWidth: 200,
        minWidth: 100,
        showDelay: 50,      // Show 50ms after entering target
        dismissDelay: 0,
        trackMouse: true
    });
    LOG.info('onReady.js::initializeQuickTips(): Initialized Quicktips');
}

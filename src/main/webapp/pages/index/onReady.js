if (Ext.isIE) { // http://www.mail-archive.com/users@openlayers.org/msg01838.html
    document.namespaces;
}

var CONTROLLER;
var VIEWPORT;

Ext.onReady(function() {
    initializeLogging();
    initializeAjax();
    initializeLoadMask();
    initializeQuickTips();
    initializeNotification();
    LOADMASK.show();
	
//    var map = new NAWQA.Map();
//    var options = new NAWQA.OptionsPanel({
//        binStore : new GeoExt.data.LayerStore()
//    });
//	
//	var mainMenu = new NAWQA.MainMenu({
//        optionsPanel : options
//    });
//	
//    CONTROLLER = new NAWQA.Controller({
//        mapPanel : map,
//		mainMenu : mainMenu
//    });
//	
    var form = new WaterSMART.ISOFormPanel();

    var body = new Ext.Panel({
        region: 'center',
        border: false,
        layout : 'border',
        autoShow: true,
        items : [
            form
        ]
//        map
//        ],
//        tbar : mainMenu
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
        body,
        footerPanel
        ]
    });
    LOADMASK.hide();
});

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

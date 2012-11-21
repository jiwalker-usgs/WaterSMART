if (Ext.isIE) { // http://www.mail-archive.com/users@openlayers.org/msg01838.html
    document.namespaces;
}

var VIEWPORT;

Ext.onReady(function () {
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

    initializeSessionTimeout();

    LOG.debug('onReady.js::Getting ready to load CSW Record Store');

    // First load the parent CSW store. When the return comes from there, 
    // set that store into the global config and load all children of that store 
    // and when loading that completes, begin loading the application using the 
    // data retrieved
    new CIDA.CSWGetRecordsStore({
        url : "service/geonetwork/csw",
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
                        property : 'Identifier',
                        value : CONFIG.CSW_PARENT_IDENTIFIER
                    },
                    version : '1.1.0'
                }
            }
        },
        listeners : {
            load : function(store) {
                // Parent store loaded
                LOG.debug('onReady.js:: Parent CSW Record Store loaded ' + store.totalLength + ' record(s)');
                
                CONFIG.parentStore = store;
                
                // Load children stores that have the same identifier as the parent
                new CIDA.CSWGetRecordsStore({
                    url : "service/geonetwork/csw",
                    parentStore : store,
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
                                    // We can use the constant or the FileIdentifier of the parent store here
                                    value : CONFIG.CSW_PARENT_IDENTIFIER 
                                },
                                version : '1.1.0'
                            }
                        }
                    },
                    listeners : {
                        load : function(store) {
                            LOG.debug('onReady.js:: Child CSW Record Store loaded ' + store.totalLength + ' record(s)');
                            this.cswStoreFirstLoad(CONFIG.parentStore, store);
                            // We don't want to load the application every time this store loads
                            store.un('load');
                        },
                        exception : function() {
                            NOTIFY.warn({
                                msg : 'An error has occured during initialization- Application may not contain full functionality.'
                            })
                        }, 
                        scope : this
                    }
        
                }).load()
                
            },
            exception : function() {
                NOTIFY.warn({
                    msg : 'An error has occured during initialization- Application may not contain full functionality.'
                })
            }, 
            scope : this
        }
        
    }).load();
});

function cswStoreFirstLoad(parentStore, childStore) {

    var commonAttr = CONFIG.COMMON_ATTR;

    var sosController = new WaterSMART.SOSController({});

    var map = new WaterSMART.Map({
        sosController : sosController,
        commonAttr : commonAttr
    });
        
    var modelRunSelPanel = new WaterSMART.ModelRunSelectionPanel({
        sosController : sosController,
        commonAttr : commonAttr,
        cswStore : childStore,
        parentStore : parentStore,
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

}

function initializeAjax() {
    
    Ext.Ajax.addEvents(
        "ajax-request-firing",
        "ajax-requests-complete",
        "ajax-request-exception"
        );
        
    Ext.Ajax.on('beforerequest', function (connection, options) {
        if (!Ext.Ajax.isLoading()) {
            Ext.Ajax.fireEvent('ajax-request-firing',
            {
                connection : connection,
                options : options
            });
        }
    }, this);
    
    Ext.Ajax.on('requestcomplete', function (connection, response, options) {
        if (!Ext.Ajax.isLoading()) {
            Ext.Ajax.fireEvent('ajax-requests-complete',
            {
                connection : connection,
                response : response,
                options : options
            });
        }
    }, this);
    
    Ext.Ajax.on('requestexception', function (connection, response, options) {
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

function logout() {
    window.location.href = "?LOGOUT_HOOK=true";
}


function initializeSessionTimeout() {
    var timeout = (CONFIG.TIMEOUT - 60) * 1000;
    var confirmLogout = function() {
        var el = Ext.Msg.confirm(
            'Session Expiration',
            '<span style="font-size:14px">Your session is about to expire, would you like to stay logged into this application?</span>',
            function (choice) {
                if (choice == 'yes') {
                    Ext.Ajax.request({
                        url: 'renew_session.jsp'
                    });
                }
                else {
                    logout();
                }
            }
            )
        .setIcon(Ext.MessageBox.WARNING)
        
        el.getDialog().add(
            new Ext.ProgressBar({
                listeners : {
                    update : function(pb){
                        if (pb.text) {
                            var seconds = parseInt(pb.text);
                            if (seconds > 0) {
                                pb.suspendEvents(false);
                                pb.updateText((seconds - 1).toString())
                                pb.resumeEvents();
                            } else {
                                logout();
                            }
                        }
                    }
                }
            }).wait({
                duration : 61000,
                increment : 59,
                animate : true,
                text : '61'
            })
            )
            
        el.getDialog().addListener('hide', function(me) {
            me.removeAll(true);
        })
    }
    
    Ext.Ajax.on(
        "ajax-requests-complete",
        function() {
            window.clearTimeout(CONFIG.TIMEOUT_ID);
            CONFIG.TIMEOUT_ID = confirmLogout.defer(timeout);
        }
        );
    
    LOG.debug('Session timeout updated');
}

Ext.ns("WaterSMART");

WaterSMART.ModelRunSelectionPanel = Ext.extend(Ext.Panel, {
    cswStore : undefined,
    mapPanel : undefined,
    modelPanel : undefined,
    runPanel : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        this.cswStore = config.cswStore;
        this.mapPanel = config.mapPanel;
        
        this.modelPanel = new WaterSMART.ModelPanel({
            cswStore : this.cswStore,
            region : 'center',
            title : 'Models',
            width : '40%',
            height : '100%'
        })
        
        this.runPanel = new Ext.Panel({
            id : 'run-panel',
            title : 'Runs',
            width : '60%',
            region : 'east',
            height : '100%',
            disabled : true,
            currentlySelectedRun : undefined,
            tbar : [
            {
                xtype : 'button',
                id : 'select-another-model-button',
                text : 'Select Another Model',
                listeners : {
                    click : function() {
                        this.modelPanel.setDisabled(false);
                        
                        Ext.each(this.modelPanel.modelPanels, function(modelPanel) {
                            modelPanel.expand(true);
                        })
                        
                        this.runPanel.removeAll(true);
                        
                        this.runPanel.setDisabled(true);
                        
                    },
                    scope : this
                }
            },
            {
                xtype : 'button',
                id : 'edit-selected-run-button',
                text : 'Edit Selected Run',
                disabled : true,
                listeners : {
                    click : function() {
                        
                    },
                    scope : this
                }
            },
            {
                xtype : 'button',
                id : 'create-run-button',
                text : 'Create A Run',
                listeners : {
                    click : function() {
                        
                    LOG.debug('')
                    var isoFormPanel = new WaterSMART.ISOFormPanel({
                        
                    });
                    
                    var modalRunWindow = new Ext.Window({
                        width: 'auto',
                        height : 'auto',
                        modal : true,
                        items : [ isoFormPanel ]
                    })
                    
                    modalRunWindow.show();
                    
                    },
                    scope : this
                }
            }
            ]
        })
        
        config = Ext.apply({
            id: 'model-run-selection-panel',
            region: 'center',
            layout : 'border',
            items : [
            this.modelPanel,
            this.runPanel
            ]
        }, config);
        WaterSMART.ModelRunSelectionPanel.superclass.constructor.call(this, config);
    
    },
    modelSelected : function(config) {
        LOG.debug('ModelRunSelectionpanel.js::A model has been selected');
        var runPanels = config.runPanels;
        
        this.runPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(true);
        
        LOG.trace('ModelRunSelectionpanel.js::Removing all run panels')
        this.runPanel.removeAll();
        LOG.trace('ModelRunSelectionpanel.js::Adding new run panels to primary run panel ')
        this.runPanel.add(runPanels);
        this.runPanel.setDisabled(false);
        this.runPanel.doLayout();
        
    },
    runSelected : function(panel) {
        LOG.debug('ModelRunSelectionpanel.js:: A run has been selected with the SOS endpoint of: ' + panel.panelInfo.operationURL);
        
        this.runPanel.currentlySelectedRun = panel;
        this.runPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(false);
        
        // TODO- We will need to change this when (if?) we get more than one sites layer on the map at any given time
        if (this.mapPanel.currentMapConfig.layers.layers.length 
            && this.mapPanel.currentMapConfig.layers.layers[0].params.LAYERS === panel.panelInfo.owsResourceName) {
            LOG.debug('ModelRunSelectionpanel.js::New sites layer is the same as the current sites layer. New sites layer will not be created')
            return;
        }
        
        var newSitesLayerArray = [
        new OpenLayers.Layer.WMS(
            panel.panelInfo.fileIdentifier,
            panel.panelInfo.owsEndpoint,
            {
                LAYERS: panel.panelInfo.owsResourceName,
                transparent : true,
                format: 'image/png'
            },
            {
                extractAttributes : true,
                opacity : '0.5',
                displayOutsideMaxExtent: true,
                isBaseLayer: false,
                transitionEffect : 'resize'
            })
        ];
        
        this.mapPanel.currentMapConfig.layers.layers = newSitesLayerArray;
        this.mapPanel.processMapConfigObject(this.mapPanel.currentMapConfig);
        
        this.mapPanel.sosEndpoint = panel.panelInfo.operationURL;
        this.mapPanel.plotterVars = 'Discharge';
        this.mapPanel.addIdentifyToolingToMap();
    }
});
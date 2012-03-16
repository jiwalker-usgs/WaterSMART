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
            height : '100%'
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
        
        LOG.trace('ModelRunSelectionpanel.js::Removing all run panels')
        this.runPanel.removeAll();
        LOG.trace('ModelRunSelectionpanel.js::Adding new run panels to primary run panel ')
        this.runPanel.add(runPanels);
        this.runPanel.doLayout();
        
        // TODO- We will need to change this when (if?) we get more than one sites layer on the map at any given time
        if (this.mapPanel.currentMapConfig.layers.layers.length 
            && this.mapPanel.currentMapConfig.layers.layers[0].params.LAYERS === config.panelInfo.owsResourceName) {
            LOG.debug('ModelRunSelectionpanel.js::New sites layer is the same as the current sites layer. New sites layer will not be created')
            return;
        }
        
        var newSitesLayerArray = [
        new OpenLayers.Layer.WMS(
            config.panelInfo.fileIdentifier,
            config.panelInfo.owsEndpoint,
            {
                LAYERS: config.panelInfo.owsResourceName,
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
    }
});
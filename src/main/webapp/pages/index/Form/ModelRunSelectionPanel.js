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
        var runPanels = config.runPanels;
        this.runPanel.removeAll();
        this.runPanel.add(runPanels);
        this.runPanel.doLayout();
        
        this.mapPanel.currentMapConfig.layers.layers = [
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
        this.mapPanel.processMapConfigObject(this.mapPanel.currentMapConfig);
    }
});
Ext.ns("WaterSMART");

WaterSMART.ModelRunSelectionPanel = Ext.extend(Ext.Panel, {
    cswStore : undefined,
    runPanel : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        this.cswStore = config.cswStore;
        
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
            new WaterSMART.ModelPanel({
                cswStore : this.cswStore,
                region : 'center',
                title : 'Models',
                width : '40%',
                height : '100%'
            }),
            this.runPanel
            ]
        }, config);
        WaterSMART.ModelRunSelectionPanel.superclass.constructor.call(this, config);
    
    },
    populateRunPanel : function(config) {
        var runPanels = config.runPanels;
        this.runPanel.removeAll();
        this.runPanel.add(runPanels);
        this.runPanel.doLayout();
    }
});
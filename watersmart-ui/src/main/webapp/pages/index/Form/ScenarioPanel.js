Ext.ns("WaterSMART");

WaterSMART.ScenarioPanel = Ext.extend(Ext.Panel, {
    title : undefined,
    runPanels : undefined,
    constructor : function (config) {
        LOG.trace('RunPanel.js::constructor()');
        if (!config) config = {};

        this.title = config.title;
        this.runPanels = config.runPanels || [];

        config = Ext.apply({
            title : this.title,
            height : 'auto',
            autoScroll : true,
            width: '100%'
        }, config);
        WaterSMART.ScenarioPanel.superclass.constructor.call(this, config);
    },
    add : function (runPanel) {
        this.runPanels.push(runPanel);
    }
});
Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    commonAttr : undefined,
    create : undefined,
    htmlTransform : undefined,
    isBestScenario : undefined,
    scenarioOptions : [],
    layer : undefined,
    modelId : undefined,
    modelName : undefined,
    modelerName : undefined,
    modelVersion : undefined,
    runIdentifier : undefined,
    existingVersions : undefined,
    runDate : undefined,
    scenario : undefined,
    wfsUrl : undefined,
    xmlTransform : undefined,
    'abstract' : undefined,
    originalAbstract : undefined,
    originalModelerName : undefined,
    originalModelName : undefined,
    originalModelVersion : undefined,
    originalRunIdentifier : undefined,
    originalRunDate : undefined,
    originalScenario : undefined,

    constructor : function (config) {

        if (!config) config = {};

        this.commonAttr = config.commonAttr;
        this.layer = config.layer || '';
        this.modelId = config.modelId || '';
        this.modelName = this.originalModelName = config.modelName || '';
        this.modelerName = this.originalModelerName = config.modelerName || '';
        this.runIdentifier = this.originalRunIdentifier = config.runIdentifier || 0;
        this.modelVersion = this.originalModelVersion = config.modelVersion || 0;
        this.existingVersions = config.existingVersions || {};
        this.runDate = this.originalRunDate = config.runDate || new Date();
        this.scenario = this.originalScenario = config.scenario;
        this.wfsUrl = config.wfsUrl || '';
        this.create = config.create;
        this.isBestScenario = config.isBestScenario || false;
        this.scenarioOptions = config.scenarioOptions;
        
        this['abstract'] = this.originalAbstract = config['abstract'] || '';

        config = Ext.apply({
            id: 'metadata-form',
            padding: 5,
            width: '100%',
            url: 'update',
            defaultType: 'textfield',
            xtype: 'panel',
            layout: 'form',
            items: [
                {
                    fieldLabel: 'Calibration/ Validation Scenario',
                    xtype: 'combo',
                    mode: 'local',
                    store: this.scenarioOptions,
                    hiddenName: 'scenario',
                    name: 'scenario',
                    ref: 'scenarioField',
                    setEditable: false,
                    forceSelection: true,
                    triggerAction: 'all',
                    emptyText: 'Select a scenario...',
                    selectOnFocus: true,
                    value : this.create ? '' : this.scenario,
                    anchor: '65%',
                    listeners : {
                        select : function (combo, record, index) {
                            LOG.debug("got record: " + record.json);
                            var scenario = record.get(record.fields.first().name);
                            var maxModelVer = 0;
                            var maxRunIdent = 0;
                            Ext.each(this.existingVersions[scenario], function (version) {
                                if (version.split(".")[0] == maxModelVer) {
                                    maxRunIdent = (version.split(".")[1] > maxRunIdent) ? version.split(".")[1] : maxRunIdent;
                                } else if (version.split(".")[0] > maxModelVer) {
                                    maxModelVer = version.split(".")[0];
                                    maxRunIdent = version.split(".")[1];
                                }
                            });
                            if (this.create) {
                                this.runIdentifier = ++maxRunIdent;
                                this.modelVersion = maxModelVer;
                                this.getForm().setValues(
                                    {
                                        'runIdent' : this.runIdentifier,
                                        'version' : this.modelVersion
                                    }
                                );
                            }
                            this.versionField.validate();
                            this.runIdentField.validate();
                        },
                        scope : this
                    }
                }, {
                    fieldLabel: 'Modeler Name',
                    name: 'name',
                    value : this.modelerName,
                    allowBlank: false
                }, {
                    xtype : 'displayfield',
                    fieldLabel: 'Model Name',
                    name: 'model',
                    value : this.modelName,
                    allowBlank: false
                }, {
                    fieldLabel: 'Model Version',
                    xtype: this.create ? 'textfield' : 'displayfield',
                    name: 'version',
                    ref: 'versionField',
                    value : this.modelVersion,
                    allowBlank: false,
                    validator: this.validateForm
                }, {
                    fieldLabel: 'Run Identifier',
                    name: 'runIdent',
                    ref: 'runIdentField',
                    value : this.runIdentifier,
                    allowBlank: false,
                    validator: this.validateForm
                }, {
                    xtype : 'datefield',
                    fieldLabel: 'Run Date',
                    name: 'creationDate',
                    value : this.runDate,
                    allowBlank: false
                }, {
                    fieldLabel: 'Comments',
                    xtype : 'textarea',
                    name: 'comments',
                    value : this['abstract'],
                    allowBlank: true,
                    anchor: '95%'
                }
            ]
        }, config);
        WaterSMART.ISOFormPanel.superclass.constructor.call(this, config);

        if (!this.isBestScenario && !this.create) {
            this.add(new Ext.form.Checkbox({
                fieldLabel: 'Mark As Best',
                xtype : 'checkbox',
                name : 'markAsBest'
            }));
        }

    },
    validateForm : function () {
        var parentPanel = Ext.ComponentMgr.get('metadata-form');
        var scenario = parentPanel.scenarioField.getValue();
        var newVersion = parentPanel.versionField.getValue() + "." + parentPanel.runIdentField.getValue();
        var origVersion = parentPanel.originalModelVersion + "." + parentPanel.originalRunIdentifier;
        if ((origVersion !== newVersion || parentPanel.originalScenario !== scenario) &&
                scenario !== "" &&
                parentPanel.existingVersions[scenario] &&
                parentPanel.existingVersions[scenario].indexOf(newVersion) >= 0) {
            return "Cannot set version to one already in existance";
        }
        return true;
    }
});

// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
WaterSMART.replaceURLWithHTMLLinks = function (text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
};
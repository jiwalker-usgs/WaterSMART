Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    commonAttr : undefined,
    create : undefined,
    htmlTransform : undefined,
    isBestScenario : undefined,
    isBestScenarioCheckbox : new Ext.form.Checkbox({
        fieldLabel: 'Mark As Best',
        xtype : 'checkbox',
        name : 'markAsBest'
    }),
    layer : undefined,
    modelId : undefined,
    modelName : undefined,
    modelerName : undefined,
    modelVersion : undefined,
    runIdentifier : undefined,
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
    
    constructor : function(config) {
        
        if (!config) config = {};
        
        this.commonAttr = config.commonAttr;
        this.layer = config.layer || '';
        this.modelId = config.modelId || '';
        this.modelName = this.originalModelName = config.modelName || '';
        this.modelerName = this.originalModelerName = config.modelerName || '';
        this.runIdentifier = this.originalRunIdentifier = config.runIdentifier || 0;
        this.modelVersion = this.originalModelVersion = config.modelVersion || 0;
        this.runDate = this.originalRunDate = config.runDate || new Date();
        this.scenario = this.originalScenario = config.scenario;
        this.wfsUrl = config.wfsUrl || '';
        this.create = config.create;
        this.isBestScenario = config.isBestScenario || false;
        
        this['abstract'] = this.originalAbstract = config['abstract'] || '';
        
        config = Ext.apply({
            id: 'metadata-form',
            bodyPadding: 5,
            region: 'center',
            width: '100%',
            url: 'update',
            defaultType: 'textfield',
            items: [{
                fieldLabel: 'Modeler Name',
                name: 'name',
                value : this.modelerName,
                allowBlank: false
            },{
                xtype : 'displayfield',
                fieldLabel: 'Model Name',
                name: 'model',
                value : this.modelName,
                allowBlank: false
            },{
                fieldLabel: 'Model Version',
                name: 'version',
                value : this.modelVersion,
                allowBlank: false
            },{
                fieldLabel: 'Run Identifier',
                name: 'runIdent',
                value : this.runIdentifier,
                allowBlank: false
            },{
                xtype : 'datefield',
                fieldLabel: 'Run Date',
                name: 'creationDate',
                value : this.runDate,
                allowBlank: false
            },{
                fieldLabel: 'Calibration/ Validation Scenario',
                name: 'scenario',
                allowBlank: false,
                value : this.create ? '' : this.scenario,
                anchor: '95%'
            },{
                fieldLabel: 'Comments',
                xtype : 'textarea',
                name: 'comments',
                value : this['abstract'],
                allowBlank: true,
                anchor: '95%'
            }
            ],
            buttons: [
            {
                text: 'Submit',
                type: 'submit',
                formBind: true,
                handler: function(button) {
                    var uploadPanel = Ext.getCmp('uploadPanel');
                    var metadataForm = Ext.getCmp('metadata-form').getForm().getValues();
                    var isoFormPanel = button.ownerCt.ownerCt;
                    
                    LOG.debug('isoFormPanel.js::Preparing to upload file.');
                    
                    if (isoFormPanel.create) {
                        uploadPanel.getForm().submit({
                            url: uploadPanel.url,
                            scope : this,
                            params: {
                                name : metadataForm.name,
                                modelId : isoFormPanel.modelId,
                                modelVersion : metadataForm.version,
                                runIdent : metadataForm.runIdent,
                                creationDate : metadataForm.creationDate,
                                scenario : metadataForm.scenario,
                                comments : metadataForm.comments,
                                email : WATERSMART.USER_EMAIL,
                                modeltype : isoFormPanel.modelName,
                                wfsUrl : isoFormPanel.wfsUrl,
                                layer : isoFormPanel.layer,
                                commonAttr : isoFormPanel.commonAttr,
                                markAsBest : isoFormPanel.markAsBest
                            },
                            waitMsg: 'Saving...',
                            success: function() {
                                LOG.info('isoFormPanel.js::User upload succeeded.');
                                
                                Ext.getCmp('model-run-selection-panel').reloadRuns();
                                
                                LOG.info('isoFormPanel.js::Closing modal window');
                                this.ownerCt.ownerCt.ownerCt.close();
                                
                                NOTIFY.info({
                                    msg:'Upload succeeded'
                                })
                            },
                            failure: function(panel, fail) {
                                LOG.info('isoFormPanel.js:: User upload failed.');
                                NOTIFY.error({
                                    msg : fail.result.message
                                })
                            }
                        });
                    } else {
                        var form = Ext.getCmp('metadata-form');
                        form.getForm().submit({
                            url: form.url,
                            scope : this,
                            params: {
                                modelId : isoFormPanel.modelId,
                                originalName : isoFormPanel.originalModelerName,
                                originalModelVersion : form.originalModelVersion,
                                originalRunIdent : form.originalRunIdentifier,
                                originalCreationDate : form.originalRunDate.format('m/d/Y'),
                                originalScenario : form.originalScenario,
                                originalComments : form.originalAbstract,
                                email : WATERSMART.USER_EMAIL,
                                modeltype : isoFormPanel.modelName,
                                wfsUrl : isoFormPanel.wfsUrl,
                                layer : isoFormPanel.layer,
                                commonAttr : isoFormPanel.commonAttr,
                                transaction: true
                            },
                            waitMsg: 'Saving...',
                            success: function(form, action) {
                                LOG.info('isoFormPanel.js::User update succeeded.');
                                NOTIFY.info({
                                    msg : action.result.msg
                                    });
                                
                                Ext.getCmp('model-run-selection-panel').reloadRuns();
                                
                                LOG.info('isoFormPanel.js::Closing modal window');
                                this.ownerCt.ownerCt.ownerCt.close();
                            },
                            failure: function(form, action) {
                                if (action.failureType === 'client') {
                                    NOTIFY.warn({
                                        msg : 'Please ensure all input data is valid'
                                    })
                                } else {
                                    NOTIFY.warn({
                                        msg : action.result.msg
                                        });
                                }
                                
                            }
                        });
                    }
                }
            }]
        }, config);
        WaterSMART.ISOFormPanel.superclass.constructor.call(this, config);
        
        if (this.create) {
            this.add(new WaterSMART.FileUploadPanel())
            
        }
        
        if (!this.isBestScenario) {
            this.add(this.isBestScenarioCheckbox);
        }
        
        this.doLayout();        
        
    }
});

// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
WaterSMART.replaceURLWithHTMLLinks = function(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

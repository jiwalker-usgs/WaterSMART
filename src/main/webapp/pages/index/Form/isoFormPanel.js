Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    commonAttr : undefined,
    create : undefined,
    htmlTransform : undefined,
    layer : undefined,
    modelId : undefined,
    modelName : undefined,
    modelerName : undefined,
    modelVersion : undefined,
    runIdentifier : undefined,
    runDate : undefined,
    wfsUrl : undefined,
    xmlTransform : undefined,
    'abstract' : undefined,
    constructor : function(config) {
        
        if (!config) config = {};
        
        this.commonAttr = config.commonAttr;
        this.layer = config.layer || '';
        this.modelId = config.modelId || '';
        this.modelName = config.modelName || '';
        this.modelerName = config.modelerName || '';
        this.runIdentifier = config.runIdentifier || 0;
        this.modelVersion = config.modelVersion || 0;
        this.runDate = config.runDate || new Date();
        this.wfsUrl = config.wfsUrl || '';
        this.create = config.create;
        this['abstract'] = config['abstract'] || '';
        
        config = Ext.apply({
            id: 'metadata-form',
            bodyPadding: 5,
            region: 'center',
            width: '100%',
            url: 'pages/index/Utils/isorecord.jsp',
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
                                commonAttr : isoFormPanel.commonAttr
                            },
                            waitMsg: 'Saving...',
                            success: function() {
                                LOG.info('isoFormPanel.js::User upload succeeded.');
                            
                                NOTIFY.info({
                                    msg:'Upload succeeded'
                                })
                            
                                var form = Ext.getCmp('metadata-form');
                                form.getForm().submit({
                                    url: form.url,
                                    params: {
                                        transaction: true,
                                        modeltype : ''
                                    },
                                    waitMsg: 'Saving...',
                                    success: function(x, action) {
                                        LOG.debug('');
                                    var form = Ext.getCmp('metadata-form');
                                    var xml = action.response.responseXML;

                                    Ext.Ajax.request({
                                        url: 'updatecsw',
                                        method: 'POST',
                                        xmlData: xml,
                                        success: function(response) {
                                            var result = response.responseText;
                                            LOG.debug(result);
                                        },
                                        failure: function(panel, fail) {
                                            LOG.debug(fail);
                                        }
                                    });
                                    },
                                    failure: function(panel, fail) {
                                        LOG.info('')
                                        NOTIFY.error({
                                            msg : fail.result.message
                                        })
                                    }
                                });
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
                            params: {
                                transaction: true,
                                modeltype : ''
                            },
                            waitMsg: 'Saving...',
                            success: function(x, action) {
                            },
                            failure: function(panel, fail) {
                            }
                        });
                    }
                }
            }]
        }, config);
        WaterSMART.ISOFormPanel.superclass.constructor.call(this, config);
        
        if (this.create) {
            this.add(new WaterSMART.FileUploadPanel())
            this.doLayout();
        }
        
        
    }
});

// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
WaterSMART.replaceURLWithHTMLLinks = function(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

Ext.ns("WaterSMART");

WaterSMART.ProcessFormPanel = Ext.extend(Ext.form.FormPanel, {
    commonAttribute : undefined,
    url : undefined,
    layerName : undefined,
    processIdentifier : undefined,
    processTitle : undefined,
    processStore : undefined,
    sosEndpoint : undefined,
    wfsUrl : undefined,
    wpsResponseStore : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        this.url = config.url || '';
        this.processIdentifier = config.processIdentifier || '';
        this.processTitle = config.processTitle || '';
        this.processStore = config.processStore || '';
        this.wfsUrl = config.wfsUrl || '';
        this.layerName = config.layerName || '';
        this.commonAttribute= config.commonAttribute || '';
        this.sosEndpoint = config.sosEndpoint|| '';
        
        config = Ext.apply({
            title : this.processTitle,
            id : 'process-form',
            bodyPadding: 5,
            region: 'center',
            items : [
            {
                xtype : 'checkbox',
                id : 'checkbox-email',
                checked : true,
                fieldLabel : 'Require E-Mail Notification When Complete?'
            }
            ],
            buttons : [{
                text: 'Submit',
                handler: function(button) {
                    var processPanel = this.ownerCt.ownerCt;
                    var processPanelFormValues = processPanel.getForm().getValues();
                    
                    var data = '';
                    if (processPanelFormValues['checkbox-email'] === 'on') {
                        data = new WaterSMART.ExampleEmailWPSWrapperProcess({
                            subProcess : new WaterSMART.ExampleProcess({
                                wfsUrl : processPanel.wfsUrl,
                                layerName : processPanel.layerName,
                                commonAttribute : processPanel.commonAttribute,
                                sosEndpoint : processPanel.sosEndpoint
                            }).createWpsExecuteRequest(),
                            email : WATERSMART.USER_EMAIL
                        }).createWpsExecuteRequest()
                    } else {
                        data = new WaterSMART.ExampleProcess({
                            wfsUrl : processPanel.wfsUrl,
                            layerName : processPanel.layerName,
                            commonAttribute : processPanel.commonAttribute,
                            sosEndpoint : processPanel.sosEndpoint
                        }).createWpsExecuteRequest()
                    }
                    
                    processPanel.wpsResponseStore = new CIDA.WPSExecuteResponseStore({
                        // TODO - Check if we need the identifier here - we may not since it's in the WPS POST but I don't remember right now
                        // and the identifier changes based on if we need to wrap in an email-when-finished envelope or not
                        url : processPanel.url + '&Identifier=' + processPanel.processIdentifier,
                        method : 'POST',
                        baseParams : {
                            xmlData : data
                        },
                        data : data,
                        listeners : {
                            load : function(store) {
                                LOG.debug('');
                            },
                            exception : function(misc) {
                                LOG.debug('')
                            },
                            scope : this
                        }
                    })
                    processPanel.wpsResponseStore.load();
                }
            }
            ]
        }, config);
        WaterSMART.ProcessFormPanel.superclass.constructor.call(this, config);
    }
});
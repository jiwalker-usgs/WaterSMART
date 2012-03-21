Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    commonAttr : undefined,
    htmlTransform : undefined,
    layer : undefined,
    modelName : undefined,
    modelerName : undefined,
    modelVersion : undefined,
    runVersion : undefined,
    runIdentifier : undefined,
    runDate : undefined,
    wfsUrl : undefined,
    xmlTransform : undefined,
    constructor : function(config) {
        
        if (!config) config = {};
        
        this.commonAttr = config.commonAttr || 'site_no';
        this.layer = config.layer || '';
        this.modelName = config.modelName || '';
        this.modelerName = config.modelerName || '';
        this.runIdentifier = config.runIdentifier || 0;
        this.modelVersion = config.modelVersion || 0;
        this.runDate = config.runDate || undefined;
        this.wfsUrl = config.wfsUrl || '';
        Ext.Ajax.request({
            url: 'xsl/csw-metadata.xsl',
            success: function(response) {
                var xslt = response.responseXML;
                this.htmlTransform = new XSLTProcessor();
                this.htmlTransform.importStylesheet(xslt);
            },
            failure: function() {
            },
            scope: this
        });
        Ext.Ajax.request({
            url: 'xsl/prettyxml.xsl',
            success: function(response) {
                var xslt = response.responseXML;
                this.xmlTransform = new XSLTProcessor();
                this.xmlTransform.importStylesheet(xslt);
            },
            failure: function() {
            },
            scope: this
        });
        
        config = Ext.apply({
            title: 'Metadata',
            id: 'metadata-form',
            bodyPadding: 5,
            region: 'center',
            width: '100%',
            // The form will submit an AJAX request to this URL when submitted
            url: 'pages/index/Utils/isorecord.jsp',
            // Fields will be arranged vertically, stretched to full width
            defaultType: 'textfield',

            // The fields
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
                allowBlank: false
            },{
                fieldLabel: 'Comments',
                name: 'comments',
                allowBlank: true
            },
            new WaterSMART.FileUploadPanel()
            ],
            buttons: [{
                text: 'View Metadata',
                type: 'submit',
                disabled : true,
                formBind: true,
                handler: function(button) {
                    var form = Ext.getCmp('metadata-form');
                    form.getForm().submit({
                        url: form.url,
                        params:{},
                        waitMsg:'Loading...',
                        success: function(x, action) {
                            var form = Ext.getCmp('metadata-form');
                            var xml = action.response.responseXML;
                            var htmlDom = form.htmlTransform.transformToDocument(xml);
                            var xmlDom = form.xmlTransform.transformToDocument(xml);
                            var serializer = new XMLSerializer();
                            var htmlOutput = serializer.serializeToString(htmlDom.documentElement);
                            var xmlOutput = serializer.serializeToString(xmlDom.documentElement);
                                
                            var outputDiv = document.getElementById("xslt-output-div");
                            var htmlDiv = document.createElement("div");
                            htmlDiv.setAttribute("id", "html-tmp-div");
                            htmlDiv.setAttribute("class", "x-hidden");
                            var xmlDiv = document.createElement("div");
                            xmlDiv.setAttribute("id", "xml-tmp-div");
                            htmlDiv.setAttribute("class", "x-hidden");
                            outputDiv.appendChild(htmlDiv);
                            outputDiv.appendChild(xmlDiv);
                                
                            htmlDiv.innerHTML = WaterSMART.replaceURLWithHTMLLinks(htmlOutput);
                            xmlDiv.innerHTML = xmlOutput;
                                
                            new Ext.Window({
                                items: [
                                new Ext.TabPanel({
                                    activeTab: 0,
                                    overflow: 'auto',
                                    autoScroll: true,
                                    items: [
                                    new Ext.Panel({
                                        title: 'Metadata',
                                        autoScroll: true,
                                        overflow: 'auto',
                                        contentEl: 'html-tmp-div'
                                    }),
                                    new Ext.Panel({
                                        title: 'XML Output',
                                        autoScroll: true,
                                        overflow: 'auto',
                                        contentEl: 'xml-tmp-div'
                                    })
                                    ]
                                })
                                ],
                                modal: true,
                                autoScroll: true,
                                width: '70%',
                                height: VIEWPORT.getHeight() - 150
                            }).show();
                            LOG.debug(action);
                        }
                    });
                }
            }, {
                text: 'Submit',
                type: 'submit',
//                disabled : true,
                formBind: true,
                handler: function(button) {
                    var uploadPanel = Ext.getCmp('uploadPanel');
                    var metadataForm = Ext.getCmp('metadata-form').getForm().getValues();
                    var isoFormPanel = button.ownerCt.ownerCt;
                    
                    LOG.debug('isoFormPanel.js::Preparing to upload file.');
                    
                    uploadPanel.getForm().submit({
                        url: uploadPanel.url,
                        params: {
                            name : metadataForm.name,
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
                        success: function(x, action) {
                            
                            LOG.info('isoFormPanel.js::User upload succeeded.');
                            
                            NOTIFY.info({msg:'Upload succeeded'})
                            
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
                                //                                    var form = Ext.getCmp('metadata-form');
                                //                                    var xml = action.response.responseXML;
                                //                            
                                //                                    Ext.Ajax.request({
                                //                                        url: 'service/geonetwork/csw',
                                //                                        method: 'POST',
                                //                                        xmlData: xml,
                                //                                        success: function(response) {
                                //                                            var result = response.responseText;
                                //                                            LOG.debug(result);
                                //                                        },
                                //                                        failure: function(panel, fail) {
                                //                                            LOG.debug(fail);
                                //                                        }
                                //                                    });
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
                }
            }]
        }, config);
        WaterSMART.ISOFormPanel.superclass.constructor.call(this, config);
    }
});

// http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
WaterSMART.replaceURLWithHTMLLinks = function(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

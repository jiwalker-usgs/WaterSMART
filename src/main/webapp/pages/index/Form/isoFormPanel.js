Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    htmlTransform : undefined,
    xmlTransform : undefined,
    modelName : undefined,
    modelerName : undefined,
    modelVersion : undefined,
    runVersion : undefined,
    runIdentifier : undefined,
    runDate : undefined,
    constructor : function(config) {
        
        if (!config) config = {};
        
        this.modelName = config.modelName || '';
        this.modelerName = config.modelerName || '';
        this.runIdentifier = config.runIdentifier || 0;
        this.modelVersion = config.modelVersion || 0;
        this.runDate = config.runDate || undefined;
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
            id: 'test_form',
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
                handler: function(a, b, c) {
                //                    var form = Ext.getCmp('test_form');
                //                    form.getForm().submit({
                //                        url: form.url,
                //                        success: function(x, action) {
                //                            var form = Ext.getCmp('test_form');
                //                            var xml = action.response.responseXML;
                //                            var htmlDom = form.htmlTransform.transformToDocument(xml);
                //                            var xmlDom = form.xmlTransform.transformToDocument(xml);
                //                            var serializer = new XMLSerializer();
                //                            var htmlOutput = serializer.serializeToString(htmlDom.documentElement);
                //                            var xmlOutput = serializer.serializeToString(xmlDom.documentElement);
                //                                
                //                            var outputDiv = document.getElementById("xslt-output-div");
                //                            var htmlDiv = document.createElement("div");
                //                            htmlDiv.setAttribute("id", "html-tmp-div");
                //                            htmlDiv.setAttribute("class", "x-hidden");
                //                            var xmlDiv = document.createElement("div");
                //                            xmlDiv.setAttribute("id", "xml-tmp-div");
                //                            htmlDiv.setAttribute("class", "x-hidden");
                //                            outputDiv.appendChild(htmlDiv);
                //                            outputDiv.appendChild(xmlDiv);
                //                                
                //                            htmlDiv.innerHTML = WaterSMART.replaceURLWithHTMLLinks(htmlOutput);
                //                            xmlDiv.innerHTML = xmlOutput;
                //                                
                //                            new Ext.Window({
                //                                items: [
                //                                new Ext.TabPanel({
                //                                    activeTab: 0,
                //                                    overflow: 'auto',
                //                                    autoScroll: true,
                //                                    items: [
                //                                    new Ext.Panel({
                //                                        title: 'Metadata',
                //                                        autoScroll: true,
                //                                        overflow: 'auto',
                //                                        contentEl: 'html-tmp-div'
                //                                    }),
                //                                    new Ext.Panel({
                //                                        title: 'XML Output',
                //                                        autoScroll: true,
                //                                        overflow: 'auto',
                //                                        contentEl: 'xml-tmp-div'
                //                                    })
                //                                    ]
                //                                })
                //                                ],
                //                                modal: true,
                //                                autoScroll: true,
                //                                width: '70%',
                //                                height: VIEWPORT.getHeight() - 150
                //                            }).show();
                //                            LOG.debug(action);
                //                        },
                //                        params:{},
                //                        waitMsg:'Loading...'
                //                    });
                }
            }, {
                text: 'Submit',
                type: 'submit',
                formBind: true,
                handler: function(a, b, c) {
//                    var form = Ext.getCmp('test_form');
                    
                    var uploadPanel = Ext.getCmp('uploadPanel');
                    
                    uploadPanel.getForm().submit({
                        url: uploadPanel.url,
                        params : {
                            modeltype : this.modelName,
                            wfsUrl : 'http://igsarm-cida-javadev1.er.usgs.gov:8081/geoserver/watersmart/ows',
                            layer : 'watersmart:se_sites',
                            commonAttr : 'site_no'
                        },
                        success: function(x, action) {
                            var form = Ext.getCmp('test_form');
                            form.getForm().submit({
                                url: form.url,
                                modeltype : this.modelName,
                                success: function(x, action) {
                                    LOG.debug('');
//                                    var form = Ext.getCmp('test_form');
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
                                    NOTIFY.error({ msg : fail.result.message})
                                },
                                params: {
                                    transaction: true
                                },
                                waitMsg: 'Saving...'
                            });
                        },
                        failure: function(panel, fail) {
                            NOTIFY.error({ msg : fail.result.message})
                        },
                        waitMsg: 'Saving...'
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

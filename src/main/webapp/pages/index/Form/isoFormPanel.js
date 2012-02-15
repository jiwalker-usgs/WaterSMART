Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    htmlTransform : undefined,
    xmlTransform : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        Ext.Ajax.request({
          url: 'xsl/csw-metadata.xsl',
          success: function(response) {
              var xslt = response.responseXML;
              this.htmlTransform = new XSLTProcessor();
              this.htmlTransform.importStylesheet(xslt);
          },
          failure: function() {
              // fail
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
              // fail
          },
          scope: this
        });
        
        config = Ext.apply({
            title: 'Metadata',
            id: 'test_form',
            bodyPadding: 5,
//            width: 350,
            //layout : 'border',
            region: 'center',
            // The form will submit an AJAX request to this URL when submitted
            url: 'pages/index/Utils/isorecord.jsp',
            // Fields will be arranged vertically, stretched to full width
            defaultType: 'textfield',

            // The fields
            items: [{
                fieldLabel: 'Modeler Name',
                name: 'name',
                allowBlank: false
            },{
//                fieldLabel: 'Organization',
//                name: 'orgName',
//                allowBlank: false
//            },{
                fieldLabel: 'Model Name',
                name: 'model',
                allowBlank: false
            },{
                fieldLabel: 'Model Version',
                name: 'version',
                allowBlank: false
            },{

//                fieldLabel: 'Email',
//                name: 'email',
//                allowBlank: true
//            },{
//                fieldLabel: 'Web Address',
//                name: 'url',
//                allowBlank: true
//            },{
                fieldLabel: 'Run Identifier',
                name: 'title',
                allowBlank: false
            },{
                xtype : 'datefield',
                fieldLabel: 'Run Date',
                name: 'creationDate',
                allowBlank: false
            },{
                fieldLabel: 'Calibration/ Validation Scenario',
                name: 'scenario',
                allowBlank: false
            },{
                fieldLabel: 'Comments',
                name: 'comments',
                allowBlank: true
            },{
//                fieldLabel: 'Abstract',
//                name: 'abstract',
//                allowBlank: true
//            },{
//                fieldLabel: 'Credit',
//                name: 'credit',
//                allowBlank: true
//            },{
                fieldLabel: 'Keywords (comma separated)',
                name: 'keywords',
                allowBlank: true
            },{
                xtype: 'fieldset',
                columnWidth: 0.5,
                title: 'Spatial Extent',
                collapsible: true,
                autoHeight:true,
                defaultType: 'textfield',
                items: [{
                    fieldLabel: 'West',
                    name: 'bboxw',
                    allowBlank: true
                },{
                    fieldLabel: 'South',
                    name: 'bboxs',
                    allowBlank: true
                },{
                    fieldLabel: 'East',
                    name: 'bboxe',
                    allowBlank: true
                },{
                    fieldLabel: 'North',
                    name: 'bboxn',
                    allowBlank: true
                }]
            },{
                xtype: 'fieldset',
                columnWidth: 0.5,
                title: 'Time Extent',
                collapsible: true,
                autoHeight:true,
                items: [{
                    xtype: 'datefield',
                    fieldLabel: 'Start',
                    name: 'timeStart',
                    allowBlank: true
                },{
                    xtype: 'datefield',
                    fieldLabel: 'End',
                    name: 'timeEnd',
                    allowBlank: true
                }]
            }],
            buttons: [{
                    text: 'View Metadata',
                    type: 'submit',
                    formBind: true,
                    handler: function(a, b, c) {
                        var form = Ext.getCmp('test_form');
                        form.getForm().submit({
                            url: form.url,
                            success: function(x, action) {
                                var form = Ext.getCmp('test_form');
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
                            },
                            params:{},
                            waitMsg:'Saving...'
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

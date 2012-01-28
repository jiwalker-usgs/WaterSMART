Ext.ns("WaterSMART");

WaterSMART.ISOFormPanel = Ext.extend(Ext.form.FormPanel, {
    parsedXslt : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        Ext.Ajax.request({
          url: 'xsl/csw-metadata.xsl',
          success: function(response) {
              var xslt = response.responseText;
              this.parsedXslt = xmlParse(xslt);
          },
          failure: function() {
              // fail
          },
          scope: this
        });
        config = Ext.apply({
            title: 'Simple Form',
            id: 'test_form',
            bodyPadding: 5,
            width: 350,
            //layout : 'border',
            region: 'center',
            // The form will submit an AJAX request to this URL when submitted
            url: 'pages/index/Utils/isorecord.jsp',
            // Fields will be arranged vertically, stretched to full width
            defaultType: 'textfield',

            // The fields
            items: [{
                fieldLabel: 'Full Name',
                name: 'name',
                allowBlank: false
            },{
                fieldLabel: 'Organization',
                name: 'orgName',
                allowBlank: false
            },{
                fieldLabel: 'Email',
                name: 'email',
                allowBlank: true
            },{
                fieldLabel: 'Web Address',
                name: 'url',
                allowBlank: true
            },{
                fieldLabel: 'Title',
                name: 'title',
                allowBlank: true
            },{
                xtype : 'datefield',
                fieldLabel: 'Creation Date',
                name: 'creationDate',
                allowBlank: true
            },{
                fieldLabel: 'Abstract',
                name: 'abstract',
                allowBlank: true
            },{
                fieldLabel: 'Credit',
                name: 'credit',
                allowBlank: true
            },{
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
                    text: 'Submit',
                    type: 'submit',
                    formBind: true,
                    handler: function(a, b, c) {
                        var form = Ext.getCmp('test_form');
                        form.getForm().submit({
                            url: form.url,
                            success: function(x, action) {
                                var form = Ext.getCmp('test_form');
                                var xml = xmlParse(action.response.responseText);
                                document.getElementById("tmp-xslt-div").innerHTML =
                                    xsltProcess(xml, form.parsedXslt);
                                new Ext.Window({
                                    items: [
                                        new Ext.Panel({
                                            contentEl: 'tmp-xslt-div'
                                        })
                                    ],
                                    modal: true
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


Ext.ns("NAWQA");

NAWQA.MainMenu = Ext.extend(Ext.Toolbar, {
    optionsPanel : undefined,
    constructor : function(config) {
        if (!config) {
            config = {};
        }
		
        this.optionsPanel = config.optionsPanel;
        
        config = Ext.apply({
            items : [
            {
                xtype : 'loading-tb-item',
				ref : 'loading'
            }
            ,
            '-',
            {
                xtype: 'markersbtn',
                text: "Map Markers",
                markerPanel : this.optionsPanel
            },
            {
                xtype: 'tbspacer',
                width: 100
            },
            '-',
            {
                xtype: 'constituentbtn',
				ref: 'constituent'
            },
            {
                xtype: 'tbspacer',
                width: 30
            },
            {
                text: "Filter",
                menu : {
                    xtype: 'menu',
                    items : [
                    {
                        text : 'By Site Type'
                    },{
                        text : 'By Geographic Region'
                    },{
                        text : 'By Year'
                    }
                    ]
                }
            },
            '->',
            '-',
            {
                xtype : 'compositefield',
                width : 200,
                items : [
                {
                    xtype : 'textfield',
                    fieldLabel : 'Zoom To: ',
                    emptyText : 'Zip Code Or State',
                    itemId : 'textfield-zoom',
                    listeners : {
                        specialkey: function(f,e){
                            if (e.getKey() == e.ENTER) {
                                var zoomButton = f.ownerCt.getComponent('button-zoom')
                                zoomButton.fireEvent('click');
                            }
                        }
                    }
                                 
                },
                {
                    xtype : 'button',
                    text : 'Zoom',
                    itemId : 'button-zoom',
                    listeners : {
                        click : function() {
                            var zoomTextField = this.ownerCt.getComponent('textfield-zoom');
                            var zoomValue = zoomTextField.getValue();
                            zoomTextField.setValue('');
                            if (zoomValue) {
                                LOG.info('mainMenu.js:: Zoom button clicked. Sending request to zoom to: ' + zoomValue);
                                CONTROLLER.zoomTo(zoomValue);
                            }
                        }
                    }
                }
                ]
            },
            '-',
            {
                xtype : 'button',
                text : 'Zoom To Country',
                itemId : 'button-zoom-to-country',
                listeners : {
                    click : function() {
                        CONTROLLER.zoomTo(CONTROLLER.mapPanel.COUNTRY_BBOX);
                    }
                }
            },
            '-',
            {
                text: "Full Configuration"
            }
            ]
        }, config);
		
        NAWQA.MainMenu.superclass.constructor.call(this, config);

    }
});
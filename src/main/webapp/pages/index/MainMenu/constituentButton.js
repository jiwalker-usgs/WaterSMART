Ext.ns("NAWQA.menu");

NAWQA.menu.ConstituentButton = Ext.extend(Ext.Button, {
	configWindow : undefined,
	title : 'Constituent',
	titleSeparator : ':  ',
	value : undefined,
	constructor : function(config) {
		if (!config) {
			config = {};
		}
		
		var constituentStore = new Ext.data.JsonStore({
			root: 'features',
			fields: [
				{name : 'code', mapping : 'properties.code'},
				{name : 'name', mapping : 'properties.name'}
			],
			autoLoad : true,
			method: 'POST',
			url : OpenLayers.ProxyHost + encodeURIComponent(CONFIG.CIDA_GEOSERVER_ENDPOINT + "/ows?service=WPS&version=1.0.0&request=Execute&identifier=gs:ListAttrValues"),
			baseParams : {
				xmlData : '<?xml version="1.0" encoding="UTF-8"?>\n<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">\n<ows:Identifier>gs:ListAttrValues</ows:Identifier>\n<wps:DataInputs>\n<wps:Input>\n<ows:Identifier>layer-name</ows:Identifier>\n<wps:Data>\n<wps:LiteralData>nawqa_map:NAWQA_MAP</wps:LiteralData>\n</wps:Data>\n</wps:Input>\n<wps:Input>\n<ows:Identifier>identifier</ows:Identifier>\n<wps:Data>\n<wps:LiteralData>STATE_NAME</wps:LiteralData>\n</wps:Data>\n</wps:Input>\n</wps:DataInputs>\n<wps:ResponseForm>\n<wps:RawDataOutput mimeType="application/json">\n<ows:Identifier>output</ows:Identifier>\n</wps:RawDataOutput>\n</wps:ResponseForm>\n</wps:Execute>'
			}
		});
		
		var pnl = new Ext.grid.GridPanel({
			store : constituentStore,
			viewConfig: {
				forceFit: true
			},
			columns : [
				{
					header: 'Constituent',
					dataIndex : 'name'
				}
			]
		});
		
		this.configWindow = new Ext.Window({
			closeAction : 'hide',
			layout : 'fit',
			closable : false,
			resizable : true,
			draggable : true,
			height : 480,
			width : '66%',
			items : [pnl]
		});
		
		config = Ext.apply({
			text: this.title + this.titleSeparator + "Loading...",
			enableToggle : true
		}, config);
		
		NAWQA.menu.ConstituentButton.superclass.constructor.call(this, config);
		
		this.on('toggle', function(btn, pressed) {
			if (pressed) {
				this.configWindow.show();
				this.configWindow.alignTo(this.getEl(), 'tl-bl?');
			} else {
				this.configWindow.hide();
			}
		}, this);
		
		pnl.on('rowdblclick', function(grid, rowIndex, e) {
			this.setConstituent(grid.getStore().getAt(rowIndex));
		}, this);
		
		constituentStore.on('load', function(store, records, options) {
			this.setConstituent(null);
		}, this);
	},
	setConstituent : function(record) {
		var constituent = "Select A Constituent...";
		var code = undefined;
		if (record) {
			code = record.get("code");
			var name = record.get("name");
			
			if (80 < name.length) {
				name = name.substr(0, 35) + " ... " + name.substr(name.length - 40);
			}
			
			constituent = "[" + code + "] - " + name;
		}
		
		this.value = code;
		this.setText(this.title + this.titleSeparator + constituent);
		this.toggle(false);
		
		CONTROLLER.refreshLayers();
	}
});

Ext.reg('constituentbtn', NAWQA.menu.ConstituentButton);
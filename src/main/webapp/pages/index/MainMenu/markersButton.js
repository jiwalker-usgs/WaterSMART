Ext.ns("NAWQA.menu");

NAWQA.menu.MarkersButton = Ext.extend(Ext.Button, {
	markerWindow : undefined,
	constructor : function(config) {
		if (!config) {
			config = {};
		}
		
		var pnl = config.markerPanel;
//		var text = config.text;
		
		var binningStrategyCombo = new Ext.form.ComboBox({
			store: new Ext.data.ArrayStore({
				autoDestroy: true,
				fields: ['value', 'fullname'],
				data : [
				['EqualCount', 'Equal Count'],
				['Custom', 'Something Else?']
				]
			}),
			displayField: 'fullname',
			editable : false,
			mode: 'local',
			forceSelection: true,
			triggerAction: 'all',
			emptyText : "Select a strategy...",
			selectOnFocus: true,
			width: 135,
			valueField : 'value'
		});
		
		this.markerWindow = new Ext.Window({
			closeAction : 'hide',
			closable : false,
			resizable : false,
			draggable : true,
			items : [
				{
					xtype : 'compositefield',
					hideLabel : true,
					ref : "binningStrategy",
					items : [
						binningStrategyCombo,
						{
							xtype : "textfield",
							width : 25,
							ref : "numBins",
							value : '5'
						}
					]
				},
//			{
//				xtype : 'button',
//				text : "Add markers to map",
//				handler : function() {
//					Ext.Ajax.request({
//						url : OpenLayers.ProxyHost + encodeURIComponent(CONFIG.CIDA_GEOSERVER_ENDPOINT + "/ows?service=WPS&version=1.0.0&request=Execute&identifier=gs:Import"),
//						method : "POST",
//						xmlData : new NAWQA.ImportProcess({
//							reference: new NAWQA.AggregateProcess().createWpsExecuteReference()
//						}).createWpsExecuteRequest(),
//						success : function(response) {
//							var resp = response.responseText;
//							LOG.debug(resp);
//                            
//							// We want to first remove the previous layer
//							var oldLayers = CONTROLLER.mapPanel.map.getLayersByName(CONFIG.MAP_QUERIED_LAYER_NAME);
//							CONTROLLER.mapPanel.removeLayers(oldLayers);
//							
//							var makeBins = function(layerName, count) {
//								Ext.Ajax.request({
//									url : OpenLayers.ProxyHost + encodeURIComponent(CONFIG.CIDA_GEOSERVER_ENDPOINT + "/ows?service=WPS&version=1.0.0&request=Execute&identifier=gs:Binning"),
//									method : "POST",
//									xmlData : new NAWQA.BinningProcess({
//										layerName : layerName,
//										numBins : count
//									}).createWpsExecuteRequest(),
//									success : function(response) {
//										var resp = Ext.util.JSON.decode(response.responseText);
//										var bins = [];
//										Ext.each(resp.posts, function(item, index, all) {
//											if (0 !== index) {
//												var result = {
//													hi : all[index],
//													hiBound : 'inc',
//													low : all[index-1],
//													lowBound : 'exc'
//												};
//												
//												if (1 === index) {
//													result.lowBound = 'inc';
//												}
//												
//												bins.push(result);
//											}
//										});
//										
//										var toQS = function(bin) {
//											var result = "";
//											
//											result += "&low=" + bin.low;
//											result += "&lowBound=" + bin.lowBound;
//											result += "&hi=" + bin.hi;
//											result += "&hiBound=" + bin.hiBound;
//											
//											result += "&hexColor=" + bin.hexColor;
//											result += "&size=7";
//											
//											return result;
//										}
//										
//										var colors = new Ext.ColorPalette().colors;
//										
//										Ext.each(bins, function(bin, index, all) {
//											
//											bin.hexColor = colors[((index+25) % colors.length)];
//											
//											CONTROLLER.mapPanel.addLayers(new OpenLayers.Layer.WMS(
//												CONFIG.MAP_QUERIED_LAYER_NAME, CONFIG.CIDA_GEOSERVER_ENDPOINT + "agoutput/wms",
//												{
//													LAYERS: layerName,
//													SLD : window.location + "custom-sld.xml?layer=" + layerName + toQS(bin),
//													transparent : true
//												},
//												{
//													metadata : {
//														identifiable : true,
//														bin : bin
//													},
//													extractAttributes : true,
//													opacity : '0.5',
//													displayOutsideMaxExtent: true,
//													isBaseLayer: false,
//													transitionEffect : 'resize'
//												} 
//												));
//										});
//									}
//								});
//							};
//							
//							makeBins(resp, this.markerWindow.binningStrategy.numBins.getValue());
//							
//                            
//						},
//						failure : function(response) {
//							LOG.error('optionsPanel.js::There was an error retrieving points from WFS endpoint');
//						},
//						scope : this
//					})
//				},
//				scope : this
//			},
			pnl
			],
			listeners : {
				hide : function() {
					this.toggle(false, true);
				},
				scope : this
			}
		});
		
		config = Ext.apply({
			enableToggle : true
		}, config);
		
		NAWQA.menu.MarkersButton.superclass.constructor.call(this, config);
		
		this.on('toggle', function(btn, pressed) {
			if (pressed) {
				this.markerWindow.show();
				this.markerWindow.alignTo(this.getEl(), 'tl-bl?');
			} else {
				this.markerWindow.hide();
			}
		}, this);
	},
	getMenuClass : function() {
		return 'x-btn-arrow';
	}
});

Ext.reg('markersbtn', NAWQA.menu.MarkersButton);
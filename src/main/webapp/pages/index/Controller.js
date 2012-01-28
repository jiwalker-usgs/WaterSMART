Ext.ns("NAWQA");


NAWQA.Controller = Ext.extend(Ext.util.Observable, {
	mapPanel : undefined,
	mainMenu : undefined,
	
	
	constructor : function(config) {
		if (!config) config = {};
		
		this.mapPanel = config.mapPanel;
		this.mainMenu = config.mainMenu;
		
		this.addEvents({
			"refreshlayers" : true
		});
		
		config = Ext.apply({
			
			}, config);
		
		NAWQA.Controller.superclass.constructor.call(this, config);
		
		var baseLayerCount = this.mapPanel.layers.getCount();
		baseLayerCount = baseLayerCount - this.mapPanel.map.getLayersByName(CONFIG.MAP_QUERIED_LAYER_NAME).length;
		
		this.mainMenu.optionsPanel.binStore.on('add', function(store, records, index) {
			Ext.each(records, function(item, offset) {
				LOG.debug("bin add " + index + " + " + offset + " + "  + baseLayerCount + " = " + (index + offset + baseLayerCount));
				if (CONFIG.MAP_QUERIED_LAYER_NAME === item.data.title && -1 === this.mapPanel.layers.indexOf(item)) {
					this.mapPanel.layers.insert(index + offset + baseLayerCount, item)
				}
			}, this);
		}, this);
		this.mainMenu.optionsPanel.binStore.on('remove', function(store, records, index) {
			LOG.debug("bin rem");
			this.mapPanel.layers.remove(records);
		}, this);
		
		this.mapPanel.layers.on('add', function(store, records, index) {
			Ext.each(records, function(item, offset) {
				LOG.debug("map add " + index + " - " + offset + " - "  + baseLayerCount + " = " + (index - offset - baseLayerCount));
				if (CONFIG.MAP_QUERIED_LAYER_NAME === item.data.title && -1 === this.mainMenu.optionsPanel.binStore.indexOf(item)) {
					this.mainMenu.optionsPanel.binStore.insert(index - offset - baseLayerCount, item)
				}
			}, this);
		}, this);
		this.mapPanel.layers.on('remove', function(store, records, index) {
			LOG.debug("map rem");
			this.mainMenu.optionsPanel.binStore.remove(records);
		}, this);
	},
        zoomTo : function (zoomValue) {
            LOG.debug('Controller.js:: Attempting to zoom to : ' + zoomValue);
            // 5 digit zip - ^\d{5}$ 
            // 2 character state abbr - ^[a-zA-Z]{2}$
            if (zoomValue.CLASS_NAME && zoomValue.CLASS_NAME == "OpenLayers.Bounds") {
                this.mapPanel.map.zoomToExtent(zoomValue, false);
            } else if (isNaN(zoomValue)) {
                NAWQA.GeoUtils.zoomToState(this.mapPanel.map, zoomValue);
            } else {
                NAWQA.GeoUtils.zoomToZipCode(this.mapPanel.map, zoomValue);
            }
        },
        polygonCreated : function (feature) {
            var exportTypeDropdown = '';
            var exportButton = new Ext.Button({
                text: 'Export'
            })
//            
//            var exportTypesCombo = new Ext.form.ComboBox({
//                mode: local,
//                store: new Ext.data.ArrayStore({
//                id: 0,
//                fields: [
//                    'export-type'
//                ],
//                data: [[1, 'item1'], [2, 'item2']]
//            }),
//            })
            
            var compositeField = new Ext.form.CompositeField({
                width : 300,
                items : [
                    exportButton
                ]
            })
            
//            var controlDiv = Ext.DomHelper.insertHtml('afterEnd', table, '<div class="framedcloud-table-controlset" id="framedcloud-table-controlset-'+index+'"></div>');
//            var selectControl = Ext.DomHelper.insertHtml('beforeEnd', controlDiv, 'Export to: <select class="framedcloud-table-controlset-select" id="framedcloud-table-controlset-select-'+index+'"><option></option></select>');
//
//            Ext.each(this.AVAILABLE_EXPORT_TYPES, function(type){
//                Ext.DomHelper.insertHtml('beforeEnd', selectControl, '<option value='+type+'>'+type+'</option>');
//            }, this)
            
            NOTIFY.actionRequired({
                title : 'Export As...',
                items : [compositeField]
            });
        },
	refreshLayers : function() {
		var eventName = "refreshlayers";
		var fullOptions = {};
		
		fullOptions.pcode = this.mainMenu.constituent.value;
		
		
		LOG.debug(eventName+ ": " + Ext.util.JSON.encode(fullOptions));
		this.fireEvent(eventName, this.mapPanel, fullOptions);
	}
});

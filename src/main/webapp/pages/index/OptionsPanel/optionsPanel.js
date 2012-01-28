Ext.ns("NAWQA");

NAWQA.OptionsPanel = Ext.extend(Ext.Panel, {
	binStore : undefined,
	constructor : function(config) {
		LOG.debug('optionsPanel.js::constructor()');
		if (!config) config = {};
		
		var binStore = config.binStore
		if (!binStore) binStore = new GeoExt.data.LayerStore({})
		this.binStore = binStore;
		
		config = Ext.apply({
			id : 'options-panel',
			animate : true,
			border : false,
			items : [
			new NAWQA.SortableBinningPanel({
				store : binStore
			})
			]
		}, config);
		NAWQA.OptionsPanel.superclass.constructor.call(this, config);
		LOG.debug('optionsPanel.js::constructor(): Construction complete.');
	}
});

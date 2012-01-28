Ext.ns("NAWQA");

NAWQA.SortableBinningPanel = Ext.extend(Ext.grid.GridPanel, {
	constructor : function(config) {
		LOG.debug('sortableBinningPanel.js::constructor()');
		
		config = Ext.apply({
			border : false,
			height : 200,
			colModel: new Ext.grid.ColumnModel({
				columns: [
				{
					id: 'binBounds', 
					header: '(Low - High]', 
					width: 100, 
					sortable: true, 
					dataIndex: 'layer',
					renderer : {
						fn : function(value, metaData, record, rowIndex, colIndex, store) {
							var bin = value.metadata.bin
							return bin.low.toFixed(2) + " - " + bin.hi.toFixed(2);
						}
					}
				},
				{
					xtype: 'templatecolumn',
					id: 'color', 
					header: 'Color', 
					width: 50, 
					dataIndex: 'layer',
					tpl : '<div class="sortable-binning-panel-color-col" style="background-color:#{values.layer.metadata.bin.hexColor}">&nbsp;</div>',
					listeners : {
						click : function(col, grid, rowIndex, e) {
							var rec = this.getSelectionModel().getSelected();
							var picker = new Ext.ColorPalette({
								value:rec.data.layer.metadata.bin.hexColor
								});
							
							new Ext.Tip({
								items : [
								picker
								]
							}).showBy(grid.getView().getRow(rowIndex), 'tl-tr?');
							
							var rowSelected = function(picker, color){
								var rec = this.getSelectionModel().getSelected();
								rec.data.layer.metadata.bin.hexColor = color;
								var sld = rec.data.layer.params.SLD;
								sld = sld.substr(0, sld.length - 6);
								sld = sld + color;
								rec.data.layer.params.SLD = sld;
								this.getStore().fireEvent("update", this.getStore(), rec, Ext.data.Record.EDIT);
								rec.data.layer.redraw();
								picker.ownerCt.destroy();
							};
							
							picker.on("select", rowSelected, this);
						},
						scope : this
					}
				}
				],
				defaults : {
					sortable : false,
					menuDisabled : true
				}
			}),
			viewConfig : {
				emptyText : 'No Criteria Selected'
			},
			ddText : '{0} selected row {1}',
			ddGroup : 'bin-dd',
			iconCls: 'icon-grid',
			listeners : {
				sortchange : function(grid, sortInfo){
					var gridStoreDataArray = grid.getStore().data.items;
					LOG.debug('sortableBinningPanel.js:: Column sorted. Column : "' + sortInfo.field + '", Direction : "'+sortInfo.direction+'"');
				},
				render : function(grid) {
					grid.dropZone = new Ext.dd.DropZone(grid.getView().scroller, {
						ddGroup : 'bin-dd',
						//      If the mouse is over a grid row, return that node. This is
						//      provided as the "target" parameter in all "onNodeXXXX" node event handling functions
						getTargetFromEvent: function(e) {
							//							LOG.debug("getTargetFromEvent Hit!");
							return e.getTarget(grid.getView().rowSelector);
						},

						//      On entry into a target node, highlight that node.
						onNodeEnter : function(target, dd, e, data){ 
						//							LOG.debug("onNodeEnter hit!");
						//							Ext.fly(target).addClass('bin-target');
						},

						//      On exit from a target node, unhighlight that node.
						onNodeOut : function(target, dd, e, data){ 
						//							LOG.debug("onNodeOut hit!");
						//							Ext.fly(target).removeClass('bin-target');
						},

						//      While over a target node, return the default drop allowed class which
						//      places a "tick" icon into the drag proxy.
						onNodeOver : function(target, dd, e, data){ 
							//							LOG.debug("onNodeOver hit!");
							return Ext.dd.DropZone.prototype.dropAllowed;
						},

						//      On node drop we can interrogate the target to find the underlying
						//      application object that is the real target of the dragged data.
						//      In this case, it is a Record in the GridPanel's Store.
						//      We can use the data set up by the DragZone's getDragData method to read
						//      any data we decided to attach in the DragZone's getDragData method.
						onNodeDrop : function(target, dd, e, data){
							LOG.debug("onNodeDrop hit!");
							var rowIndex = grid.getView().findRowIndex(target);
							var store = grid.getStore();
							var selModel = grid.getSelectionModel();
							if (selModel.hasSelection()) {
								var rec = selModel.getSelected();
								store.remove(rec)
								store.insert(rowIndex, rec);
							}
							
							return true;
						}
					});
				}
			},
			store : config.store,
			enableDragDrop : true
		}, config);
		NAWQA.SortableBinningPanel.superclass.constructor.call(this, config);
		LOG.debug('sortableBinningPanel.js::constructor(): Construction complete.');
	}
});

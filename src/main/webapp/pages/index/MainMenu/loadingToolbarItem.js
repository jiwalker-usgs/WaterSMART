Ext.ns("NAWQA.menu");

/**
 * This object appears as a spinner/loading bar on the main menu bar at the top left of the application
 */
NAWQA.menu.LoadingToolbarItem = Ext.extend(Ext.Toolbar.Item, {
    constructor : function(config) {
        if (!config) {
            config = {};
        }
		
        config = Ext.apply({
            autoEl: {
                tag : 'img',
                src : 'js/ext/resources/images/default/shared/loading-balls.gif'
            },
            hidden : true,
            boxMinWidth : 50,
            width : 50,
            hideMode : 'visibility'
        }, config);
		
        NAWQA.menu.LoadingToolbarItem.superclass.constructor.call(this, config);
        
        Ext.Ajax.on({
            'ajax-request-firing' : function(args){
                LOG.debug('Ajax request is firing.');
                if (!this.isVisible()) this.show();
            },
            'ajax-requests-complete' : function(args) {
                LOG.debug('Ajax requests have completed with no errors');
                if (this.isVisible() && !Ext.Ajax.isLoading()) this.hide();
            },
            'ajax-request-exception' : function(args) {
                var response = args.response;
                LOG.error('Ajax requests have completed with errors: ' + response.status);
                this.hide();
                NOTIFY.error({
                    msg : 'Application received a server status of ' + response.status + ' (' + response.statusText + ')' + 
                          '<br />Check your browser\'s console log for further details.'
                })
            },
            scope : this
        })
    }
});

Ext.reg('loading-tb-item', NAWQA.menu.LoadingToolbarItem);
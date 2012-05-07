Ext.ns("WaterSMART");

WaterSMART.ModelPanel = Ext.extend(Ext.Panel, {
    cswStore : undefined,
    modelPanels : [],
    modelTitle : undefined,
    constructor : function(config) {
        LOG.trace('ModelPanel.js::constructor()');
        if (!config) config = {};
        
        this.cswStore = config.cswStore;
        
        LOG.trace('ModelPanel.js::Beginning to parse through CSW store with ' + this.cswStore.getRange().length + ' items');
        Ext.each(this.cswStore.getRange(), function(storeItem, itemIndex, allItems) {
            var panelInfo = {};
            
            panelInfo.fileIdentifier = storeItem.get('fileIdentifier');
            panelInfo.metadataStandardName = storeItem.get('metadataStandardName') || '';
            panelInfo.metadataStandardVersion = storeItem.get('metadataStandardVersion') || '';
            panelInfo.dateStamp = storeItem.get('dateStamp') || '';
            panelInfo.language = storeItem.get('language') || '';
            panelInfo.runPanels = [];
            
            Ext.each(storeItem.get('identificationInfo'), function(idItem) {
                
                // We have a citation identification block
                if (idItem.citation !== undefined) { 
                    LOG.trace('ModelPanel.js::Citation Identification block found. Parsing out citation information');
                    this.title = idItem.citation.title.CharacterString.value
                    this['abstract'] = idItem['abstract'].CharacterString.value || '';
                    
                    
                    if (idItem.citation.date !== undefined && idItem.citation.date.length > 0) {
                        Ext.each(idItem.citation.date, function(dateItem) {
                            if (dateItem.dateType.codeListValue.toLowerCase() === 'revision') this.lastRevisedDate = dateItem.date[dateItem.date.length - 1].DateTime.value
                        }, this)
                    } 
                    
                    if (idItem.graphicOverview !== undefined && idItem.graphicOverview.length > 0) {
                        this.graphicOverview = [];
                        Ext.each(idItem.graphicOverview, function(goItem) {
                            this.graphicOverview.push(goItem)
                        }, this)
                    }
                }
                
                // We have a service identification block. We create run panels here
                if (idItem.serviceIdentification !== undefined) { 
                    LOG.trace('ModelPanel.js::Service Identification block found. Parsing out service information');
                    if (idItem.serviceIdentification.id.toLowerCase() === 'ncsos') {
                        this.runPanels.push(new WaterSMART.RunPanel({
                            serviceIdentification : idItem.serviceIdentification
                        }))
                    }
                }
                
                if (idItem.serviceIdentification !== undefined) { 
                    LOG.trace('ModelPanel.js::Service Identification block found. Parsing out service information');
                    if (idItem.serviceIdentification.id.toLowerCase() === 'ows') {
                        this.owsEndpoint = idItem.serviceIdentification.operationMetadata.linkage.URL;
                        this.owsResourceName = idItem.serviceIdentification.operationMetadata.name.CharacterString.value;
                    }
                }
                
            }, panelInfo)
            
            var html = '<div class="run-row"><span class="run-label">Language: </span> <span class="run-value">' + panelInfo.language + '</span></div>';
            html += '<div class="run-row"><span class="run-label">Date: </span> <span class="run-value">' + panelInfo.dateStamp + '</span></div>';
            html += '<div class="run-row"><span class="run-label">Date Last Revised: </span> <span class="run-value">' + panelInfo.lastRevisedDate + '</span></div>';
            
            this.modelPanels.push(new Ext.Panel({
                title : panelInfo.title,
                id : panelInfo.fileIdentifier,
                height: 'auto',
                width : '100%',
                html : html,
                panelInfo : panelInfo,
                listeners : {
                afterrender : function(me) {
                    me.body.on('click', function(){
                        var activePanel = Ext.ComponentMgr.get(this.id);
                        
                        // This has to be cloned because when a new model is selected, the previous
                        // set of panels belonging to that panel are destroyed in order to clear out 
                        // the panel they sit in. We don't want to destroy the originals
                        var runPanelsClone = [];
                        Ext.each(activePanel.panelInfo.runPanels, function(panel){
                            panel.panelInfo.owsEndpoint = this.me.panelInfo.owsEndpoint
                            panel.panelInfo.owsResourceName = this.me.panelInfo.owsResourceName
                            panel.panelInfo.fileIdentifier = this.me.panelInfo.fileIdentifier
                            this.runPanelsClone.push(panel.cloneConfig());
                        }, {
                            me : me,
                            runPanelsClone : runPanelsClone
                        })
                        
                        activePanel.ownerCt.ownerCt.modelSelected({
                            runPanels : runPanelsClone,
                            panelInfo : activePanel.panelInfo
                        })
                        
                        Ext.each(me.ownerCt.modelPanels, function(modelPanel) {
                            if (modelPanel !== this.activePanel) {
                                modelPanel.collapse(true);
                            }
                        }, {
                            me : me,
                            activePanel : activePanel
                        })
                        
                        activePanel.ownerCt.setDisabled(true);
                        
                    }, me)
                },
                scope : this
            }
            }))
        }, this)
        
        config = Ext.apply({
            id: 'model-panel',
            items : this.modelPanels
            
        }, config);
        WaterSMART.ModelPanel.superclass.constructor.call(this, config);
    }
});
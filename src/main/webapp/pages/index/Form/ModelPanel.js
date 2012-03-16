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
                
                // We have a service identification block. 
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
            
            var html = 'Language: ' + panelInfo.language;
            html += '<br />Date: ' + panelInfo.dateStamp;
            html += '<br />Date Last revised: ' + panelInfo.lastRevisedDate;
            
            this.modelPanels.push(new Ext.Panel({
                title : panelInfo.title,
                id : panelInfo.fileIdentifier,
                height: 'auto',
                width : '100%',
                html : html,
                panelInfo : panelInfo,
                listeners : {
                afterrender : function(me) {
                    me.body.on('mouseover', function(event, element){
                        var activePanel = Ext.ComponentMgr.get(element.parentElement.parentElement.attributes.id.value);
                        
                        // This has to be cloned because when a new model is selected, the previous
                        // set of panels belonging to that panel are destroyed in order to clear out 
                        // the panel they sit in. We don't want to destroy the originals
                        var runPanelsClone = [];
                        Ext.each(activePanel.panelInfo.runPanels, function(panel){
                            this.push($.extend(true, {}, panel));
                        }, runPanelsClone)
                        
                        activePanel.ownerCt.ownerCt.modelSelected({
                            runPanels : runPanelsClone,
                            panelInfo : activePanel.panelInfo
                        })
                    }, this)
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
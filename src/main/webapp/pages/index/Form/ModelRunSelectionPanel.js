Ext.ns("WaterSMART");

WaterSMART.ModelRunSelectionPanel = Ext.extend(Ext.Panel, {
    commonAttr : undefined,
    cswStore : undefined,
    mapPanel : undefined,
    modelStore : undefined,
    processStore : undefined,
    runPanel : undefined,
    constructor : function(config) {
        if (!config) config = {};
        
        this.commonAttr = config.commonAttr;
        this.cswStore = config.cswStore;
        this.mapPanel = config.mapPanel;
        
        this.updateModelStore();
        
        this.runPanel = this.createRunPanel();
        
        config = Ext.apply({
            id: 'model-run-selection-panel',
            region: 'center',
            layout : 'border',
            tbar : [
            {
                xtype: 'tbtext',
                text: 'Models:'
            },
            {
                xtype: 'combo',
                id : 'model-combobox',
                store: this.modelStore,
                autoWidth: true,
                triggerAction : 'all',
                width : 'auto',
                mode : 'local',
                editable : false,
                emptyText: 'Select A Model',
                displayField : 'title',
                listeners : {
                    select : function(combo, record) {
                        LOG.debug('ModelRunSelectionPanel.js::User selected a model');
                        var panelInfo = {};
                        var storeItem = record.get('rec');
                        
                        panelInfo.fileIdentifier = storeItem.get('fileIdentifier');
                        panelInfo.metadataStandardName = storeItem.get('metadataStandardName') || '';
                        panelInfo.metadataStandardVersion = storeItem.get('metadataStandardVersion') || '';
                        panelInfo.dateStamp = storeItem.get('dateStamp') || '';
                        panelInfo.language = storeItem.get('language') || '';
                        panelInfo.runPanels = [];
                        panelInfo.metadataStandardName = storeItem.get('metadataStandardName');
                        panelInfo.metadataStandardVersion = storeItem.get('metadataStandardVersion');
                        
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
                        
                        var runPanelsClone = [];
                        Ext.each(panelInfo.runPanels, function(panel){
                            panel.panelInfo.owsEndpoint = this.panelInfo.owsEndpoint;
                            panel.panelInfo.owsResourceName = this.panelInfo.owsResourceName;
                            panel.panelInfo.fileIdentifier = this.panelInfo.fileIdentifier;
                            panel.panelInfo.metadataStandardName = this.panelInfo.metadataStandardName;
                            panel.panelInfo.metadataStandardVersion = this.panelInfo.metadataStandardVersion;
                            this.runPanelsClone.push(panel.cloneConfig());
                        }, {
                            panelInfo : panelInfo,
                            runPanelsClone : runPanelsClone
                        })
                        
                        this.modelSelected({
                            runPanels : runPanelsClone,
                            panelInfo : panelInfo
                        })
                    },
                    scope : this
                }
            }
            ],
            items : [
            this.runPanel
            ]
        }, config);
        WaterSMART.ModelRunSelectionPanel.superclass.constructor.call(this, config);
    
        var wpsCapsStore = new CIDA.WPSCapabilitiesStore({
            url : CONFIG.WPS_URL + '/WebProcessingService?Service=WPS&Request=GetCapabilities',
            listeners : {
                load : function(store) {
                    var processArray = [];
                    
                    Ext.iterate(store.getRange()[0].get("processOfferings"), function(key, val){
                        this.push([
                            val.title,
                            val
                            ])
                    }, processArray)
                    this.processStore = new Ext.data.ArrayStore({
                        fields : ['title', 'process'],
                        idIndex : 0
                    })
                    this.processStore.loadData(processArray);
                    
                    this.getTopToolbar().addField({
                        xtype: 'tbseparator'
                    })
                    
                    this.getTopToolbar().addField({
                        xtype: 'tbtext',
                        text: 'Processes:'
                    })
                    
                    this.getTopToolbar().addField({
                        xtype : 'combo',
                        id : 'wps-process-combo',
                        store : this.processStore,
                        autoWidth : true,
                        triggerAction : 'all',
                        width : 'auto',
                        mode : 'local',
                        editable : false,
                        emptyText : 'Select A Process',
                        displayField : 'title',
                        disabled : true,
                        listeners : {
                            select : function(combo, record) {
                                LOG.debug('ModelRunSelectionPanel.js:: User selected a WPS process: ' + record.id);
                                var describeProcessStore = new CIDA.WPSDescribeProcessStore({
                                    url : CONFIG.WPS_URL + '/WebProcessingService?Service=WPS&Request=DescribeProcess&Identifier=' + record.get('process').identifier,
                                    listeners : {
                                        load : function(store) {
                                            
                                            var processFormPanel = new WaterSMART.ProcessFormPanel({
                                                width: '100%',
                                                url : CONFIG.WPS_URL + '/WebProcessingService?Service=WPS&Request=Execute',
                                                processIdentifier : record.get('process').identifier,
                                                processTitle : record.id,
                                                processStore : store,
                                                wfsUrl : this.runPanel.currentlySelectedRun.panelInfo.owsEndpoint,
                                                layerName : this.runPanel.currentlySelectedRun.panelInfo.owsResourceName,
                                                commonAttribute : this.commonAttr,
                                                sosEndpoint : this.runPanel.currentlySelectedRun.panelInfo.operationURL
                                            });

                                            var modalRunWindow = new Ext.Window({
                                                width: '30%',
                                                height : 'auto',
                                                modal : true,
                                                items : [ processFormPanel ]
                                            })

                                            modalRunWindow.show();
                                        },
                                        scope : this
                                    }
                                })
                                describeProcessStore.load();
                            },
                            scope : this
                        }
                    })
                    
                    this.doLayout();
                },
                scope : this
            }
        })
        wpsCapsStore.load();
    },
    createRunPanel : function() {
        return new Ext.Panel({
            id : 'run-panel',
            title : 'Runs',
            region : 'center',
            height : '100%',
            disabled : true,
            currentlySelectedRun : undefined,
            tbar : [
            {
                xtype : 'button',
                id : 'edit-selected-run-button',
                text : 'Edit Selected Run',
                disabled : true,
                listeners : {
                    click : function() {
                        LOG.debug('ModelRunSelectionPanel.js::User clicked on "Edit Selected Run" button.')
                        var selectedRun = this.runPanel.currentlySelectedRun;
                        var comboValue = this.getTopToolbar().get('model-combobox').getValue();
                        var modelStore = this.getTopToolbar().get('model-combobox').getStore().getById(comboValue);
                        var modelId = modelStore.data.rec.data.fileIdentifier;
                        var serviceIdentification = selectedRun.serviceIdentification;
                        var wfsUrl = '';
                        var layer = '';
                        var commonAttr = this.commonAttr;
                        var modelVersion = 0;
                        var runIdentifier = 0;
                        var abstrakt = '';
                        var runDate;
                        var scenario;
                        
                        modelVersion = serviceIdentification.citation.edition.CharacterString.value.split('.')[0];
                        runIdentifier = serviceIdentification.citation.edition.CharacterString.value.split('.')[1];
                        abstrakt = serviceIdentification['abstract'].CharacterString.value;
                        runDate = Date.parseDate(serviceIdentification.citation.date[0].date[0].DateTime.value.split('T')[0], 'Y-m-d');
                        scenario = serviceIdentification.citation.title.CharacterString.value;
                        
                        for (var i = 0;i < modelStore.data.rec.data.identificationInfo.length;i++) {
                            var iiItem = modelStore.data.rec.data.identificationInfo[i];
                            
                            if (!wfsUrl && iiItem.serviceIdentification && iiItem.serviceIdentification.id.toLowerCase() === 'ows') {
                                wfsUrl = iiItem.serviceIdentification.operationMetadata.linkage.URL;
                                layer = iiItem.serviceIdentification.operationMetadata.name.CharacterString.value;
                            }
                        }
                        
                        var isoFormPanel = new WaterSMART.ISOFormPanel({
                            title : selectedRun.title,
                            modelId : modelId,
                            'abstract' : abstrakt,
                            commonAttr : commonAttr,
                            create : false,
                            layer : layer,
                            modelerName : WATERSMART.USER_NAME,
                            modelName : comboValue,
                            modelVersion : modelVersion,
                            runIdentifier : runIdentifier,
                            wfsUrl : wfsUrl,
                            runDate : runDate,
                            scenario : scenario
                        });
                    
                        var modalRunWindow = new Ext.Window({
                            width: '30%',
                            height : 'auto',
                            modal : true,
                            items : [ isoFormPanel ]
                        })
                    
                        modalRunWindow.show();
                    },
                    scope : this
                }
            },
            {
                xtype : 'button',
                id : 'create-run-button',
                text : 'Create A Run',
                listeners : {
                    click : function() {
                        
                        LOG.debug('ModelRunSelectionPanel.js::User clicked on "Create A Run" button.')
                        var comboValue = this.getTopToolbar().get('model-combobox').getValue();
                        var modelStore = this.getTopToolbar().get('model-combobox').getStore().getById(comboValue);
                        var modelId = modelStore.data.rec.data.fileIdentifier;
                        var wfsUrl = '';
                        var layer = '';
                        var commonAttr = this.commonAttr;
                        var modelVersion = 0;
                        var runIdentifier = 0;
                        
                        for (var i = 0;i < modelStore.data.rec.data.identificationInfo.length;i++) {
                            var iiItem = modelStore.data.rec.data.identificationInfo[i];
                            
                            if (iiItem.serviceIdentification && iiItem.serviceIdentification.id.toLowerCase() === 'ncsos') {
                                modelVersion = iiItem.serviceIdentification.citation.edition.CharacterString.value.split('.')[0];
                                
                                var runVersion = iiItem.serviceIdentification.citation.edition.CharacterString.value.split('.')[1];
                                if (parseInt(runVersion) > this.runVersion) this.runVersion = runVersion;
                            } 
                            
                            if (!wfsUrl && iiItem.serviceIdentification && iiItem.serviceIdentification.id.toLowerCase() === 'ows') {
                                wfsUrl = iiItem.serviceIdentification.operationMetadata.linkage.URL;
                                layer = iiItem.serviceIdentification.operationMetadata.name.CharacterString.value;
                            }
                        }
                        runIdentifier++;
                        
                        var isoFormPanel = new WaterSMART.ISOFormPanel({
                            title : 'Create A New Run',
                            modelId : modelId,
                            commonAttr : commonAttr,
                            create : true,
                            layer : layer,
                            modelerName : WATERSMART.USER_NAME,
                            modelName : comboValue,
                            modelVersion : modelVersion,
                            runIdentifier : runIdentifier,
                            scenario : '',
                            wfsUrl : wfsUrl
                        });
                    
                        var modalRunWindow = new Ext.Window({
                            width: '30%',
                            height : 'auto',
                            modal : true,
                            items : [ isoFormPanel ]
                        })
                    
                        modalRunWindow.show();
                    
                    },
                    scope : this
                }
            }
            ]
        })
    },
    reloadRuns : function() {
        this.cswStore.reload({
            callback : function(store) {
                this.updateModelStore();
                var combobox = Ext.getCmp('model-combobox')
                combobox.setValue(combobox.getValue());
            },
            scope : this
        });
        
    },
    modelSelected : function(config) {
        LOG.debug('ModelRunSelectionpanel.js::A model has been selected');
        var runPanels = config.runPanels;
        
        this.runPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(true);
        
        LOG.trace('ModelRunSelectionpanel.js::Removing all run panels')
        this.runPanel.removeAll();
        LOG.trace('ModelRunSelectionpanel.js::Adding new run panels to primary run panel ')
        this.runPanel.add(runPanels);
        this.runPanel.setDisabled(false);
        this.runPanel.doLayout();
        
    },
    runSelected : function(panel) {
        LOG.debug('ModelRunSelectionpanel.js:: A run has been selected with the SOS endpoint of: ' + panel.panelInfo.operationURL);
        
        this.runPanel.currentlySelectedRun = panel;
        this.runPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(false);
        this.getTopToolbar().get('wps-process-combo').setDisabled(false)

        // Close any current plotter windows
        if (Ext.getCmp('plotter-window')) Ext.getCmp('plotter-window').hide();

        Ext.each(this.runPanel.items.getRange(), function(runPanel) {
            runPanel.body.removeClass('run-panel-selected');
        })
        this.runPanel.currentlySelectedRun.body.addClass('run-panel-selected');
        
        // TODO- We will need to change this when (if?) we get more than one sites layer on the map at any given time
        if (this.mapPanel.currentMapConfig.layers.layers.length 
            && this.mapPanel.currentMapConfig.layers.layers[0].params.LAYERS === panel.panelInfo.owsResourceName) {
            LOG.debug('ModelRunSelectionpanel.js::New sites layer is the same as the current sites layer. New sites layer will not be created')
            return;
        }
        
        var newSitesLayerArray = [
        new OpenLayers.Layer.WMS(
            panel.panelInfo.fileIdentifier,
            panel.panelInfo.owsEndpoint,
            {
                LAYERS: panel.panelInfo.owsResourceName,
                transparent : true,
                format: 'image/png'
            },
            {
                gutter : 5, // Should always be half the size of the point size
                extractAttributes : true,
                opacity : '0.5',
                displayOutsideMaxExtent: true,
                isBaseLayer: false,
                transitionEffect : 'resize'
            })
        ];
        
        this.mapPanel.currentMapConfig.layers.layers = newSitesLayerArray;
        this.mapPanel.processMapConfigObject(this.mapPanel.currentMapConfig);
        
        this.mapPanel.sosEndpoint = panel.panelInfo.operationURL;
        this.mapPanel.plotterVars = 'Discharge';
        this.mapPanel.addIdentifyToolingToMap();
    },
    updateModelStore : function() {
        // TODO- For quicktips, we should add more fields to this store from the underlying 
        // store like Date, date last revised, language, etc
        var modelArray = [];
        Ext.each(this.cswStore.getRange(), function(storeItem){
            this.push([
                storeItem.get('identificationInfo')[0].citation.title.CharacterString.value,
                storeItem])
        }, modelArray)
        if (!this.modelStore) {
            this.modelStore = new Ext.data.ArrayStore({
                
                fields : ['title', 'rec'],
                idIndex : 0
            })
        }
        this.modelStore.loadData(modelArray);
    }
});
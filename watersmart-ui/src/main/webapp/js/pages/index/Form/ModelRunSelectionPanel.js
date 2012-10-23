Ext.ns("WaterSMART");

WaterSMART.ModelRunSelectionPanel = Ext.extend(Ext.Panel, {
    controller : undefined,
    commonAttr : undefined,
    cswStore : undefined,
    mapPanel : undefined,
    modelStore : undefined,
    processStore : undefined,
    scenarioPanel : undefined,
    constructor : function (config) {
        if (!config) config = {};

        this.controller = config.sosController;
        this.commonAttr = config.commonAttr;
        this.cswStore = config.cswStore;
        this.mapPanel = config.mapPanel;

        this.updateModelStore();

        this.scenarioPanel = this.createScenarioPanel();

        config = Ext.apply({
            id: 'model-run-selection-panel',
            region: 'center',
            layout : 'border',
            buttons : [
                {
                    xtype : 'button',
                    text : 'logout',
                    listeners : {
                        click : function () {
                            window.location.href = "?LOGOUT_HOOK=true";
                        }
                    }
                }
            ],
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
                    mode : 'local',
                    editable : false,
                    emptyText: 'Select A Model',
                    displayField : 'title',
                    listeners : {
                        select : function (combo, record) {
                            LOG.debug('ModelRunSelectionPanel.js::User selected a model');
                            var panelInfo = {};
                            var storeItem = record.get('rec');

                            panelInfo.fileIdentifier = storeItem.get('fileIdentifier');
                            panelInfo.metadataStandardName = storeItem.get('metadataStandardName') || '';
                            panelInfo.metadataStandardVersion = storeItem.get('metadataStandardVersion') || '';
                            panelInfo.dateStamp = storeItem.get('dateStamp') || '';
                            panelInfo.language = storeItem.get('language') || '';
                            panelInfo.scenarioPanels = {};
                            panelInfo.metadataStandardName = storeItem.get('metadataStandardName');
                            panelInfo.metadataStandardVersion = storeItem.get('metadataStandardVersion');
                            panelInfo.isBestScenario = false;

                            Ext.each(storeItem.get('identificationInfo'), function (idItem) {

                                // We have a citation identification block
                                if (idItem.citation !== undefined) {
                                    LOG.trace('ModelPanel.js::Citation Identification block found. Parsing out citation information');
                                    this.title = idItem.citation.title.CharacterString.value;
                                    this['abstract'] = idItem['abstract'].CharacterString.value || '';

                                    if (idItem.citation.date !== undefined && idItem.citation.date.length > 0) {
                                        Ext.each(idItem.citation.date, function(dateItem) {
                                            if (dateItem.dateType.codeListValue.toLowerCase() === 'revision') this.lastRevisedDate = dateItem.date[dateItem.date.length - 1].DateTime.value;
                                        }, this);
                                    }

                                    if (idItem.graphicOverview !== undefined && idItem.graphicOverview.length > 0) {
                                        this.graphicOverview = [];
                                        Ext.each(idItem.graphicOverview, function (goItem) {
                                            this.graphicOverview.push(goItem);
                                        }, this);
                                    }
                                }

                                // We have a service identification block. We create run panels here
                                if (idItem.serviceIdentification !== undefined) {
                                    LOG.trace('ModelPanel.js::Service Identification block found. Parsing out service information');
                                    if (idItem.serviceIdentification.id.toLowerCase() === 'ncsos') {
                                        var scenario = idItem.serviceIdentification.citation.title.CharacterString.value;
                                        var scenarioPanel;
                                        if (this.scenarioPanels[scenario]) {
                                            scenarioPanel = this.scenarioPanels[scenario];
                                        } else {
                                            scenarioPanel = new WaterSMART.ScenarioPanel({
                                                title : scenario
                                            });
                                            this.scenarioPanels[scenario] = scenarioPanel;
                                        }
                                        scenarioPanel.add(new WaterSMART.RunPanel({
                                            serviceIdentification : idItem.serviceIdentification
                                        }));
                                    }
                                }

                                if (idItem.serviceIdentification !== undefined) {
                                    LOG.trace('ModelPanel.js::Service Identification block found. Parsing out service information');
                                    if (idItem.serviceIdentification.id.toLowerCase() === 'ows') {
                                        this.owsEndpoint = idItem.serviceIdentification.operationMetadata.linkage.URL;
                                        this.owsResourceName = idItem.serviceIdentification.operationMetadata.name.CharacterString.value;
                                    }
                                }

                            }, panelInfo);

                            var scenarioPanelsClone = [];
                            Ext.iterate(panelInfo.scenarioPanels, function (key, scenario) {
                                var scenarioPanelClone = scenario.cloneConfig();
                                Ext.each(scenario.items.items, function (panel) {
                                    var clonePanel = panel.cloneConfig();
                                    clonePanel.panelInfo.owsEndpoint = this.panelInfo.owsEndpoint;
                                    clonePanel.panelInfo.owsResourceName = this.panelInfo.owsResourceName;
                                    clonePanel.panelInfo.fileIdentifier = this.panelInfo.fileIdentifier;
                                    clonePanel.panelInfo.metadataStandardName = this.panelInfo.metadataStandardName;
                                    clonePanel.panelInfo.metadataStandardVersion = this.panelInfo.metadataStandardVersion;
                                    this.scenarioPanelClone.add(clonePanel);
                                }, {
                                    panelInfo : panelInfo,
                                    scenarioPanelClone : scenarioPanelClone
                                });

                                this.scenarioPanelsClone.push(scenarioPanelClone);
                            }, {
                                panelInfo : panelInfo,
                                scenarioPanelsClone : scenarioPanelsClone
                            });

                            this.modelSelected({
                                scenarioPanels : scenarioPanelsClone,
                                panelInfo : panelInfo
                            });

                            this.mapPanel.removeLayers(null, false);
                        },
                        scope : this
                    }
                }
            ],
            items : [
                this.scenarioPanel
            ]
        }, config);
        WaterSMART.ModelRunSelectionPanel.superclass.constructor.call(this, config);

    },
    submitButton : {
        text: 'Submit',
        type: 'submit',
        formBind: true,
        handler: function (button) {
            var uploadPanel = Ext.getCmp('uploadPanel');
            var isoFormPanel = Ext.getCmp('metadata-form');
            var metadataForm = isoFormPanel.getForm().getValues();

            LOG.debug('isoFormPanel.js::Preparing to upload file.');

            if (isoFormPanel.create) {
                uploadPanel.getForm().submit({
                    url: uploadPanel.url,
                    scope : this,
                    params: {
                        name : metadataForm.name,
                        modelId : isoFormPanel.modelId,
                        modelVersion : metadataForm.version,
                        runIdent : metadataForm.runIdent,
                        creationDate : metadataForm.creationDate,
                        scenario : metadataForm.scenario,
                        comments : metadataForm.comments,
                        email : WATERSMART.USER_EMAIL,
                        modeltype : isoFormPanel.modelName,
                        wfsUrl : isoFormPanel.wfsUrl,
                        layer : isoFormPanel.layer,
                        commonAttr : isoFormPanel.commonAttr
                    },
                    waitMsg: 'Saving...',
                    success: function () {
                        LOG.info('isoFormPanel.js::User upload succeeded.');

                        Ext.getCmp('model-run-selection-panel').reloadRuns();

                        LOG.info('isoFormPanel.js::Closing modal window');
                        Ext.getCmp('modal-run-window').close();
                        NOTIFY.info({
                            msg : 'Your run is being processed. When completed, you will receive an e-mail at ' + WATERSMART.USER_EMAIL + '. You can continue working or close this application.',
                            hideDelay : 15000
                        });
                    },
                    failure: function (panel, fail) {
                        LOG.info('isoFormPanel.js:: User upload failed.');
                        NOTIFY.error({
                            msg : fail.result.message
                        });
                    }
                });
            } else {
                var form = Ext.getCmp('metadata-form');
                form.getForm().submit({
                    url: form.url,
                    scope : this,
                    params: {
                        modelId : isoFormPanel.modelId,
                        originalName : isoFormPanel.originalModelerName,
                        originalModelVersion : form.originalModelVersion,
                        originalRunIdent : form.originalRunIdentifier,
                        originalCreationDate : form.originalRunDate.format('m/d/Y'),
                        originalScenario : form.originalScenario,
                        originalComments : form.originalAbstract,
                        email : WATERSMART.USER_EMAIL,
                        modeltype : isoFormPanel.modelName,
                        wfsUrl : isoFormPanel.wfsUrl,
                        layer : isoFormPanel.layer,
                        commonAttr : isoFormPanel.commonAttr,
                        transaction: true
                    },
                    waitMsg: 'Saving...',
                    success: function (form, action) {
                        LOG.info('isoFormPanel.js::User update succeeded.');
                        NOTIFY.info({
                            msg : action.result.msg
                        });
                        var task = new Ext.util.DelayedTask(function(){
                            Ext.getCmp('model-run-selection-panel').reloadRuns();

                            LOG.info('isoFormPanel.js::Closing modal window');
                            Ext.getCmp('modal-run-window').close();
                        }, this).delay(500);

                    },
                    failure: function (form, action) {
                        if (action.failureType === 'client') {
                            NOTIFY.warn({
                                msg : 'Please ensure all input data is valid'
                            });
                        } else {
                            NOTIFY.warn({
                                msg : action.result.msg
                            });
                        }

                    }
                });
            }
        }
    },
    createScenarioPanel : function () {
        return new Ext.Panel({
            id : 'scenario-panel',
            title : 'Runs',
            region : 'center',
            layout : 'accordion',
            autoScroll : true,
            disabled : true,
            currentlySelectedRun : undefined,
            tbar : [
            {
                xtype : 'button',
                id : 'edit-selected-run-button',
                text : 'Edit Selected Run',
                disabled : true,
                listeners : {
                    click : function () {
                        LOG.debug('ModelRunSelectionPanel.js::User clicked on "Edit Selected Run" button.');
                        var selectedRun = this.scenarioPanel.currentlySelectedRun;
                        var comboValue = this.getTopToolbar().get('model-combobox').getValue();
                        var modelStore = this.getTopToolbar().get('model-combobox').getStore().getById(comboValue);
                        var modelId = modelStore.data.rec.data.fileIdentifier;
                        var serviceIdentification = selectedRun.serviceIdentification;
                        var modelerName = '';
                        var wfsUrl = '';
                        var layer = '';
                        var commonAttr = this.commonAttr;
                        var modelVersion = 0;
                        var runIdentifier = 0;
                        var abstrakt = '';
                        var runDate;
                        var scenario;
                        var isBestScenario;
                        var scenarioVersions = {};

                        modelerName = serviceIdentification.citation.citedResponsibleParty[0].individualName.CharacterString.value;
                        modelVersion = serviceIdentification.citation.edition.CharacterString.value.split('.')[0];
                        runIdentifier = serviceIdentification.citation.edition.CharacterString.value.split('.')[1];
                        abstrakt = serviceIdentification['abstract'].CharacterString.value;
                        runDate = Date.parseDate(serviceIdentification.citation.date[0].date[0].DateTime.value.split('T')[0], 'Y-m-d');
                        scenario = serviceIdentification.citation.title.CharacterString.value;
                        isBestScenario = (serviceIdentification.citation.otherCitationDetails && serviceIdentification.citation.otherCitationDetails.CharacterString.value.toLowerCase() === 'best') ? true : false;

                        for (var i = 0; i < modelStore.data.rec.data.identificationInfo.length; i++) {
                            var iiItem = modelStore.data.rec.data.identificationInfo[i];
                            if (iiItem.serviceIdentification && iiItem.serviceIdentification.id.toLowerCase() === 'ncsos') {
                                var edition = iiItem.serviceIdentification.citation.edition.CharacterString.value;
                                var iiScenario = iiItem.serviceIdentification.citation.title.CharacterString.value;
                                if (!scenarioVersions[iiScenario]) {
                                    scenarioVersions[iiScenario] = [];
                                }
                                scenarioVersions[iiScenario].push(edition);
                            }
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
                            modelerName : modelerName,
                            modelName : comboValue,
                            modelVersion : modelVersion,
                            runIdentifier : runIdentifier,
                            existingVersions : scenarioVersions,
                            wfsUrl : wfsUrl,
                            runDate : runDate,
                            scenario : scenario,
                            isBestScenario : isBestScenario
                        });

                        var modalRunWindow = new Ext.Window({
                            autoShow : true,
                            width: '30%',
                            id : 'modal-run-window',
                            modal : true,
                            items : isoFormPanel,
                            buttons : [
                                this.submitButton
                            ]
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
                        var scenarioVersions = {};
                        
                        for (var i = 0;i < modelStore.data.rec.data.identificationInfo.length;i++) {
                            var iiItem = modelStore.data.rec.data.identificationInfo[i];
                            
                            
                            if (iiItem.serviceIdentification && iiItem.serviceIdentification.id.toLowerCase() === 'ncsos') {
                                var scenario = iiItem.serviceIdentification.citation.title.CharacterString.value;
                                var edition = iiItem.serviceIdentification.citation.edition.CharacterString.value;
                                if (!scenarioVersions[scenario]) {
                                    scenarioVersions[scenario] = [];
                                }
                                scenarioVersions[scenario].push(edition);
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
                            existingVersions : scenarioVersions,
                            scenario : '',
                            region : 'center',
                            wfsUrl : wfsUrl
                        });
                    
                        var modalRunWindow = new Ext.Window({
                            width: '30%',
                            id: 'modal-run-window',
                            height : 'auto',
                            modal : true,
                            items : [ isoFormPanel, new WaterSMART.FileUploadPanel() ],
                            buttons: [
                                this.submitButton
                            ]
                        })
                    
                        modalRunWindow.show();
                    
                    },
                    scope : this
                }
            }, {
                xtype: 'button',
                id: 'reload-button-id',
                text: 'Reload',
                listeners: {
                    scope: this,
                    click: function() {
                        this.reloadRuns();
                    }
                }
            }
            ]
        })
    },
    reloadRuns : function() {
        this.cswStore.reload({
            callback : function(store) {
                this.updateModelStore();
                var combobox = Ext.getCmp('model-combobox');
                var currentRecord = combobox.findRecord('title', combobox.getRawValue());
                combobox.setRawValue(combobox.getValue());
                combobox.fireEvent('select', combobox, currentRecord);
            },
            scope : this
        });
        
    },
    modelSelected : function(config) {
        LOG.debug('ModelRunSelectionpanel.js::A model has been selected');
        var scenarioPanels = config.scenarioPanels;
        
        this.scenarioPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(true);
        
        LOG.trace('ModelRunSelectionpanel.js::Removing all run panels')
        this.scenarioPanel.removeAll();
        LOG.trace('ModelRunSelectionpanel.js::Adding new run panels to primary run panel ')
        this.scenarioPanel.add(scenarioPanels);
        this.scenarioPanel.setDisabled(false);
        this.scenarioPanel.doLayout();
        
    },
    runSelected : function(panel) {
        LOG.debug('ModelRunSelectionpanel.js:: A run has been selected with the SOS endpoint of: ' + panel.panelInfo.operationURL);
        
        this.controller.getCaps(panel.panelInfo.operationURL);
        
        this.scenarioPanel.currentlySelectedRun = panel;
        this.scenarioPanel.getTopToolbar().get('edit-selected-run-button').setDisabled(false);

        // Close any current plotter windows
        if (Ext.getCmp('plotter-window')) Ext.getCmp('plotter-window').hide();

        Ext.each(this.scenarioPanel.items.getRange(), function(accordPanel) {
            Ext.each(accordPanel.items.getRange(), function (runPanel) {
                if (runPanel.body) {
                    runPanel.body.removeClass('run-panel-selected');
                }
            });
        })
        this.scenarioPanel.currentlySelectedRun.body.addClass('run-panel-selected');
        this.mapPanel.sosEndpoint = panel.panelInfo.operationURL;
        
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

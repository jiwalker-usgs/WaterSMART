Ext.ns("WaterSMART");

WaterSMART.RunPanel = Ext.extend(Ext.Panel, {
    serviceIdentification : undefined,
    panelInfo : undefined,
    constructor : function(config) {
        LOG.trace('RunPanel.js::constructor()');
        if (!config) config = {};
        
        this.serviceIdentification = config.serviceIdentification;
        this.panelInfo = {};
        
        this.panelInfo.title = this.serviceIdentification.citation.title.CharacterString.value;
        this.panelInfo.edition = this.serviceIdentification.citation.edition.CharacterString.value;
        this.panelInfo['abstract'] = this.serviceIdentification['abstract'].CharacterString.value;
        this.panelInfo.serviceType = this.serviceIdentification.serviceType.LocalName.value;
        this.panelInfo.operationURL = this.serviceIdentification.operationMetadata[0].connectPoint[0].ciOnlineResource.linkage.URL;
        this.panelInfo.operationName = this.serviceIdentification.operationMetadata[0].operationName.CharacterString.value;
        this.panelInfo.citedResponsibleParty = this.serviceIdentification.citation.citedResponsibleParty; // Array
        this.panelInfo.date = this.serviceIdentification.citation.date; // Array
        this.panelInfo.presentationForm = this.serviceIdentification.citation.presentationForm; // Array
        this.panelInfo.isBestScenario = false;
        this.panelInfo.coupledResource = this.serviceIdentification.coupledResource;
        this.panelInfo.modelName = config.modelName;
            
        if (this.serviceIdentification.citation.otherCitationDetails && this.serviceIdentification.citation.otherCitationDetails.CharacterString.value.toLowerCase() === 'best') {
            this.panelInfo.isBestScenario = true;
            this.panelInfo.edition += ' -- (Best Available)';
        }

        var revisionDates = [];
        Ext.each(this.panelInfo.date, function (dateItem) {
            if (dateItem.dateType.codeListValue.toLowerCase() === 'revision') {
                Ext.each(dateItem.date, function (rdItem) {
                    this.push(rdItem.DateTime.value);
                }, this.revisionDates);
            }
        }, {
            revisionDates : revisionDates
        });

        var responsibleParties = [];
        Ext.each(this.panelInfo.citedResponsibleParty, function (crpItem) {
            this.push({
                email : crpItem.contactInfo.address.electronicMailAddress[0].CharacterString.value,
                name : crpItem.individualName.CharacterString.value,
                role : crpItem.role.codeListValue
            });
        }, responsibleParties);

        var html = '<div class="run-row"><span class="run-label">Calibration/Validation Scenario:</span> <span class="run-value">' + this.serviceIdentification.citation.title.CharacterString.value + '</span></div>';
        html += '<div class="run-row"><span class="run-label">Model Version and Run:</span> <span class="run-value">' + this.panelInfo.edition + '</span></div>';
        html += '<div class="run-row"><span class="run-label">Modeler Name:</span> <span class="run-value">' + responsibleParties[0].name + '</span></div>';

        for (var i = 0;i < this.panelInfo.date.length;i++) {
            html += '<div class="run-row"><span class="run-label">Run Date:</span> <span class="run-value">' + this.panelInfo.date[i].date[0].DateTime.value + '</span></div>';
        }
        
        html += '<div class="run-row"><span class="run-label">Other Information:</span> <span class="run-value">' + this.panelInfo['abstract'] + '</span></div>';
        
        if (this.panelInfo.coupledResource && this.panelInfo.coupledResource.svCoupledResource && this.panelInfo.coupledResource.svCoupledResource.identifier[0].CharacterString.value) {
            var outputLink = this.panelInfo.coupledResource.svCoupledResource.identifier[0].CharacterString.value;
            html += '<div class="run-row"><span class="run-label">Run Algorithm:</span> <span class="run-algorithm">' + this.panelInfo.coupledResource.svCoupledResource.operationName.CharacterString.value + '</span></div>';
            html += '<div class="run-row"><span class="run-label">Output Link:</span> <span class="run-value">';
            html += outputLink == '' ? '' : '<a href="'+outputLink+'" target="_blank">';
            html += outputLink == '' ? 'Processing Not Yet Completed': outputLink;
            html += outputLink == '' ? '' : '</a></span></div>';
        }
        
        if (this.panelInfo.operationName === 'GetOperation' && this.panelInfo.serviceType === 'OGC:SOS' && this.panelInfo.operationURL) {
            html += '<div class="run-row"><span class="run-label">SOS Endpoint:</span> <span class="run-value"><a href="'+this.panelInfo.operationURL+'" target="_blank">' + this.panelInfo.operationURL + '</a></span></div>';
        }
        
        config = Ext.apply({
            title : this.panelInfo.edition,
            tools : [{
                id: 'refresh',
                handler: function(event, toolEl, panel, tc) {
                    // User wishes to run or re-run WPS R process on this run
                    var panelInfo = panel.panelInfo;
                    var modelType = panelInfo.modelName;
                    var modelerName = panelInfo.citedResponsibleParty[0].individualName.CharacterString.value;
                    var fileIdentifier = panelInfo.fileIdentifier;
                    var originalModelVersion = panelInfo.edition.split('.')[0];
                    var originalRunIdent = panelInfo.edition.split('.')[1];
                    var originalCreationDate = Date.parseDate(panelInfo.date[0].date[0].DateTime.value.split('T')[0], 'Y-m-d').format('m/d/Y');
                    var originalScenario = panelInfo.title;
                    var originalComments = panelInfo['abstract'];
                    var email = panelInfo.citedResponsibleParty[0].contactInfo.address.electronicMailAddress[0].CharacterString.value;
                    var wfsUrl = panelInfo.owsEndpoint;
                    var layer = panelInfo.owsResourceName;
                    var commonAttr = CONFIG.COMMON_ATTR; //TODO - get this from CSW instead
                    var markAsBest = panelInfo.isBestScenario;
                    
                    Ext.Ajax.request({
                        url: 'update',
                        params: {
                            markAsBest : markAsBest,
                            rerun : 'true',
                            modeltype : modelType,
                            originalName : modelerName,
                            modelId : fileIdentifier,
                            originalModelVersion : originalModelVersion,
                            originalRunIdent : originalRunIdent,
                            originalCreationDate : originalCreationDate,
                            originalScenario : originalScenario,
                            originalComments : originalComments,
                            email : email,
                            wfsUrl : wfsUrl,
                            layer : layer,
                            commonAttr : commonAttr
                        },
                        success: function(response){
                            LOG.debug('RunPanel.js:: Rerunning process request has succeeded');
                            if (response.responseText.toLowerCase().contains('success: true')) {
                                NOTIFY.info({
                                    msg : "Your request is being processed. Due to the possibility "
                                    + "that your request may take some time, you will be sent an e-mail "
                                    + "when the process has completed. You may continue to use the application or close it."
                                })
                            } else {
                                NOTIFY.warn({
                                    msg : response.responseText
                                })
                            }
                            
                        },
                        failure: function(response){
                            NOTIFY.warn({
                                msg : response.responseText
                            });
                        }
                    }, this);
                },
                qtip: {
                    text: 'Run Processing',
                    defaultAlign: 'bl'
                }
            }],
            height : 'auto',
            autoScroll : true,
            width: '100%',
            html : html,
            listeners : {
                afterrender : function(me) {
                    me.body.on('mouseover', function(){
                        this.body.addClass('run-panel-mouseover')
                    }, me)
                    
                    me.body.on('mouseout', function() {
                        this.body.removeClass('run-panel-mouseover')
                    }, me)
                    
                    me.body.on('click', function(){
                        me.ownerCt.ownerCt.ownerCt.runSelected(me);
                    }, me)
                },
                scope : this
            }
        }, config);
        WaterSMART.RunPanel.superclass.constructor.call(this, config);
    }
});
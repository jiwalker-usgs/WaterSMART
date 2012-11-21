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
                    
//                         String modelerName = request.getParameter("name");
//                        String originalModelerName = request.getParameter("originalName");
//                        String modelId = request.getParameter("modelId");
//                        String modelType = request.getParameter("modeltype");
//                        String modelVersion = request.getParameter("version");
//                        String originalModelVersion = request.getParameter("originalModelVersion");
//                        String runIdent = request.getParameter("runIdent");
//                        String originalRunIdent = request.getParameter("originalRunIdent");
//                        String runDate = request.getParameter("creationDate");
//                        String originalRunDate = request.getParameter("originalCreationDate");
//                        String scenario = request.getParameter("scenario");
//                        String originalScenario = request.getParameter("originalScenario");
//                        String comments = request.getParameter("comments");
//                        String originalComments = request.getParameter("originalComments");
//                        String email = request.getParameter("email");
//                        String wfsUrl = request.getParameter("wfsUrl");
//                        String layer = request.getParameter("layer");
//                        String commonAttr = request.getParameter("commonAttr");
//                        Boolean updateAsBest = "on".equalsIgnoreCase(request.getParameter("markAsBest")) ? Boolean.TRUE : Boolean.FALSE;
                    var modelerName = panel.panelInfo.citedResponsibleParty;
                    var fileIdentifier = panel.panelInfo.fileIdentifier;
                    var operationURL = panel.panelInfo.operationURL; // NCML location
                    var runVersion = panel.panelInfo.edition;
                    var title = panel.panelInfo.title;
                    
                    Ext.Ajax.request({
                        url: 'update',
                        params: {
                            rerun : 'true',
                            name : modelerName,
                            originalName : modelerName,
                            modelId : fileIdentifier,
                            modeltype : title,
                            markAsBest : 'false'
                        },
                        success: function(response){
                            LOG.debug('RunPanel.js:: Rerunning process request has succeeded');
                            NOTIFY.info({
                                msg : response.responseText
                            });
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
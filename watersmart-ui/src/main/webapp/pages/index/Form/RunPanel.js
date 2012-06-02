Ext.ns("WaterSMART");

WaterSMART.RunPanel = Ext.extend(Ext.Panel, {
    serviceIdentification : undefined,
    panelInfo : {},
    constructor : function(config) {
        LOG.trace('RunPanel.js::constructor()');
        if (!config) config = {};
        
        this.serviceIdentification = config.serviceIdentification;
        
        this.panelInfo.title = this.serviceIdentification.citation.title.CharacterString.value;
        this.panelInfo.edition = this.serviceIdentification.citation.edition.CharacterString.value;
        this.panelInfo['abstract'] = this.serviceIdentification['abstract'].CharacterString.value;
        this.panelInfo.serviceType = this.serviceIdentification.serviceType.LocalName.value;
        this.panelInfo.operationURL = this.serviceIdentification.operationMetadata.linkage.URL;
        this.panelInfo.operationName = this.serviceIdentification.operationMetadata.operationName.CharacterString.value;
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
            html += '<div class="run-row"><span class="run-label">Run Algorithm:</span> <span class="run-algorithm">' + this.panelInfo.coupledResource.svCoupledResource.operationName.CharacterString.value + '</span></div>';
            html += '<div class="run-row"><span class="run-label">Output Link:</span> <span class="run-value"><a href="'+this.panelInfo.coupledResource.svCoupledResource.identifier[0].CharacterString.value+'" target="_blank">' + this.panelInfo.coupledResource.svCoupledResource.identifier[0].CharacterString.value + '</a></span></div>';
        }
        
        config = Ext.apply({
            title : this.panelInfo.edition,
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
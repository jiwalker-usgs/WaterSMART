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

        var revisionDates = [];
        Ext.each(this.panelInfo.date, function(dateItem){
            if (dateItem.dateType.codeListValue.toLowerCase() === 'revision') {
                Ext.each(dateItem.date, function(rdItem){
                    this.push(rdItem.DateTime.value)
                }, this.revisionDates)
            }
        }, {
            revisionDates : revisionDates
        })

        var responsibleParties = [];
        Ext.each(this.panelInfo.citedResponsibleParty, function(crpItem) {
            this.push({
                email : crpItem.contactInfo.address.electronicMailAddress[0].CharacterString.value,
                name : crpItem.individualName.CharacterString.value,
                role : crpItem.role.codeListValue
            })
        }, responsibleParties)

        var html = '<div class="run-row"><span class="run-label">Abstract:</span> <span class="run-value">' + this.panelInfo['abstract'] + '</span></div>';
        html += '<div class="run-row"><span class="run-label">Edition:</span> <span class="run-value">' + this.panelInfo.edition + '</span></div>';
        
        if (revisionDates.length) {
            html += '<div class="run-row"><span class="run-label">Revision Dates:</span> <span class="run-value-list"><ul>'
            for (var i = 0;i < revisionDates.length;i++) {
                html +='<li><span class="run-value-list-item">'+revisionDates[i]+'</span></li>'
            }
            html += '</ul></span></div>'
        }
        
        config = Ext.apply({
            title : this.panelInfo.title,
            height : 'auto',
            width: '100%',
            html : html
        }, config);
        WaterSMART.RunPanel.superclass.constructor.call(this, config);
    }
});
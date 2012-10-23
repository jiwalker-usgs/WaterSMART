Ext.ns("WaterSMART");

WaterSMART.FileUploadPanel = Ext.extend(Ext.form.FormPanel, {
    constructor : function (config) {
        if (!config) config = {};

        config = Ext.apply({
            title: 'Upload',
            id: 'uploadPanel',
            url: 'service/upload',
            fileUpload: true,
            items: [
                {
                    xtype: 'fileuploadfield',
                    id: 'form-file',
                    name: 'file-path',
                    emptyText: 'Select a file',
                    fieldLabel: 'Upload',
                    buttonText: 'Choose file'
                }
            ]
        }, config);
        WaterSMART.FileUploadPanel.superclass.constructor.call(this, config);
    }
});
Ext.ns('WaterSMART');

WaterSMART.ExampleEmailWPSWrapperProcess  = function(args) {
    if (!args) args = {};
    var _identifier = 'gov.usgs.cida.gdp.wps.algorithm.FeatureCoverageIntersectionAlgorithm';
    var _outId = args.outId || 'output';
    var that = {
        init : function(args) {
            that.valueName = args.identifier || '';
            that.outId = args.outId || that.outId;
        },
        // This should point at the email-when-finished algorithm we set up 
        wpsEndpoint : "/WebProcessingService?Service=WPS&Request=DescribeProcess&Identifier=gov.usgs.cida.gdp.wps.algorithm.FeatureCoverageIntersectionAlgorithm", 
        identifier : _identifier,
        email : args.email,
        subProcess : args.subProcess,
        outId : _outId,
        createWpsExecuteReference : function() {
                    
            var dataInputs = [];
            
            dataInputs.push({
                title : 'email',
                identifier : 'email',
                data : {
                    literalData : {
                        value : that.email
                    }
                }
            })
            
            dataInputs.push({
                title : 'sub-process',
                identifier : 'sub-process',
                data : {
                    literalData : {
                        value : that.subProcess
                    }
                }
            })
            
            return {
                mimeType : "text/xml; subtype=wfs-collection/1.0",
                href : "http://geoserver/wps",
                method : "POST",
                body : {
                    identifier : that.identifier,
                    dataInputs : dataInputs,
                    responseForm : {
                        rawDataOutput : {
                            mimeType :"application/json",
                            identifier : that.outId
                        }
                    }
                }
            };
        },
        createWpsExecuteRequest : function() {
            // To easier see what's happening here, take a look at:
            // js/openlayers/lib/OpenLayers/Format/WPSExecute.js 
            // at the writers object.
            var writer = new OpenLayers.Format.WPSExecute();
            var executeXml = writer.writeNode('wps:Execute', that.createWpsExecuteReference().body);
			
            return new OpenLayers.Format.XML().write(executeXml);
        }
    };
	
    return that;
}

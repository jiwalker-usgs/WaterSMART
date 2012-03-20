Ext.ns('WaterSMART');

WaterSMART.ExampleProcess  = function(args) {
    if (!args) args = {};
    var _identifier = 'gov.usgs.cida.gdp.wps.algorithm.FeatureCoverageIntersectionAlgorithm';
    var _outId = args.outId || 'output';
    var that = {
        init : function(args) {
            that.valueName = args.identifier || '';
            that.outId = args.outId || that.outId;
        },
        wpsEndpoint : "/WebProcessingService?Service=WPS&Request=DescribeProcess&Identifier=gov.usgs.cida.gdp.wps.algorithm.FeatureCoverageIntersectionAlgorithm",
        identifier : _identifier,
        email : args.email,
        sendEmail : args.sendEmail,
        wfsUrl : args.wfsUrl,
        layerName : args.layerName,
        commonAttribute : args.commonAttribute,
        sosEndpoint : args.sosEndpoint,
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
                title : 'send-email',
                identifier : 'send-email',
                data : {
                    literalData : {
                        value : that.sendEmail
                    }
                }
            })
            
            dataInputs.push({
                title : 'wfs-url',
                identifier : 'wfs-url',
                data : {
                    literalData : {
                        value : that.wfsUrl
                    }
                }
            })
            
            dataInputs.push({
                title : 'layer-name',
                identifier : 'layer-name',
                data : {
                    literalData : {
                        value : that.layerName
                    }
                }
            })
            
            dataInputs.push({
                title : 'common-attribute',
                identifier : 'common-attribute',
                data : {
                    literalData : {
                        value : that.commonAttribute
                    }
                }
            })
               
            dataInputs.push({
                title : 'sos-endpoint',
                identifier : 'sos-endpoint',
                data : {
                    literalData : {
                        value : that.sosEndpoint
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

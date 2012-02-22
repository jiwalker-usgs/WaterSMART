Ext.ns("WaterSMART");


WaterSMART.Map = Ext.extend(GeoExt.MapPanel, {
    layersLoading : 0,
    controller : undefined,
    WGS84 : new OpenLayers.Projection("EPSG:4326"),
    WGS84_GOOGLE_MERCATOR : new OpenLayers.Projection("EPSG:900913"),
    INITIAL_CENTER_US : new OpenLayers.LonLat(-11000000, 4671831),
    // This is reprojected from -124.756, 24.518, -66.954, 49.386, the CONUS States layer's bounds
    COUNTRY_BBOX : new OpenLayers.Bounds(-13887774.391472, 2816656.9073115, -7453285.1855353, 6340613.1336976),
    defaultMapConfig : {
        layers : {
            baseLayers : [],
            layers : []
        },
        initialZoom : undefined,
        initialExtent : new OpenLayers.Bounds(-13887774.391472, 2816656.9073115, -7453285.1855353, 6340613.1336976),
        center : new OpenLayers.LonLat(-8750000, 4671831)
    },
    popup : undefined,
   
    constructor : function(config) {
        LOG.debug('map.js::constructor()');
        
        var EPSG900913Options = {
            sphericalMercator : true,
            layers : "0",
            isBaseLayer : true,
            projection: this.WGS84_GOOGLE_MERCATOR,
            units: "m",
            maxResolution: 156543.0339,
            buffer : 3,
            transitionEffect : 'resize'
        };
        
        var sitesLayerName = CONFIG.SITES_LAYER;
					
        var sitesLayer = new OpenLayers.Layer.WMS(
//            CONFIG.MAP_QUERIED_LAYER_NAME,
            'WaterSMART: Stations',
            CONFIG.GEOSERVER_URL,
            {
                LAYERS: sitesLayerName,
                transparent : true,
                // TODO: This needs to be moved into GeoServer
                //SLD : window.location + "custom-sld.xml?layer=" + sitesLayerName + "&opacity=0.7&hexColor=FF0000&size=7",
                format: 'image/png'
            },
            {
                metadata : {
                    identifiable : true,
                    bin : {
                        low : '-inf',
                        hi : 'inf',
                        hexColor : 'FF0000'
                    }
                },
                extractAttributes : true,
                opacity : '0.5',
                displayOutsideMaxExtent: true,
                isBaseLayer: false,
                transitionEffect : 'resize'
            });
        this.defaultMapConfig.layers.layers =  [sitesLayer];
      
        this.defaultMapConfig.layers.baseLayers = [
            new OpenLayers.Layer.XYZ(
                "USA Topo Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/${z}/${y}/${x}",
                Ext.apply(EPSG900913Options, {
                    numZoomLevels : 18
                })
            ),
            new OpenLayers.Layer.WMS( // TODO: Currently not working -- see http://internal.cida.usgs.gov/jira/browse/NQMAP-90
                "NHD (National Map, Not Working)",
                "http://services.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer",
                Ext.apply(EPSG900913Options, { })
            ),
            new OpenLayers.Layer.ArcGIS93Rest( // TODO: Currently not working -- see http://internal.cida.usgs.gov/jira/browse/NQMAP-90
                "TNM Contours - Large (National Map, Not Working)",
                "http://services.nationalmap.gov/ArcGIS/rest/services/Tasks/TNM_Contours_Large/MapServer/export",
                Ext.apply(EPSG900913Options, {
                    layers : '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30'
                })
            ),
            new OpenLayers.Layer.ArcGIS93Rest( // TODO: Currently not working -- see http://internal.cida.usgs.gov/jira/browse/NQMAP-90
                "USA Topo Map (National Map, Not Working)",
                "http://services.nationalmap.gov/ArcGIS/rest/services/US_Topo/MapServer/export",
                Ext.apply(EPSG900913Options, {
                    layers : '0,1,2'
                })
            ),
            new OpenLayers.Layer.XYZ(
                "World Imagery",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}",
                Ext.apply(EPSG900913Options, {
                    numZoomLevels : 14
                })
            ),
            new OpenLayers.Layer.XYZ(
                "World Street Map",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}",
                Ext.apply(EPSG900913Options, {
                    numZoomLevels : 16
                })
            ),
            new OpenLayers.Layer.XYZ(
                "World Physical Map",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/${z}/${y}/${x}",
                Ext.apply(EPSG900913Options, {
                    numZoomLevels : 7
                })
            ),
            new OpenLayers.Layer.XYZ(
                "World Topo Map",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${z}/${y}/${x}",
                Ext.apply(EPSG900913Options, {
                    numZoomLevels : 17
                })
            )
        ];
       
        // Set up the map 
        this.map = new OpenLayers.Map({
            maxExtent: this.COUNTRY_BBOX,
            controls: [
                new OpenLayers.Control.OverviewMap(),
                new OpenLayers.Control.MousePosition({
                    prefix : 'POS: '
                // http://internal.cida.usgs.gov/jira/browse/NQMAP-124
                //                displayProjection : this.WGS84
                }),
                new OpenLayers.Control.ScaleLine({
                    //{Boolean} Use geodesic measurement.  Default is false.  
                    //The recommended setting for maps in EPSG:4326 is false, 
                    //and true EPSG:900913.  If set to true, the scale will be 
                    //calculated based on the horizontal size of the pixel in the 
                    //center of the map viewport.
                    geodesic : true
                }),
                new OpenLayers.Control.PanZoomBar({
                    zoomWorldIcon: true
                }),
                new OpenLayers.Control.LayerSwitcher()
            ]
        });
       
        config = Ext.apply({
            id : 'map-panel',
            region: 'center',
            map : this.map,
            extent : this.COUNTRY_BBOX,
            layers : new GeoExt.data.LayerStore({
                initDir : GeoExt.data.LayerStore.STORE_TO_MAP,
                map : this.map,
                layers : this.defaultMapConfig.layers.baseLayers,
                listeners : {
                    load : function (store) {
                        LOG.debug('map.js::constructor(): Base layer store loaded ' + store.getCount() + ' base layers.');
                    }
                }
            }),
            border: false
        }, config);
      
        WaterSMART.Map.superclass.constructor.call(this, config);
        LOG.info('map.js::constructor(): Construction complete.');
       
        this.addEvents(
            "layer-load-start",
            "layer-load-end"
        );
       
        this.processMapConfigObject(this.defaultMapConfig);
       
        this.addEditingToolbarToMap();
        this.addIdentifyToolingToMap();
        this.map.events.on({
            /**
             * Triggered before a layer has been removed. The event
             * object will include a *layer* property that references the layer  
             * to be removed. When a listener returns "false" the removal will be 
             * aborted.
             */
            'preremovelayer' :  function (event) {
            //                try {
            //                    var map = event.object;
            //                    var layer = event.layer;
            //                    var wmsGetFeatureInfoControl = map.getControlsBy('displayClass', 'olControlWMSGetFeatureInfo')[0];
            //                    var layerIndex = -1;
            //                    if (wmsGetFeatureInfoControl) {
            //                        layerIndex = wmsGetFeatureInfoControl.layers.contains(layer);
            //                    }
            //                
            //                    // While removing identifiable layers from our map, 
            //                    // we also want to remove these layers from our identifier control
            //                    if (layerIndex > -1) {
            //                //                    wmsGetFeatureInfoControl.layers.splice(layerIndex, 1);
            //                    }
            //                } catch (e) {
            //                    // This is an issue with IE. We may have ended up here because 
            //                    // of an exception thrown in the command chain in line 207.
            //                    // This occurs when we are trying to reload the application.
            //                    // I don't know yet whether or not to handle this
            //                    LOG.warn(e)
            //                }
            },
            /**
             * Triggered before a layer has been added.  The event
             * object will include a *layer* property that references the layer  
             * to be added. When a listener returns "false" the adding will be 
             * aborted.
             */     
            'preaddlayer' : function (event) {
                var map = event.object;
                var layer = event.layer;
                var wmsGetFeatureInfoControl = map.getControlsBy('displayClass', 'olControlWMSGetFeatureInfo')[0];
               
                // We want to let our application know that this layer is loading and 
                // also when it has finished loading
                // "loadstart", "loadend", "loadcancel"
                layer.events.on({
                    'loadstart' : function (args) {
                        var element = args.element;
                        var layer = args.object;
                        this.layersLoading++;
                        LOG.debug('map.js::Layer loading started. Layers loading: ' + this.layersLoading);
                        if (this.layersLoading == 1) {
                            this.fireEvent("layer-load-start");
                        }
                    },
                    'loadend' : function(args) {
                        var element = args.element;
                        var layer = args.object;
                        this.layersLoading--;
                        LOG.debug('map.js::Layer loading ended. Layers loading: ' + this.layersLoading);
                        if (this.layersLoading === 0) {
                            this.fireEvent("layer-load-end");
                        }
                    },
                    'loadcancel' : function (args) {
                        this.layersLoading = 0;
                        LOG.debug('map.js::Layer loading cancelled. Layers loading: ' + this.layersLoading);
                    },
                    scope : this
                })              
                // If the layer we have is identifiable, 
                // add that layer to our identifier control
                if (layer.metadata.identifiable) {
                //                    wmsGetFeatureInfoControl.layers.push(layer);
                }
            },
            scope : this
        })
    },
    /**
     * Adds an OpenLayers.Control.EditingToolbar to the map
     */
    addEditingToolbarToMap : function() {
        LOG.trace('map.js::constructor(): Creating editing toolbar control, adding it to the map.');
        var editingVectorLayer = new OpenLayers.Layer.Vector(
            "selection-vector-layer",{
                'renderers' : ["SVG", "VML", "Canvas"]
            }
        );
        var editingToolbarControl = new OpenLayers.Control.EditingToolbar(editingVectorLayer);
        LOG.trace('map.js::constructor(): Removing path control from editing toolbar control.');
        
        // Remove line and point controls. We only need polygon currently
        editingToolbarControl.controls.remove(editingToolbarControl.getControlsBy('displayClass', 'olControlDrawFeaturePath')[0])
        editingToolbarControl.controls.remove(editingToolbarControl.getControlsBy('displayClass', 'olControlDrawFeaturePoint')[0])
      
        // Instead of adding a navigation control to the map, we will use the editingToolbarControl's navigation control
        var navigationControl = editingToolbarControl.getControlsBy('displayClass', 'olControlNavigation')[0];
        navigationControl.dragPanOptions = {
            enableKinetic : true
        };
        navigationControl.pinchZoomOptions = {
            autoActivate : true
        };
        navigationControl.documentDrag = true;
        navigationControl.handleRightClicks = true;
        navigationControl.zoomBoxEnabled = true;
        navigationControl.zoomWheelEnabled = true
       
        var polyFeatureControl = editingToolbarControl.getControlsBy('displayClass', 'olControlDrawFeaturePolygon')[0];
        polyFeatureControl.handler.persist = true;
        polyFeatureControl.events.on({
            'featureadded' : function(a) {
                var polygonBounds = a.feature.geometry.components[0].getBounds();
                LOG.debug('map.js:: User drew a polygon on the map -> ' + polygonBounds)
                LOG.debug('map.js:: Zooming map to ' + polygonBounds);
                this.map.zoomToExtent(polygonBounds);
                this.controller.polygonCreated(a.feature);
            },
            scope: this
        })
        LOG.info('map.js::constructor(): Adding new control to map.');
        this.map.addControls([editingToolbarControl]);
    },
    addIdentifyToolingToMap: function() {
        var getFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
            infoFormat : 'application/vnd.ogc.gml',
            maxFeatures : 1,
            layers : this.defaultMapConfig.layers.layers,
            eventListeners : {
                getfeatureinfo : function(event) {
                    if (event.features && event.features[0]){
                        var panel = new WaterSMART.Plotter();
                        panel.loadSOSStore({
                            url : "http://cida-wiwsc-gdp1qa.er.usgs.gov:8080/thredds/sos/watersmart/SYE.nc",
                            vars : 'estq,obsq'
                        }, event.features[0].attributes.site_no);

                        if(!this.popup) {
                            this.popup = new GeoExt.Popup({
                                title: event.features[0].attributes.station_nm,
                                anchored: false,
//                                location: OpenLayers.Projection.transform(
//                                    event.features[0].geometry,
//                                    "EPSG:4269",
//                                    "EPSG:900913"
//                                ),
                                width: 600,
                                height: 300,
                                map: this.map,
                                items : [
                                    panel
                                ],
                                collapsible: true,
                                closeAction: 'hide'
                            });
                            this.popup.on('resize', function() {
                                panel.resizePlotter();
                            });
                        } else {
//                            this.popup.location = OpenLayers.Projection.transform(
//                                    event.features[0].geometry,
//                                    new OpenLayers.Projection("EPSG:4269"),
//                                    new OpenLayers.Projection("EPSG:900913")
//                                );
                            this.popup.setTitle(event.features[0].attributes.station_nm);
                        }
                        this.popup.show();
                        
                    }
                },
                scope: this
            }
            
        });
        this.map.addControl(getFeatureInfoControl);
        getFeatureInfoControl.activate();
    },
//    addIdentifyToolingToMap : function() {
//        var getFeatureInfoControl = new OpenLayers.Control.ExtendedWMSGetFeatureInfo({
//            AVAILABLE_EXPORT_TYPES : ['CSV','GML2','GML3','GML3.2','JSON','SHAPEFILE'],
//            drillDown : true,
//            queryVisible: true, // If true, filter out hidden layers when searching the map for layers to query
//            maxFeatures: 100,
//            // infoFormat: 'application/vnd.ogc.gml', // This works if we want the GML back
//            // If the filter count matches the layer count, each order of filters will be used for each 
//            // order of layers. Otherwise, the first filter will be used for each layer
//            cql_filter: [
//            //                new OpenLayers.Filter.Logical({
//            //                    type : OpenLayers.Filter.Logical.OR,
//            //                    filters : [
//            //                        new OpenLayers.Filter.Comparison({
//            //                            type : OpenLayers.Filter.Comparison.EQUAL_TO,
//            //                            property : 'SPECIFIC_LAND_USE',
//            //                            value : 'Cropland'
//            //                        }),
//            //                        new OpenLayers.Filter.Comparison({
//            //                            type : OpenLayers.Filter.Comparison.EQUAL_TO,
//            //                            property : 'SPECIFIC_LAND_USE',
//            //                            value : 'Not Applicable'
//            //                        }) 
//            //                    ]
//            //                })                
//            ],
//            filter : [
//            //                new OpenLayers.Filter.Logical({
//            //                    type : OpenLayers.Filter.Logical.OR,
//            //                    filters : [
//            //                        new OpenLayers.Filter.Comparison({
//            //                            type : OpenLayers.Filter.Comparison.EQUAL_TO,
//            //                            property : 'SPECIFIC_LAND_USE',
//            //                            value : 'Cropland'
//            //                        }),
//            //                        new OpenLayers.Filter.Comparison({
//            //                            type : OpenLayers.Filter.Comparison.EQUAL_TO,
//            //                            property : 'SPECIFIC_LAND_USE',
//            //                            value : 'Not Applicable'
//            //                        }) 
//            //                    ]
//            //                })                
//            ],
//            layers: [
//            new OpenLayers.Layer.WMS("SITES", CONFIG.CIDA_GEOSERVER_ENDPOINT + "nawqa_map/wms",
//            {
//                LAYERS: 'nawqa_map:NAWQA_MAP_SITES'
//            }),
//            new OpenLayers.Layer.WMS("MAP", CONFIG.CIDA_GEOSERVER_ENDPOINT + "nawqa_map/wms",
//            {
//                LAYERS: 'nawqa_map:NAWQA_MAP'
//            })
//            ], // This is done automatically but cannot be null to start
//            eventListeners: {
//                /**
//                 * No queryable layers were found
//                 */
//                nogetfeatureinfo : function(event) {
//                    LOG.debug('map.js:: User attempted to identify a feature but no feature was found for identification');
//                },
//                /**
//                 * Triggered before the request is sent. 
//                 * The event object has an *xy* property with the position of the 
//                 * mouse click or hover event that triggers the request
//                 */
//                beforegetfeatureinfo : function(event) {
//                    LOG.debug('map.js:: About to send a WMSGetFeatureInfo on XY point: ' + event.xy.x + ', ' + event.xy.y);
//                },
//                /**
//                 * Triggered when a GetFeatureInfo response is received.
//                 * The event object has a *text* property with the body of the
//                 * response (String), a *features* property with an array of the
//                 * parsed features, an *xy* property with the position of the mouse
//                 * click or hover event that triggered the request, and a *request*
//                 * property with the request itself. If drillDown is set to true and
//                 * multiple requests were issued to collect feature info from all
//                 * layers, *text* and *request* will only contain the response body
//                 * and request object of the last request.
//                 */
//                getfeatureinfo: function(event) {
//                    LOG.debug('map.js:: Received feature info');
//                    
//                    // Here we check if any text came back, and if it did, does it have anything in the body node?
//                    if (!event.text || !event.text.contains('table>')){
//                        LOG.info('map.js:: Feature info response did not contain any information');
//                        return;
//                    }
//                    
//                    // We did get something back. Create the popup
//                    this.map.addPopup(new OpenLayers.Popup.FramedCloud(
//                        "framedcloud", 
//                        this.map.getLonLatFromPixel(event.xy),
//                        null,
//                        function(text) {
//                            // TODO: Possibly, instead of using the direct HTML returned by GeoServer, 
//                            // get the XML returned by GeoServer and create an ExtJS grid from it.
//                            
//                            // Close any other popups and remove them from the dom
//                            var popups = Ext.DomQuery.jsSelect("[id=framedcloud]");// olPopupCloseBox
//                            Ext.iterate(popups, function(popup){
//                                var closeButton = Ext.DomQuery.selectNode("[class=olPopupCloseBox]", popup);
//                                closeButton.click();
//                                (new Ext.Element(popup)).remove();
//                            })
//                            
//                            return text;
//                        }(event.text),
//                        null,
//                        true
//                        ));
//                    
//                    // Decorate the popup with a set of export controls
//                    var popup = Ext.DomQuery.selectNode("[id=framedcloud]");
//                    var tables = Ext.DomQuery.jsSelect("table", popup)
//                    Ext.iterate(tables, function(table, index){
//                        // Append a control set after each table
//                        var controlDiv = Ext.DomHelper.insertHtml('afterEnd', table, '<div class="framedcloud-table-controlset" id="framedcloud-table-controlset-'+index+'"></div>');
//                        var selectControl = Ext.DomHelper.insertHtml('beforeEnd', controlDiv, 'Export to: <select class="framedcloud-table-controlset-select" id="framedcloud-table-controlset-select-'+index+'"><option></option></select>');
//
//                        Ext.each(this.AVAILABLE_EXPORT_TYPES, function(type){
//                            Ext.DomHelper.insertHtml('beforeEnd', selectControl, '<option value='+type+'>'+type+'</option>');
//                        }, this)
//                    }, this)
//                    
//                    var getLonLatRadiusFromXY = function(pixel, radius) {
//                        var result = 100000;
//						
//                        var upperLeftPx = new OpenLayers.Pixel(pixel.x - radius, pixel.y - radius);
//                        var lowerRightPx = new OpenLayers.Pixel(pixel.x + radius, pixel.y + radius);
//						
//                        var upperLeftLL = CONTROLLER.mapPanel.map.getLonLatFromPixel(upperLeftPx);
//                        var lowerRightLL = CONTROLLER.mapPanel.map.getLonLatFromPixel(lowerRightPx);
//						
//                        result = Math.sqrt(Math.pow((lowerRightLL.lon - upperLeftLL.lon), 2) + Math.pow((upperLeftLL.lat - lowerRightLL.lat), 2));
//						
//                        result = result / 2.0;
//						
//                        return result;
//                    }
//                    var lonlat = CONTROLLER.mapPanel.map.getLonLatFromPixel(event.xy);
//                    
//                    var radiusPxSize = 3;
//                    var radius = getLonLatRadiusFromXY(event.xy, radiusPxSize);
//                    
//                    // Add functionality to the dropdown list we created
//                    $('.framedcloud-table-controlset-select').each(function(csi, cse){
//                        $(cse).change(function(eventObject){
//                            if (eventObject.currentTarget.value) {
//                                var exportTableNumber = eventObject.currentTarget.parentElement.id.charAt(eventObject.currentTarget.parentElement.id.length - 1);
//                                var exportTableName = exportTableNumber == 0 ? 'NAWQA_MAP_SITES' : 'NAWQA_MAP';
//                                LOG.debug('map.js:: User wishes to export ' + eventObject.currentTarget.value + ' from table ' + exportTableName);
//								
//                                var bboxFilter = new OpenLayers.Filter.Spatial({
//                                    type: OpenLayers.Filter.Spatial.DWITHIN,
//                                    value: new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat),
//                                    property: 'GEOM',
//                                    distance: radius,
//                                    distanceUnits: 'm',
//                                    projection: "EPSG:900913"
//                                })
//                                                    
//                                var filter_1_1_0 = new OpenLayers.Format.Filter({
//                                    version: "1.1.0"
//                                });
//                                
//                                var filterOutput = filter_1_1_0.write(
//                                    new OpenLayers.Filter.Logical({
//                                        type : OpenLayers.Filter.Logical.AND,
//                                        filters : event.object.filter.concat([bboxFilter])
//                                    })
//                                    )
//                                
//                                // Do the actual export
//                                var postData = {
//                                    'geoserver-endpoint' : CONFIG.CIDA_GEOSERVER_ENDPOINT + 'wfs',
//                                    'layer-name' : 'nawqa_map:' + exportTableName,
//                                    'output-type' : eventObject.currentTarget.value.toLowerCase(),
//                                    'filter' : XMLtoString(filterOutput),
//                                    'output-filename' : 'export'
//                                }
//                                $.download('export', postData);
//                            }
//                        })
//                    })
//                }
//            }
//        });
//        
//        this.map.addControl(getFeatureInfoControl);
//        getFeatureInfoControl.activate();
//         
//    },
    addLayers : function(layers) {
        if (Ext.isArray(layers)) {
            this.map.addLayers(layers);
        } else {
            this.map.addLayers([layers]);
        }
    },
    processMapConfigObject : function(mco) {
        LOG.debug('map.js::processMapConfigObject()');
        var layers = mco.layers.baseLayers.concat(mco.layers.layers);
        
        LOG.debug('map.js::processMapConfigObject(): Replacing map\'s layer store');
        this.layers.destroy();
        this.layers = new GeoExt.data.LayerStore({
            initDir : GeoExt.data.LayerStore.STORE_TO_MAP,
            map : this.map,
            layers : layers
        })
        
        // This hook can be used for a loading bar
        this.layers.each(function(record) {
            var layer = record.getLayer();
            if (layer.CLASS_NAME == "OpenLayers.Layer.XYZ" || layer.CLASS_NAME == "OpenLayers.Layer.WMS") {
                layer.events.on({
                    tileloaded : function(a) {
                        LOG.trace('map.js::' + a.object.name + ' tiles left to load ' + a.object.numLoadingTiles);
                        if (a.object.numLoadingTiles == 0) {
                            
                        }
                    }
                })
            }
        }, this)
        
        if (mco.initialZoom && typeof mco.initialZoom == 'number' && isFinite(mco.initialZoom)) {
            LOG.debug('map.js::processMapConfigObject(): Zooming To '+mco.initialZoom);
            this.map.zoomTo(mco.initialZoom);
        } else if (mco.initialExtent && mco.initialExtent.CLASS_NAME && mco.initialExtent.CLASS_NAME == "OpenLayers.Bounds") {
            LOG.debug('map.js::processMapConfigObject(): Zooming To '+mco.initialExtent);
            this.map.zoomToExtent(mco.initialExtent);
        }
        
        if (mco.center && mco.center.CLASS_NAME && mco.center.CLASS_NAME == "OpenLayers.LonLat") {
            LOG.debug('map.js::processMapConfigObject(): Centering map to  '+mco.center.toShortString());
            this.map.setCenter(mco.center)
        }
    },
    /**
     * A hook to add additional functionality before calling 
     * the map's removeLayer function (which also has a hook)
     */
    removeLayers : function(layers) {
        if (Ext.isArray(layers)) {
            Ext.each(layers, function(layer) {
                layer.map.removeLayer(layer);
            });
        } else {
            layers.map.removeLayer(layers);
        }
    }
});

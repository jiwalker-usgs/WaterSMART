Ext.ns("WaterSMART");


WaterSMART.Map = Ext.extend(GeoExt.MapPanel, {
    layersLoading : 0,
    controller : undefined,
    WGS84 : new OpenLayers.Projection("EPSG:4326"),
    WGS84_GOOGLE_MERCATOR : new OpenLayers.Projection("EPSG:900913"),
    defaultMapConfig : {
        layers : {
            baseLayers : [],
            layers : []
        },
        initialZoom : undefined,
        // This is reprojected from -88.459,30.039,-81.347,37.086, the watersmart:se_sites bounds
        initialExtent : new OpenLayers.Bounds(-9847210.8347114,3508563.9150696,-9055506.6162999,4451100.8664317),
        center : new OpenLayers.LonLat(-9506240,395340)
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
            'WaterSMART: Stations',
            CONFIG.GEOSERVER_URL,
            {
                LAYERS: sitesLayerName,
                transparent : true,
                format: 'image/png'
            },
            {
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
            )
        ];
       
        // Set up the map 
        this.map = new OpenLayers.Map({
            maxExtent: this.COUNTRY_BBOX,
            controls: [
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.MousePosition({
                prefix : 'POS: '
            }),
            new OpenLayers.Control.ScaleLine({
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
            extent : this.defaultMapConfig.initialExtent,
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
       
//        this.addEditingToolbarToMap();
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
//      
//        // Instead of adding a navigation control to the map, we will use the editingToolbarControl's navigation control
//        var navigationControl = editingToolbarControl.getControlsBy('displayClass', 'olControlNavigation')[0];
//        navigationControl.dragPanOptions = {
//            enableKinetic : true
//        };
//        navigationControl.pinchZoomOptions = {
//            autoActivate : true
//        };
//        navigationControl.documentDrag = true;
//        navigationControl.handleRightClicks = true;
//        navigationControl.zoomBoxEnabled = true;
//        navigationControl.zoomWheelEnabled = true
//       
//        var polyFeatureControl = editingToolbarControl.getControlsBy('displayClass', 'olControlDrawFeaturePolygon')[0];
//        polyFeatureControl.handler.persist = true;
//        polyFeatureControl.events.on({
//            'featureadded' : function(a) {
//                var polygonBounds = a.feature.geometry.components[0].getBounds();
//                LOG.debug('map.js:: User drew a polygon on the map -> ' + polygonBounds)
//                LOG.debug('map.js:: Zooming map to ' + polygonBounds);
//                this.map.zoomToExtent(polygonBounds);
//                this.controller.polygonCreated(a.feature);
//            },
//            scope: this
//        })
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

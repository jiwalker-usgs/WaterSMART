Ext.ns("WaterSMART");


WaterSMART.Map = Ext.extend(GeoExt.MapPanel, {
    layersLoading : 0,
    controller : undefined,
    cswRecordStore : undefined,
    currentMapConfig : {},
    defaultMapConfig : {
        layers : {
            baseLayers : [],
            layers : []
        },
        initialZoom : undefined,
        // This is reprojected from -88.459,30.039,-81.347,37.086, the watersmart:se_sites bounds
        initialExtent : new OpenLayers.Bounds(-9847210.8347114,3508563.9150696,-9055506.6162999,4451100.8664317)
    },
    owsEndpoint : undefined,
    plotterVars : undefined, 
    popup : undefined,
    sitesLayerName : undefined,
    sosEndpoint : undefined,
    WGS84 : new OpenLayers.Projection("EPSG:4326"),
    WGS84_GOOGLE_MERCATOR : new OpenLayers.Projection("EPSG:900913"),
    constructor : function(config) {
        LOG.debug('map.js::constructor()');
        var options = config || {};
        
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
            new OpenLayers.Control.Navigation(),
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
                
        //TODO- $.extend(true...) performs a deep copy of a JSON object.
        //Get another way of doing a deep copy of a JSON object so we can
        //remove the JQuery lib from this project. 
        this.currentMapConfig = $.extend(true, {}, this.defaultMapConfig);
        this.processMapConfigObject(this.defaultMapConfig);
        this.map.events.on({
            'preremovelayer' :  function () {
                LOG.debug('map.js::Layer is being removed');
            },
            'preaddlayer' : function (event) {
                var layer = event.layer;
                layer.events.on({
                    'loadstart' : function () {
                        this.layersLoading++;
                        LOG.debug('map.js::Layer loading started. Layers loading: ' + this.layersLoading);
                        if (this.layersLoading == 1) {
                            this.fireEvent("layer-load-start");
                        }
                    },
                    'loadend' : function() {
                        this.layersLoading--;
                        LOG.debug('map.js::Layer loading ended. Layers loading: ' + this.layersLoading);
                        if (this.layersLoading === 0) {
                            this.fireEvent("layer-load-end");
                        }
                    },
                    'loadcancel' : function () {
                        this.layersLoading = 0;
                        LOG.debug('map.js::Layer loading cancelled. Layers loading: ' + this.layersLoading);
                    },
                    scope : this
                })              
            },
            scope : this
        })
    },
    addIdentifyToolingToMap: function() {
        LOG.debug('map.js::addIdentifyToolingToMap()');
        var currentGetFeatureInfoControl = this.map.getControlsByClass("OpenLayers.Control.WMSGetFeatureInfo")[0];
        if (currentGetFeatureInfoControl) {
            LOG.debug('map.js::addIdentifyToolingToMap():Map already had this control on the map. Destroying and replacing with new control');
            currentGetFeatureInfoControl.destroy();
        }
        
        var getFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
            infoFormat : 'application/vnd.ogc.gml',
            maxFeatures : 1,
            layers : this.currentMapConfig.layers.layers,
            eventListeners : {
                getfeatureinfo : function(event) {
                    if (event.features && event.features[0]){

                        if(!this.popup) {
                            this.popup = new GeoExt.Popup({
                                id: 'plotter-window',
                                title: event.features[0].attributes.station_nm,
                                anchored: false,
                                width: 600,
                                height: 300,
                                map: this.map,
                                collapsible: true,
                                closeAction: 'hide',
                                listeners : {
                                    'resize' : function(popup, width, height) {
                                        popup.plotterPanel.resizePlotter(width, height);
                                    },
                                    'hide' : function(popup) {
                                        popup.removeAll(false);
                                    }
                                }
                            });
                        } else {
                            this.popup.setTitle(event.features[0].attributes.station_nm);
                        }
                        
                        new WaterSMART.Plotter({
                            url : this.sosEndpoint,
                            vars : this.plotterVars,
                            offering : event.features[0].attributes.site_no,
                            ownerWindow : this.popup
                        })
                    }
                },
                scope: this
            }
            
        });
        this.map.addControl(getFeatureInfoControl);
        LOG.debug('map.js::addIdentifyToolingToMap():New control added to map');
        getFeatureInfoControl.activate();
        LOG.debug('map.js::addIdentifyToolingToMap():New control activated');
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
        this.removeLayers(null, false);
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
                            LOG.trace('map.js::All layers have been loaded');
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
    removeLayers : function(layers, includeBaseLayers) {
        if (!layers) layers = this.layers.getRange();
        Ext.each(layers, function(record){
            LOG.debug('map.js::Removing layer : ' + record.getLayer().id);
            var isBaseLayer = record.getLayer().isBaseLayer;
            if (isBaseLayer && !includeBaseLayers) return;
            if (!record.getLayer().metadata.persist) {
                this.layers.remove(record)
            }
        }, this)
    }
});

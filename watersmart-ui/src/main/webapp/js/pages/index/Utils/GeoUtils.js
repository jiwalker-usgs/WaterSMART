Ext.ns("NAWQA");

NAWQA.GeoUtils = {
    STATE_ABBREVS : {
            "NJ" : 	"NEW JERSEY",
            "SD" : 	"SOUTH DAKOTA",
            "NV" : 	"NEVADA",
            "MS" : 	"MISSISSIPPI",
            "NC" : 	"NORTH CAROLINA",
            "UT" : 	"UTAH",
            "DC" : 	"DISTRICT OF COLUMBIA",
            "WA" : 	"WASHINGTON",
            "SC" : 	"SOUTH CAROLINA",
            "IN" : 	"INDIANA",
            "MD" : 	"MARYLAND",
            "LA" : 	"LOUISIANA",
            "FL" : 	"FLORIDA",
            "TX" : 	"TEXAS",
            "MO" : 	"MISSOURI",
            "MN" : 	"MINNESOTA",
            "NM" : 	"NEW MEXICO",
            "WV" : 	"WEST VIRGINIA",
            "TN" : 	"TENNESSEE",
            "IL" : 	"ILLINOIS",
            "VT" : 	"VERMONT",
            "WY" : 	"WYOMING",
            "ME" : 	"MAINE",
            "RI" : 	"RHODE ISLAND",
            "CT" : 	"CONNECTICUT",
            "IA" : 	"IOWA",
            "WI" : 	"WISCONSIN",
            "MI" : 	"MICHIGAN",
            "MT" : 	"MONTANA",
            "MA" : 	"MASSACHUSETTS",
            "KY" : 	"KENTUCKY",
            "ID" : 	"IDAHO",
            "NE" : 	"NEBRASKA",
            "AR" : 	"ARKANSAS",
            "ND" : 	"NORTH DAKOTA",
            "AZ" : 	"ARIZONA",
            "NH" : 	"NEW HAMPSHIRE",
            "AL" : 	"ALABAMA",
            "OR" : 	"OREGON",
            "KS" : 	"KANSAS",
            "OH" : 	"OHIO",
            "DE" : 	"DELAWARE",
            "AK" : 	"ALASKA",
            "NY" : 	"NEW YORK",
            "CA" : 	"CALIFORNIA",
            "VA" : 	"VIRGINIA",
            "CO" : 	"COLORADO",
            "GA" : 	"GEORGIA",
            "PA" : 	"PENNSYLVANIA",
            "HI" : 	"HAWAII",
            "OK" : 	"OKLAHOMA"
        },
    zoomToZipCode : function(map, zip) {
        Ext.Ajax.request({
            url: CONFIG.CIDA_GEOSERVER_ENDPOINT + '/ows',
            params: {
                service : 'WFS',
                version : '1.1.0',
                request : 'GetFeature',
                outputFormat : 'json',
                typeName : 'nawqa_map:LU_ZIP_CODES',
                maxFeatures : '1',
                srsName : 'EPSG:900913',
                CQL_FILTER : 'ZIP_CODE=' + zip
            },
            success: function(response){
                var responseJSON = Ext.util.JSON.decode(response.responseText);
                if (responseJSON.features.length) {
                    var x = responseJSON.bbox[0];
                    var y = responseJSON.bbox[1];
                    var lonlat = new OpenLayers.LonLat(x, y);
                    LOG.debug('GeoUtils.js:: Centering on ' + x + ' ' + y);
                    map.setCenter(lonlat, map.numZoomLevels - 3, true, true);
                } else {
                    NOTIFY.info({msg : 'Zip code ' + zip + ' not found'});
                }
            },
            failure: function(response){
                NOTIFY.warn({msg : response.responseText});
            }
        }, this);
    },
    zoomToState : function(map, state) {
        if (state.length == 2) {
            state = this.STATE_ABBREVS[state.toUpperCase()];
        }
        
        Ext.Ajax.request({
            url: CONFIG.CIDA_GEOSERVER_ENDPOINT + '/ows',
            params: {
                service : 'WFS',
                version : '1.1.0',
                request : 'GetFeature',
                outputFormat : 'json',
                typeName : 'sample:CONUS',
                srsName : 'EPSG:900913',
                CQL_FILTER : 'STATE=strCapitalize(\'' + state + '\')'
            },
            success: function(response){
                var responseJSON = Ext.util.JSON.decode(response.responseText);
                if (responseJSON.features.length) {
                    var bbox = responseJSON.bbox;
                    var left = bbox[0];
                    var bottom = bbox[1];
                    var right = bbox[2];
                    var top = bbox[3];
                    var bounds = new OpenLayers.Bounds();
                    bounds.extend(new OpenLayers.LonLat(left, bottom));
                    bounds.extend(new OpenLayers.LonLat(right, top));
                    bounds.toBBOX();
                    LOG.info('Zooming to state at ' + left + ' ' + bottom + ' ' + right + ' ' + top);
                    map.zoomToExtent(bounds, true);
                } else {
                    NOTIFY.info({msg : 'State ' + state + ' not found'});
                }
            },
            failure: function(response){
                NOTIFY.warn({msg : response.responseText});
            }
        }, this);
    }
}
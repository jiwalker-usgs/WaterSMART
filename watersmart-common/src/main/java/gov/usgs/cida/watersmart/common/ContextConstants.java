/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.watersmart.common;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ContextConstants {

    /* Location of n52 wps_config file (contains rserve password) */
    public static final String WPS_CONFIG_LOCATION = "watersmart.wps.config.location";
    public static final String WPS_WAIT = "watersmart.wps.delay.ms";
    
    /* Is this environment considered development? (i.e. no security in place) */
    public static final String DEVELOPMENT = "watersmart.development";
    
    /* LDAP constants */
    public static final String LDAP_URL = "watersmart.ldap.url";
    public static final String LDAP_GROUP = "watersmart.ldap.group";
    public static final String LDAP_BASEDN = "watersmart.ldap.basedn";
    public static final String AUTHORIZATION_REQUIRED = "watersmart.ldap.require.auth"; // bother with authorization?
    
    /* File system management constants */
    public static final String UPLOAD_LOCATION = "watersmart.file.location";
    public static final String WPS_DIRECTORY = "watersmart.file.location.wps.repository"; // put WPS results
    public static final String NETCDF_LOCATION = "watersmart.sos.location";
    
    /* Service urls / url fragments */
    public static final String STATS_SOS_URL = "watersmart.sos.model.repo";
    public static final String APP_URL = "watersmart.external.mapping.url";
    public static final String WPS_URL = "watersmart.wps.url";
    public static final String CSW_URL = "watersmart.geonetwork.addr";
    public static final String STATION_WFS_URL = "watersmart.stations.url"; // no longer used?
    
    /* Email constants */
    public static final String EMAIL_HOST = "watersmart.email.host";
    public static final String EMAIL_PORT = "watersmart.email.port";
    public static final String EMAIL_FROM = "watersmart.email.from";
    public static final String EMAIL_TRACK = "watersmart.email.tracker";
    public static final String EMAIL_CHECK = "watersmart.email.check.interval.millis";
    public static final String EMAIL_MINUTES = "watersmart.email.notify.minutes";
    
    /* Geonetwork constants */
    public static final String CSW_USER = "watersmart.geonetwork.user";
    public static final String CSW_PASS = "watersmart.geonetwork.pass";
    public static final String CSW_UUID = "watersmart.csw.identifier.parent";
    
    /* UI constants */
    public static final String UPLOAD_MAXSIZE = "watersmart.file.maxsize";
    public static final String UI_LOG_PATTERN = "watersmart.frontend.log4js.pattern.layout";
    public static final String UI_LOG_THRESHOLD = "watersmart.frontend.log4js.threshold";
    public static final String LAYER_TYPENAME = "watersmart.stations.typeName"; // no longer used?
    public static final String LAYER_ATTR = "watersmart.stations.primaryAttribute"; // no longer used?
    public static final String SOS_OBSERVED_URL = "watersmart.sos.observed";
    
    
    
}

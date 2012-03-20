package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.parse.StationLookup;
import javax.naming.NamingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class JNDISingleton {
    
    private static final Logger LOG = LoggerFactory.getLogger(JNDISingleton.class);
    private static DynamicReadOnlyProperties props = null;
    
    public static DynamicReadOnlyProperties getInstance() {
        if (null == props) {
            try {
                props = new DynamicReadOnlyProperties().addJNDIContexts(new String[0]);
            } catch (NamingException e) {
                LOG.warn("Error occured during initProps()", e);
            }
        }
        return props;
    }
}

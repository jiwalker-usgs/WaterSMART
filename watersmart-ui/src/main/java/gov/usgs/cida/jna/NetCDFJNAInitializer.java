package gov.usgs.cida.jna;

import com.sun.jna.Native;
import gov.usgs.cida.netcdf.jna.NC;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class NetCDFJNAInitializer implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // access NC to kick off registration
        String tmp = NC.JNA_PROPERTY_NAME;
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        Native.unregister(NC.class);
    }

}

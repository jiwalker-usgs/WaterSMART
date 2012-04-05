package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.common.JNDISingleton;
import java.io.File;
import java.io.IOException;
import javax.naming.NamingException;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Creates a symbolic link in the web directory to an external directory which
 * acts as the WPS repository file dump
 *
 * @author isuftin
 */
public class StartupListener implements ServletContextListener {

    private static final Logger LOG = LoggerFactory.getLogger(StartupListener.class);
    private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            initializeFileRepository(sce);
        } catch (InterruptedException ex) {
            LOG.error("Could not create file repository directory. WPS output will not be able to dump files for retrieval. Error follows:\n{}", ex.getMessage());
        } catch (IOException ex) {
            LOG.error("Could not create file repository directory. WPS output will not be able to dump files for retrieval. Error follows:\n{}", ex.getMessage());
        }
    }

    private File initializeFileRepository(ServletContextEvent sce) throws IOException, InterruptedException {
        String repositoryPath = props.getProperty("watersmart.file.location") + props.getProperty("watersmart.file.location.wps.repository");
        File repositoryPathFile = new File(repositoryPath);

        String webPath = sce.getServletContext().getRealPath("/");

        if (!repositoryPathFile.exists()) {
            FileUtils.forceMkdir(repositoryPathFile);
        }

        Process process = Runtime.getRuntime().exec(new String[]{"ln", "-s", repositoryPath, webPath + props.getProperty("watersmart.file.location.wps.repository")});
        process.waitFor();
        process.destroy();

        return repositoryPathFile;
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        
    }
}

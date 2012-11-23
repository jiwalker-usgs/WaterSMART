package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.watersmart.common.RunMetadata;
import java.io.File;
import java.util.Map;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
interface WPSInterface {
    
    public String executeProcess(String sosEndpoint, RunMetadata metadata);  
    public String executeProcess(File zipLocation, RunMetadata metadata);    
    public String executeProcess(File zipLocation, Map<String, String> metadata);
}

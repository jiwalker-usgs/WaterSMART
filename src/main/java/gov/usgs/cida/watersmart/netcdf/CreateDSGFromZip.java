package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import gov.usgs.cida.watersmart.config.DynamicReadOnlyProperties;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.NotImplementedException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CreateDSGFromZip {
    
    private static final DynamicReadOnlyProperties props = DynamicReadOnlyProperties.initProps();
    
    public enum ModelType {
        SYE,
        WATERS,
        PRMS,
        FINCH;
    }
    
    public static void create(File srcZip, ModelType type) throws IOException {
        String sosPath = props.getProperty("watersmart.sos.location", System.getProperty("java.io.tmpdir"));
        String filename = srcZip.getName().replace(".zip", ".nc");
        
        File ncFile = new File(sosPath + File.separator + filename);
        ZipFile zip = new ZipFile(srcZip);
        Enumeration<? extends ZipEntry> entries = zip.entries();
        StationTimeSeriesNetCDFFile nc = null;
        List<Station> stations = StationLookup.getStationList();
        
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            if (!entry.isDirectory()) {
                InputStream inputStream = zip.getInputStream(entry);
                DSGParser dsgParse = null;
                switch (type) {
                    case SYE: 
                        dsgParse = new SYEParser(inputStream, entry.getName());
                        break;
                    case WATERS:
                        dsgParse = new WATERSParser(inputStream);
                        break;
                    default:
                        throw new NotImplementedException("Parser not written yet");
                }

                // must parse Metadata for each file
                RecordType meta = dsgParse.parseMetadata();
                
                // first file sets the rhythm
                if (nc == null) {
                    Station[] stupidArray = new Station[stations.size()];
                    stations.toArray(stupidArray);
                    nc = new StationTimeSeriesNetCDFFile(ncFile, meta, true, 
                            stupidArray);
                }
                while (dsgParse.hasNext()) {
                    Observation ob = dsgParse.next();
                    if (null != ob) {
                        nc.putObservation(ob);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        IOUtils.closeQuietly(nc);
    }
}

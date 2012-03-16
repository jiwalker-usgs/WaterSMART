package gov.usgs.cida.watersmart.parse;

import gov.usgs.cida.watersmart.parse.file.SYEParser;
import gov.usgs.cida.watersmart.parse.file.WATERSParser;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import gov.usgs.cida.watersmart.util.JNDISingleton;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.xml.stream.XMLStreamException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.NotImplementedException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CreateDSGFromZip {
    
    public enum ModelType {
        SYE,
        WATERS,
        PRMS,
        AFINCH;
    }
    
    public static void create(File srcZip, ModelType type, String wfsUrl, String typeName, String linkingAttr) throws IOException, XMLStreamException {
        // Need to put the resulting NetCDF file somewhere that ncSOS knows about
        String sosPath = JNDISingleton.getInstance().getProperty("watersmart.sos.location", System.getProperty("java.io.tmpdir"));
        String filename = srcZip.getName().replace(".zip", ".nc");
        
        File ncFile = new File(sosPath + File.separator + filename);
        ZipFile zip = new ZipFile(srcZip);
        Enumeration<? extends ZipEntry> entries = zip.entries();
        StationTimeSeriesNetCDFFile nc = null;
        
        // Get station wfs used for model
        
        StationLookup lookerUpper = new StationLookup(wfsUrl, typeName, linkingAttr);
        Collection<Station> stations = lookerUpper.getStations();
        
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

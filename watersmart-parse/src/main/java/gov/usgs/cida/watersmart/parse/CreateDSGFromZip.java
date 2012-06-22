package gov.usgs.cida.watersmart.parse;

import com.google.common.collect.Maps;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import gov.usgs.cida.watersmart.common.JNDISingleton;
import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.parse.column.AFINCHParser;
import gov.usgs.cida.watersmart.parse.file.SYEParser;
import gov.usgs.cida.watersmart.parse.file.WATERSParser;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
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
    
    public static class ReturnInfo {
        public Collection<Station> stations;
        public List<String> properties;
        public String filename;
    }
    
    public static ReturnInfo create(File srcZip, RunMetadata runMeta) throws IOException, XMLStreamException {
        // Need to put the resulting NetCDF file somewhere that ncSOS knows about
        String sosPath = JNDISingleton.getInstance().getProperty("watersmart.sos.location", System.getProperty("java.io.tmpdir"));
        String filename = srcZip.getName().replace(".zip", ".nc");
        
        File ncFile = new File(sosPath + File.separator + runMeta.getTypeString() +
                               File.separator + filename);
        ZipFile zip = new ZipFile(srcZip);
        Enumeration<? extends ZipEntry> entries = zip.entries();
        StationTimeSeriesNetCDFFile nc = null;
        
        // Get station wfs used for model
        
        StationLookup lookerUpper = new StationLookup(runMeta);
        Collection<Station> stations = lookerUpper.getStations();
        ReturnInfo info = new ReturnInfo();
        info.stations = stations;
        info.filename = filename;
        
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            if (!entry.isDirectory()) {
                InputStream inputStream = zip.getInputStream(entry);
                DSGParser dsgParse = null;
                switch (runMeta.getType()) {
                    case SYE: 
                        dsgParse = new SYEParser(inputStream, entry.getName(), lookerUpper);
                        break;
                    case WATERS:
                        dsgParse = new WATERSParser(inputStream, lookerUpper);
                        break;
                    case AFINCH:
                        dsgParse = new AFINCHParser(inputStream, lookerUpper);
                        break;
                    case WATERFALL:
                        // TODO make sure Waterfall uses SYEParser
                        dsgParse = new SYEParser(inputStream, entry.getName(), lookerUpper);
                    default:
                        throw new NotImplementedException("Parser not written yet");
                }

                // must parse Metadata for each file
                RecordType meta = dsgParse.parse();
                info.properties = meta.getDataVarNames();
                // first file sets the rhythm
                if (nc == null) {
                    Station[] stationArray = stations.toArray(new Station[stations.size()]);
                    Map<String,String> globalAttrs = applyBusinessRulesToMeta(runMeta);
                    
                    nc = new StationTimeSeriesNetCDFFile(ncFile, meta, globalAttrs, true, stationArray);
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
        return info;
    }
    
    private static Map<String, String> applyBusinessRulesToMeta(RunMetadata meta) {
        Map<String,String> globalAttrs = Maps.newLinkedHashMap();
        String title = "WaterSMART Intercomparison Portal - " + meta.getType().toString() +
                       " - " + meta.getScenario() + " - " + meta.getModelVersion() +
                       "." + meta.getRunIdent();
        String id = "watersmart." + meta.getType().toString() + "." + meta.getScenario() + 
                    "." + meta.getModelVersion() + "." + meta.getRunIdent();
        
        globalAttrs.put("title", title);
        globalAttrs.put("summary", meta.getComments());
        globalAttrs.put("id", id);
        globalAttrs.put("naming_authority", "gov.usgs.cida");
        globalAttrs.put("cdm_data_type", "Station");
        globalAttrs.put("date_created", meta.getCreationDate());
        globalAttrs.put("creator_name", meta.getName());
        globalAttrs.put("creator_email", meta.getEmail());
        globalAttrs.put("project", "WaterSMART Water Census");
        globalAttrs.put("processing_level", "Model Results");
        globalAttrs.put("standard_name_vocabulary", RecordType.CF_VER);
        return globalAttrs;
    }
}

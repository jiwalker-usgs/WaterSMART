package gov.usgs.cida.watersmart.netcdf;

import com.google.common.collect.LinkedListMultimap;
import com.google.common.collect.ListMultimap;
import com.google.common.collect.Multimaps;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tuckey.noclash.gzipfilter.org.apache.commons.lang.StringUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class AFINCHParser extends DSGParser {
    
    private static final Logger LOG = LoggerFactory.getLogger(AFINCHParser.class);
    
    private static final Pattern propertyPattern = Pattern.compile("# (\\w+)");
    private static final Pattern stationLinePattern = Pattern.compile("^\\s+((?:\\d+\\s+)+)$");
    private static final Pattern headerLinePattern = Pattern.compile("^TIMESTEP((?:\\s+[^\\s\\(]+\\(\\[^\\)]+\\))+)$");
    private static final Pattern dataLinePattern = Pattern.compile("^(\\d{4}-\\d{2}-\\d{2})((?:\\s+[^\\s]+)+)$");

    public static final DateTimeFormatter inputDateFormatter = ISODateTimeFormat.dateTimeParser();
    
    // Create a hashmap for each station, collect Observations
    private LinkedHashMap<Station, Observation> allData;
    private Collection<Station> stationsColl;
    
    public AFINCHParser(InputStream input, String wfsUrl, String layer, String commonAttr) throws IOException, XMLStreamException {
        super(input, wfsUrl, layer, commonAttr);
        
        String line = null;
        String property = null;
        String[] stations = null;
        String[] statistics = null;
        while (null != (line = reader.readLine())) {
            Matcher matcher = null;
            matcher = dataLinePattern.matcher(line);
            if (matcher.matches()) {
                Instant timestep = Instant.parse(matcher.group(1), getInputDateFormatter());
                String observations = matcher.group(2);
                String [] columns = observations.split("\\s+");
                // add values to list for station, when done, step through and create observations, adding to allData
                ListMultimap<String,Float> observationBuilderMap = LinkedListMultimap.create();
                for (int i=0; i<columns.length; i++) {
                    String coli = columns[i];
                    if (StringUtils.isBlank(coli)) continue;
                    Float value = Float.valueOf(coli);
                    String station = stations[i];
                    observationBuilderMap.put(station, value);
                }
                for (String station : observationBuilderMap.keySet()) {
                    Station stationObj = stationLookup.get(station);
                    List<Float> vals = observationBuilderMap.get(station);
                    Observation ob = new Observation(calculateTimeOffset(timestep),
                            stationObj.index,
                            vals.toArray());
                    allData.put(stationObj, ob);
                }
                
            }
            else {
                matcher = propertyPattern.matcher(line);
                if (matcher.matches()) {
                    
                }
            }
        }
    }
    
    @Override
    public RecordType parseMetadata() {
        RecordType rt = new RecordType("days since " + baseDate.toString());
        return rt;
    }

    @Override
    protected String getStationId(String parseText) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
    @Override
    public boolean hasNext() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
    @Override
    public Observation next() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
    @Override
    protected Pattern getDataLinePattern() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected Pattern getDataValuePattern() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected Pattern getHeaderLinePattern() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected Pattern getHeaderVariablePattern() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected DateTimeFormatter getInputDateFormatter() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    
}

package gov.usgs.cida.watersmart.netcdf;

import com.google.common.collect.*;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.Variable;
import gov.usgs.cida.netcdf.jna.NCUtil;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
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
    
    private static final Pattern statisticAndUnitsPattern = Pattern.compile("([^\\(]+)\\(([^\\)])\\)");

    public static final DateTimeFormatter inputDateFormatter = ISODateTimeFormat.dateTimeParser();
    
    // Create a hashmap for each station, collect Observations
    private ListMultimap<Station, Observation> allData;
    private Iterator marker;
    private Collection<Station> stationsColl;
    private RecordType record;
    
    public AFINCHParser(InputStream input, String wfsUrl, String layer, String commonAttr) throws IOException, XMLStreamException {
        super(input, wfsUrl, layer, commonAttr);
        allData = LinkedListMultimap.create();
        
        String line = null;
        String property = null;
        String[] stations = null;
        String[] statistics = null;
        while (null != (line = reader.readLine())) {
            Matcher matcher = null;
            matcher = dataLinePattern.matcher(line);
            if (matcher.matches()) { // actually happens last, put first as common case
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
                    property = matcher.group(1);
                    continue;
                }
                matcher = stationLinePattern.matcher(line);
                if (matcher.matches()) {
                    stations = matcher.group(1).split("\\s+");
                    continue;
                }
                matcher = headerLinePattern.matcher(line);
                if (matcher.matches()) {
                    statistics = matcher.group(1).split("\\s+");
                    continue;
                }
            }
        }
       
        record = new RecordType("days since " + baseDate.toString());
        // order matters
        Set<String> uniqueStats = Sets.newLinkedHashSet(Lists.newArrayList(statistics));
        
        for (String stat : uniqueStats) {
            Matcher statMatcher = stationLinePattern.matcher(stat);
            if (statMatcher.matches()) {
                String statname = statMatcher.group(1);
                String units = statMatcher.group(2);
                String longname = statname + " " + property;
                Map<String, Object> attrs = Maps.newHashMap();
                attrs.put("long_name", longname);
                attrs.put("units", units);
                Variable statVar = new Variable(statname, NCUtil.XType.NC_FLOAT, attrs);
                record.addType(statVar);
            }
        }
        
        // everything set up, start iterator
        marker = allData.entries().iterator();
    }
    
    @Override
    public RecordType parseMetadata() {
        return record;
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
    protected final DateTimeFormatter getInputDateFormatter() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    
}

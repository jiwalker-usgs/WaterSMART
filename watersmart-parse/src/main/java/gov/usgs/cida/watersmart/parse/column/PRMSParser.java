package gov.usgs.cida.watersmart.parse.column;

import com.google.common.collect.*;
import com.sun.media.sound.InvalidFormatException;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.Variable;
import gov.usgs.cida.netcdf.jna.NCUtil;
import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class PRMSParser extends StationPerColumnDSGParser {
    
    private static final Logger LOG = LoggerFactory.getLogger(PRMSParser.class);
    
    private static final Pattern stationLinePattern = Pattern.compile("^seg_(?:out|in)flow (\\d+)$");
    private static final Pattern dataLinePattern = Pattern.compile("^\\d+\\s+(\\d{4})\\s+(\\d{1,2})\\s+(\\d{1,2})\\s+(\\d{1,2})\\s+(\\d{1,2})\\s+(\\d{1,2})\\s+((?:[^\\s]+\\s*)+)$");

    public static final Pattern prmsFileNamePattern = Pattern.compile("^[^/]*/?(.*)\\.statvar$");
    
    // Create a hashmap for each station, collect Observations
    private InputStream paramInputStream;
    private Map<String, String> segmentMapping;
    private ListMultimap<Station, Observation> allData;
    private Iterator<Station> stationIterator;
    private Iterator<Observation> observationIterator;
    private RecordType record;
    private List<String> segments;
    
    public PRMSParser(InputStream statvar, InputStream param, StationLookup lookup) throws IOException, XMLStreamException {
        super(statvar, lookup);
        this.paramInputStream = param;
        this.segmentMapping = segmentToGageMapping(paramInputStream);
        this.allData = LinkedListMultimap.create();
        this.stationIterator = null;
        this.baseDate = null;
        this.observationIterator = null;
        this.record = null;
        this.segments = Lists.newArrayList();
    }
    
    @Override
    public RecordType parse() throws IOException {
        String line = null;

        while (null != (line = reader.readLine())) {
            Matcher matcher = null;
            matcher = getDataLinePattern().matcher(line);
            if (matcher.matches()) { // actually happens last, put first as common case
                int year = Integer.parseInt(matcher.group(1));
                int month = Integer.parseInt(matcher.group(2));
                int day = Integer.parseInt(matcher.group(3));
                int hour = Integer.parseInt(matcher.group(4));
                int minute = Integer.parseInt(matcher.group(5));
                int second = Integer.parseInt(matcher.group(6));
                DateTime timestep = new DateTime(year, month, day, hour, minute, second);
                if (this.baseDate == null) {
                    this.baseDate = timestep;
                }

                String observations = matcher.group(7);
                String [] columns = observations.split("\\s+");
                
                if (columns.length != segments.size()) {
                    throw new InvalidFormatException("Must define a seg_outflow for each column of the data");
                }
                
                // add values to list for station, when done, step through and create observations, adding to allData
                ListMultimap<String,Float> observationBuilderMap = LinkedListMultimap.create();
                for (int i=0; i<columns.length; i++) {
                    String coli = columns[i];
                    if (StringUtils.isBlank(coli)) continue;
                    Float value = Float.valueOf(coli);
                    String segment = segments.get(i);
                    String station = segmentMapping.get(segment);
                    if (station != null) {
                        observationBuilderMap.put(station, value);
                    }
                }
                for (String station : observationBuilderMap.keySet()) {
                    Station stationObj = stationLookup.get(station);
                    if (stationObj == null) {
                        LOG.debug("station doesn't match one from associated sites layer");
                        continue; // skip this one
                    }
                    List<Float> vals = observationBuilderMap.get(station);
                    Observation ob = new Observation(calculateTimeOffset(timestep),
                            stationObj.index,
                            vals.toArray());
                    allData.put(stationObj, ob);
                }
            }
            else {
                matcher = stationLinePattern.matcher(line);
                if (matcher.matches()) {
                    String segment = matcher.group(1);
                    segments.add(segment);
                    continue;
                }
            }
        }
       
        record = new RecordType("days since " + baseDate.toString());
        
        String statname = "flow";
        String units = "cfs";
        String longname = "Daily Flow";
        Map<String, Object> attrs = Maps.newHashMap();
        attrs.put("long_name", longname);
        attrs.put("units", units);
        Variable statVar = new Variable(statname, NCUtil.XType.NC_FLOAT, attrs);
        record.addType(statVar);
                
        stationIterator = allData.keySet().iterator();
        return record;
    }
    
    @Override
    public boolean hasNext() {
        if (stationIterator == null) {
            throw new RuntimeException("Must parse before iterating data");
        }
        return stationIterator.hasNext() || observationIterator.hasNext();
    }
    
    @Override
    public Observation next() {
        if (stationIterator == null) {
            throw new RuntimeException("Must parse before iterating data");
        }
        while (observationIterator == null || !observationIterator.hasNext()) {
            observationIterator = allData.get(stationIterator.next()).iterator();
        }
        return observationIterator.next();
    }
    
    @Override
    protected Pattern getDataLinePattern() {
        return dataLinePattern;
    }
    
    private static Map<String, String> segmentToGageMapping(InputStream is) throws IOException {
        Map<String, String> segmentMap = Maps.newHashMap();
        List<String> gages = Lists.newArrayList();
        List<String> segments = Lists.newArrayList();
        BufferedReader buf = new BufferedReader(new InputStreamReader(is));
        String line = null;
        int idsFlag = -1;
        int segsFlag = -1;
        try {
            while (null != (line = buf.readLine())) {
                if (line.contains("poi_gage_id")) {
                    idsFlag = 4;
                    continue;
                }
                if (idsFlag >= 0) {
                    if (line.contains("####")) {
                        idsFlag = -1;
                    }
                    else if (idsFlag > 0) {
                        idsFlag--;
                    }
                    else {
                        gages.add(line);
                    }
                }
                if (line.contains("poi_gage_segment")) {
                    segsFlag = 4;
                    continue;
                }
                if (segsFlag >= 0) {
                    if (line.contains("####")) {
                        segsFlag = -1;
                    }
                    else if (segsFlag > 0) {
                        segsFlag--;
                    }
                    else {
                        segments.add(line);
                    }
                }
            }
            
            if (gages.size() == segments.size()) {
                for (int i=0; i<segments.size(); i++) {
                    segmentMap.put(segments.get(i), gages.get(i));
                }
            }
        }
        finally {
            IOUtils.closeQuietly(buf);
        }
        return segmentMap;
    }

    @Override
    protected Pattern getHeaderLinePattern() {
        // Probably should separate PRMS into a different type since it doesn't have a
        // header and this method is useless
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected DateTimeFormatter getInputDateFormatter() {
        // I'm not actually sure why I did this this way.
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
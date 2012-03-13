package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private LinkedHashMap<String, Observation> allData;
    
    public AFINCHParser(InputStream input) throws FileNotFoundException, IOException {
        super(input);
        String line = null;
        String property = null;
        String[] stations = null;
        String[] statistics = null;
        while (null != (line = reader.readLine())) {
            Matcher matcher = null;
            matcher = dataLinePattern.matcher(line);
            if (matcher.matches()) {
                String timestep = matcher.group(1);
                String observations = matcher.group(2);
                String [] columns = observations.split("\\s+");
                // add values to list for station, when done, step through and create observations, adding to allData
                LinkedHashMap<String, List<Float>> observationBuilderMap = new LinkedHashMap<String, List<Float>>();
                for (int i=0; i<columns.length; i++) {
                    
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

package gov.usgs.cida.watersmart.parse.file;

import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Variable;
import gov.usgs.cida.netcdf.jna.NCUtil;
import gov.usgs.cida.watersmart.parse.DSGParser;
import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.DateTimeFormatterBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WATERSParser extends DSGParser {
    
    private static final Logger LOG = LoggerFactory.getLogger(WATERSParser.class);
    
    private static final Pattern userPattern = Pattern.compile("^User:\t(\\w+)$");
    private static final Pattern stationIdPattern = Pattern.compile("^StationID:\t(\\d+)$");
    
    // "Date\tVariable1 Name (units)\t..."
    private static final Pattern headerLinePattern = Pattern.compile("^Date((?:\t[^\t\\(]+ \\(\\w+\\))+)$");
    // "\tVariable Name (units)"
    private static final Pattern headerVariablePattern = Pattern.compile("\t([^\t\\(]+) \\((\\w+)\\)");
    
    // Line looks like 'mm/dd/yyyy\tval1\tval2...'
    private static final Pattern dataLinePattern = Pattern.compile("^(\\d+/\\d+/\\d{4})((?:\t[^\t]+)+)$");
    // Could have split on tabs but using this regex instead
    private static final Pattern dataValuePattern = Pattern.compile("\t([^\t]+)");
    
    public static final DateTimeFormatter inputDateFormatter = new DateTimeFormatterBuilder()
            .appendMonthOfYear(1)
            .appendLiteral('/')
            .appendDayOfMonth(1)
            .appendLiteral('/')
            .appendYear(4, 4)
            .toFormatter()
            .withZoneUTC();
    
    public WATERSParser(InputStream input) throws FileNotFoundException {
        super(input);
    }
    
    /**
     * Create a pattern that captures the variable names and gives null for
     * non-variable column headers
     * @param headerLine Line to parse which has been identified as a header
     * @return String array of variable names
     */
    private List<Variable> headerVariables(String headerLine) {
        LinkedList<Variable> vars = new LinkedList<Variable>();
        Matcher matcher = headerVariablePattern.matcher(headerLine);
        while (matcher.find()) {
            String varname = matcher.group(1);
            String units = matcher.group(2);
            if (null != varname) {
                Map<String,Object> attrs = new TreeMap<String,Object>();
                attrs.put("units", units);
                // assuming float for all var for now
                Variable var = new Variable(varname, NCUtil.XType.NC_FLOAT, attrs);
                vars.add(var);
            }
        }
        return vars;
    }
    
    /**
     * StationId's will be included in file header
     * change the pattern or this function to reflect the actual format
     * Used by parseMetadata to perform a lookup
     * @param filename Name of the file being parsed
     * @return station name for this data
     */
    @Override
    protected String getStationId(String possibleStationLine) {
        Matcher matcher = stationIdPattern.matcher(possibleStationLine);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }
    
    private String getUser(String possibleUserLine) {
        Matcher matcher = userPattern.matcher(possibleUserLine);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }

    @Override
    public RecordType parseMetadata() {

        try {
            reader.mark(READ_AHEAD_LIMIT);
            String line = null;
            boolean headerRead = false;
            List<Variable> vars = null;
            while (null != (line = reader.readLine())) {
                Matcher matcher = getHeaderLinePattern().matcher(line);
                if (headerRead) {
                    // common case
                    matcher = dataLinePattern.matcher(line);
                    if (matcher.matches()) {
                        String date = matcher.group(1);
                        Instant timestep = Instant.parse(date, getInputDateFormatter());
                        this.baseDate = timestep;
                        
                        RecordType recordType = new RecordType("days since " + baseDate.toString());
                        for (Variable var : vars) {
                            recordType.addType(var);
                        }
                        
                        reader.reset();
                        return recordType;
                    }
                }
                else if (matcher.matches()) {
                    // happens before data
                    vars = headerVariables(matcher.group(1));
                    reader.mark(READ_AHEAD_LIMIT);
                    headerRead = true;
                }
                else {
                    String station = getStationId(line);
                    if (station != null) {
                        this.stationIndex = StationLookup.lookup(station);
                    }
                    else {
                        String user = getUser(line);
                        if (user != null) {
                            // do something with user?
                        }
                    }
                }
            }
            
        }
        catch (IOException ex) {
            LOG.debug("Error reading metadata", ex);
        }
        return null;
    }

    @Override
    protected Pattern getDataLinePattern() {
        return dataLinePattern;
    }

    @Override
    protected Pattern getDataValuePattern() {
        return dataValuePattern;
    }

    @Override
    protected Pattern getHeaderLinePattern() {
        return headerLinePattern;
    }

    @Override
    protected Pattern getHeaderVariablePattern() {
        return headerVariablePattern;
    }

    @Override
    protected DateTimeFormatter getInputDateFormatter() {
        return inputDateFormatter;
    }
    
}

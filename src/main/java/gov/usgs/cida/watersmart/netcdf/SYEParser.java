package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Variable;
import gov.usgs.cida.netcdf.jna.NCUtil;
import java.io.*;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Days;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.DateTimeFormatterBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Parses an individual file of the SYE R type (stations) need to be the filenames
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SYEParser extends DSGParser {
    
    private static final Logger LOG = LoggerFactory.getLogger(DSGParser.class);
    
    /* if I want to get info from header (ex. varnames) use this
     * this should be the last line before the data starts
     * may want other patterns for pieces of metadata (ex. stationId)
     * and for some formats, there could be a data separator (when not broken up into separate files)
     */
    public static final Pattern headerLinePattern = Pattern.compile("^\"date\"(?: \"\\w+\")+$");
    public static final Pattern stationIdPattern = Pattern.compile("(\\w+)\\.txt");
    
    public static final Pattern dataPattern = Pattern.compile("^\"\\d+\" \"(\\d+/\\d+/\\d{4})\" ([^ ]+) ([^ ]+)$");
    public static final DateTimeFormatter inputDateFormatter = new DateTimeFormatterBuilder()
            .appendMonthOfYear(1)
            .appendLiteral('/')
            .appendDayOfMonth(1)
            .appendLiteral('/')
            .appendYear(4, 4)
            .toFormatter()
            .withZoneUTC();
    
    // base date is also used as a metadataComplete flag
    private Instant baseDate;
    private String filename;
    private int stationIndex;
    private RecordType recordType;
    
    public SYEParser(File infile) throws FileNotFoundException {
        super(infile);
        this.filename = infile.getName();
        this.stationIndex = -1;
        // Defining variable pattern here, watch out for this
        this.headerVariablePattern = Pattern.compile("(?:\\s?\"date|(\\w+)\")");
    }
    
    /**
     * StationId's will be included in the filename
     * change the pattern or this function to reflect the actual format
     * Used by parseMetadata to perform a lookup
     * @param filename Name of the file being parsed
     * @return station name for this data
     */
    private String getStationId(String filename) {
        Matcher matcher = stationIdPattern.matcher(filename);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }
    
    @Override
    public RecordType parseMetadata() {
        this.baseDate = null; // get baseDate somehow (may be static)
        // define what we need for metadata
        
        // this.stationIndex = somewhere.stationLookup(getStationId(this.filename));
        this.stationIndex = 0; // TODO do some sort of lookup here

        try {
            reader.mark(READ_AHEAD_LIMIT);
            String line = null;
            boolean headerRead = false;
            String[] columns = null;
            while (null != (line = reader.readLine())) {
                Matcher matcher = headerLinePattern.matcher(line);
                if (matcher.matches()) {
                    columns = headerVariables(line);
                    // recordType add var ...
                    reader.mark(READ_AHEAD_LIMIT);
                    headerRead = true;
                }
                else if (headerRead) {
                    matcher = dataPattern.matcher(line);
                    if (matcher.matches()) {
                        String date = matcher.group(1);
                        Instant timestep = Instant.parse(date, inputDateFormatter);
                        this.baseDate = timestep;
                        
                        recordType = new RecordType("days since " + baseDate.toString());
                        for (String varname : columns) {
                            // populate map with necessary attrs
                            Map<String,Object> attrs = new TreeMap<String,Object>();
                            // assuming float for all var for now
                            Variable var = new Variable(varname, NCUtil.XType.NC_FLOAT, attrs);
                            recordType.addType(var);
                        }
                            
                        reader.reset();
                        return recordType;
                    }
                }
            }
            
        }
        catch (IOException ex) {
            LOG.debug("Error reading metadata", ex);
        }
        return null;
    }
    
    /**
     * Reading of metadata needs to happen before this will work
     * This should always be preceded by a hasNext()
     * 
     * @return next Observation from the file, will be null if hasNext() was not
     *  called and end of file was reached or metadata hasn't been parsed yet
     */
    @Override
    public Observation next() {
        // go through the file and make a list of Observation elements
        // Observation requires station index, so be wary of that
        Observation observation = null;
        try {
            if (baseDate != null && stationIndex >= 0) {
                String line = reader.readLine();
                if (null != line) {
                    Matcher matcher = dataPattern.matcher(line);
                    if (matcher.matches()) {
                        String date = matcher.group(1);
                        Instant timestep = Instant.parse(date, inputDateFormatter);
                        if (baseDate == null) {
                            baseDate = timestep;
                        }
                        // may want to support other units (hours, months, years, etc)
                        int days = Days.daysBetween(baseDate, timestep).getDays();
                        float estValue = Float.parseFloat(matcher.group(2));
                        // can change to int?
                        float obsValue = Float.parseFloat(matcher.group(3));
                        observation = new Observation(days, stationIndex, estValue, obsValue);
                    }
                }
            }
        }
        catch (IOException ioe) {
            LOG.debug("Error reading file", ioe);
        }
        finally {
            return observation;
        }
    }
}

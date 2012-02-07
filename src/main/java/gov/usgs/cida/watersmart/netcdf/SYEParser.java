package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Days;
import org.joda.time.Instant;
import org.joda.time.Period;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.DateTimeFormatterBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
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
    public static final Pattern headerPattern = Pattern.compile("^\"date\" \"estq\" \"obsq\"$");
    public static final Pattern dataPattern = Pattern.compile("^\"\\d+\" \"(\\d+/\\d+/\\d{4})\" ([^ ]+) ([^ ]+)$");
    public static final DateTimeFormatter inputDateFormatter = new DateTimeFormatterBuilder()
            .appendMonthOfYear(1)
            .appendLiteral('/')
            .appendDayOfMonth(1)
            .appendLiteral('/')
            .appendYear(4, 4)
            .toFormatter()
            .withZoneUTC();
    private static final int readAheadLimit = 4096;
    
    // base date is also used as a metadataComplete flag
    private Instant baseDate;
    private File inputFile;
    private BufferedReader reader;
    private int stationIndex;
    private RecordType recordType;
    
    public SYEParser(File infile) {
        this.inputFile = infile;
        this.stationIndex = -1;
        try {
            reader = new BufferedReader(new FileReader(this.inputFile));
        }
        catch (FileNotFoundException fnfe) {
            LOG.error("Input file not found", fnfe);
        }
    }
    
    @Override
    public RecordType parseMetadata() {
        this.baseDate = null; // get baseDate somehow (may be static)
        // define what we need for metadata
        this.stationIndex = 0; // TODO do some sort of lookup here

        try {
            reader.mark(readAheadLimit);
            String line = null;
            boolean headerRead = false;
            while (null != (line = reader.readLine())) {
                Matcher matcher = headerPattern.matcher(line);
                if (matcher.matches()) {
                    // could pull column names here?
                    // recordType add var ...
                    reader.mark(readAheadLimit);
                    headerRead = true;
                }
                else if (headerRead) {
                    matcher = dataPattern.matcher(line);
                    if (matcher.matches()) {
                        String date = matcher.group(1);
                        Instant timestep = Instant.parse(date, inputDateFormatter);
                        this.baseDate = timestep;
                        recordType = new RecordType("days since " + baseDate.toString());
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

    @Override
    public boolean hasNext() {
        try {
            reader.mark(readAheadLimit);
            String line = reader.readLine();
            reader.reset();
            return (line != null);
        }
        catch (IOException ex) {
            LOG.debug("Failure reading file", ex);
            return false;
        }
    }
}

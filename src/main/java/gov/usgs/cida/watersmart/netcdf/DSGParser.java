package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.io.*;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Days;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.DateTimeFormatterBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class DSGParser implements Iterator<Observation> {

    private static Logger LOG = LoggerFactory.getLogger(DSGParser.class);
    public static final int READ_AHEAD_LIMIT = 4096;
    

    protected abstract Pattern getDataLinePattern();
    protected abstract Pattern getDataValuePattern();
    
    /**
     * this should match the last line before the data starts
     * may want other patterns for pieces of metadata (ex. stationId)
     * and for some formats, there could be a data separator (when not broken up into separate files)
     * @return Pattern describing the header line that precedes the data
     */
    protected abstract Pattern getHeaderLinePattern();
    protected abstract Pattern getHeaderVariablePattern();
    
    protected abstract DateTimeFormatter getInputDateFormatter();
    
    protected BufferedReader reader;
    protected Instant baseDate;
    protected int stationIndex;
    
    public DSGParser(InputStream input) throws FileNotFoundException {
        this.reader = new BufferedReader(new InputStreamReader(input));
        this.baseDate = new Instant(0L);
        this.stationIndex = -1;
    }
    
    @Override
    public boolean hasNext() {
        try {
            reader.mark(READ_AHEAD_LIMIT);
            String line = reader.readLine();
            reader.reset();
            return (line != null);
        }
        catch (IOException ex) {
            LOG.debug("Failure reading file", ex);
            return false;
        }
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
            if (stationIndex >= 0) {
                String line = reader.readLine();
                if (null != line) {
                    Matcher lineMatcher = getDataLinePattern().matcher(line);
                    if (lineMatcher.matches()) {
                        String date = lineMatcher.group(1);
                        Instant timestep = Instant.parse(date, getInputDateFormatter());
                        // may want to support other units (hours, months, years, etc)
                        int days = Days.daysBetween(this.baseDate, timestep).getDays();
                        
                        String values = lineMatcher.group(2);
                        Matcher valueMatcher = getDataValuePattern().matcher(values);
                        List<Float> floatVals = new LinkedList<Float>();
                        while (valueMatcher.find()) {
                            float value = Float.parseFloat(valueMatcher.group(1));
                            floatVals.add(value);
                        }
                        observation = new Observation(days, stationIndex, floatVals.toArray());
                    }
                }
            }
            else {
                throw new IllegalStateException("Must obtain stationId before getting observations");
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
    public void remove() {
        // since this is a parser, remove doesn't make sense
    }
    
    public abstract RecordType parseMetadata();

    /**
     * StationId's are extracted on a per file basis
     * change the pattern or this function to reflect the actual format
     * Used by parseMetadata to perform a lookup
     * @param parseText Text to parse for stationId
     * @return station name for this data
     */
    protected abstract String getStationId(String parseText);
    
}

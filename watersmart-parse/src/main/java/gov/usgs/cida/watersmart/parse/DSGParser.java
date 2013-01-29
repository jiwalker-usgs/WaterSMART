package gov.usgs.cida.watersmart.parse;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.joda.time.Days;
import org.joda.time.Instant;
import org.joda.time.ReadableInstant;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class DSGParser implements Iterator<Observation> {

    protected static Logger LOG = LoggerFactory.getLogger(DSGParser.class);
    public static final int READ_AHEAD_LIMIT = 4096;

    protected abstract Pattern getDataLinePattern();

    /**
     * this should match the last line before the data starts may want other
     * patterns for pieces of metadata (ex. stationId) and for some formats,
     * there could be a data separator (when not broken up into separate files)
     *
     * @return Pattern describing the header line that precedes the data
     */
    protected abstract Pattern getHeaderLinePattern();

    protected abstract DateTimeFormatter getInputDateFormatter();
    protected BufferedReader reader;
    protected ReadableInstant baseDate;
    protected String stationNum;
    protected StationLookup stationLookup;

    public DSGParser(InputStream input, StationLookup lookup) throws IOException, XMLStreamException {
        this.reader = new BufferedReader(new InputStreamReader(input));
        this.baseDate = new Instant(0L);
        this.stationLookup = lookup;
        this.stationNum = null;
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
     * Iterates through a file observation at a time
     * @return Observation representing one timestep and array of values
     */
    public abstract Observation next();
    
    protected int calculateTimeOffset(ReadableInstant time) {
        // may want to support other units (hours, months, years, etc)
        int days = Days.daysBetween(this.baseDate, time).getDays();
        return days;
    }

    @Override
    public void remove() {
        throw new UnsupportedOperationException("remove doesn't make sense");
    }

    public abstract RecordType parse() throws IOException;

    /**
     * StationId's are extracted on a per file basis change the pattern or this
     * function to reflect the actual format Used by parse to perform a
     * lookup
     *
     * @param parseText Text to parse for stationId
     * @return station name for this data
     */
    protected abstract String getStationId(String parseText);
    
    public abstract int getTimeStepCount();
}

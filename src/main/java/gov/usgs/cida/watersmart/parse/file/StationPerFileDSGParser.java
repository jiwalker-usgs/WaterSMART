package gov.usgs.cida.watersmart.parse.file;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.watersmart.parse.DSGParser;
import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.joda.time.Instant;
import org.joda.time.format.DateTimeFormatter;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class StationPerFileDSGParser extends DSGParser {
    
    protected int stationIndex;

    public StationPerFileDSGParser(InputStream instream, StationLookup lookup) throws IOException, XMLStreamException {
        super(instream, lookup);
        this.stationIndex = -1;
    }
    
    @Override
    protected abstract Pattern getDataLinePattern();
    protected abstract Pattern getDataValuePattern();
    
    @Override
    protected abstract Pattern getHeaderLinePattern();
    protected abstract Pattern getHeaderVariablePattern();
    
    protected abstract Pattern getStationIdPattern();

    @Override
    protected abstract DateTimeFormatter getInputDateFormatter();

    @Override
    public abstract RecordType parse() throws IOException;

    /**
     * Pulls the station out of the string passed in using the stationIdPattern
     * @param parseText line with stationId contained
     * @return String containing stationId
     */
    @Override
    protected String getStationId(String parseText) {
        Matcher matcher = getStationIdPattern().matcher(parseText);
        if (matcher.matches()) {
            return matcher.group(1);
        }
        return null;
    }

    /**
     * Reading of metadata needs to happen before this will work This should
     * always be preceded by a hasNext()
     *
     * @return next Observation from the file, will be null if hasNext() was not
     * called and end of file was reached or metadata hasn't been parsed yet
     */
    @Override
    public Observation next() {
        // go through the file and make a list of Observation elements
        // Observation requires station index, so be wary of that
        Observation observation = null;
        if (this.stationIndex >= 0) {
            try {
                String line = reader.readLine();
                if (null != line) {
                    Matcher lineMatcher = getDataLinePattern().matcher(line);
                    if (lineMatcher.matches()) {
                        String date = lineMatcher.group(1);
                        Instant timestep = Instant.parse(date,
                                                         getInputDateFormatter());
                        int days = calculateTimeOffset(timestep);
                        String values = lineMatcher.group(2);
                        Matcher valueMatcher = getDataValuePattern().matcher(values);
                        List<Float> floatVals = new LinkedList<Float>();
                        while (valueMatcher.find()) {
                            float value = Float.parseFloat(valueMatcher.group(1));
                            floatVals.add(value);
                        }
                        observation = new Observation(days, stationIndex,
                                                      floatVals.toArray());
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
        else {
            throw new IllegalStateException("Must obtain stationId before getting observations");
        }
    }
}

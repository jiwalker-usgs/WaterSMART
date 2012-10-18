package gov.usgs.cida.watersmart.parse.file;

import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class STATSParser extends WATERSParser {
    
    private static final Logger LOG = LoggerFactory.getLogger(STATSParser.class);
    
    private static final Pattern userPattern = Pattern.compile("^User:\\s+(\\w+)$");
    private static final Pattern stationIdPattern = Pattern.compile("^StationID:\\s+[^\\d]?(\\d+)$");
    
    // "Date\tVariable1 Name (units)\t..."
    private static final Pattern headerLinePattern = Pattern.compile("^Date((?:\\s+[^\\s\\(]+\\s*\\(\\w+\\))+)$");
    // "\tVariable Name (units)"
    private static final Pattern headerVariablePattern = Pattern.compile("\\s+([^\\s\\(]+)\\s*\\((\\w+)\\)");
    
    // Line looks like 'mm/dd/yyyy\tval1\tval2...'
    private static final Pattern dataLinePattern = Pattern.compile("^(\\s*\\d+/\\s*\\d+/\\d{4})((?:\\s+\\S+)+)$");
    // Could have split on tabs but using this regex instead
    private static final Pattern dataValuePattern = Pattern.compile("\\s+(\\S+)");
    
    public STATSParser(InputStream input, StationLookup lookup) throws IOException, XMLStreamException {
        super(input, lookup);
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

    @Override
    protected Pattern getStationIdPattern() {
        return stationIdPattern;
    }
    
    @Override
    protected Pattern getUserPattern() {
        return stationIdPattern;
    }
}

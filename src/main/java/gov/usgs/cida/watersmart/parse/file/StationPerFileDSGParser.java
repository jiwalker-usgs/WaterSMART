package gov.usgs.cida.watersmart.parse.file;

import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.watersmart.parse.DSGParser;
import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
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

    @Override
    public RecordType parseMetadata() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected String getStationId(String parseText) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
}

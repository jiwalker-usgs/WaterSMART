package gov.usgs.cida.watersmart.parse.column;

import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.watersmart.parse.DSGParser;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Pattern;
import javax.xml.stream.XMLStreamException;
import org.joda.time.format.DateTimeFormatter;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class StationPerColumnDSGParser extends DSGParser {

    public StationPerColumnDSGParser(InputStream instream, String wfsUrl, String typeName, String commonAttr) throws IOException, XMLStreamException {
        super(instream, wfsUrl, typeName, commonAttr);
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

package gov.usgs.cida.watersmart.parse.column;

import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.watersmart.parse.DSGParser;
import gov.usgs.cida.watersmart.parse.StationLookup;
import java.io.IOException;
import java.io.InputStream;
import javax.xml.stream.XMLStreamException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class StationPerColumnDSGParser extends DSGParser {

    public StationPerColumnDSGParser(InputStream instream, StationLookup lookup) throws IOException, XMLStreamException {
        super(instream, lookup);
    }
    
    @Override
    public RecordType parse() throws IOException{
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    protected String getStationId(String parseText) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
}

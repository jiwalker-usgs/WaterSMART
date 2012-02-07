package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.util.Iterator;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class DSGParser implements Iterator<Observation> {

    @Override
    public abstract boolean hasNext();

    @Override
    public abstract Observation next();

    @Override
    public void remove() {
        // since this is a parser, remove doesn't make sense
    }
    
    public abstract RecordType parseMetadata();
}

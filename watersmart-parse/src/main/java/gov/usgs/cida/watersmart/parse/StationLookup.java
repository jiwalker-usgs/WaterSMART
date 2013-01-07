package gov.usgs.cida.watersmart.parse;

import gov.usgs.cida.netcdf.dsg.Station;
import java.util.Collection;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public interface StationLookup {

    /**
     * Returns station object
     *
     * @param stationName station name or number
     * @return Station or null if not found
     */
    Station get(String stationName);

    Collection<Station> getStations();

    /**
     * Looks up the station id by station name
     *
     * @param stationName name or number of station
     * @return index of station for referencing in NetCDF file, -1 if not found
     */
    int lookup(String stationName);
    
}

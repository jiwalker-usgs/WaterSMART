
package gov.usgs.cida.watersmart.netcdf;

import java.util.List;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import org.junit.Test;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class StationLookupTest {

    /**
     * Test of getStationList method, of class StationLookup.
     */
    @Test
    public void testGetStationList() {
        System.out.println("getStationList:");
        List<String> stations = StationLookup.getStationList();
        assertThat(stations.size(), is(equalTo(509)));
    }
    
    @Test
    public void testLookup() {
        int lookup = StationLookup.lookup("2185200");
        assertThat(lookup, is(equalTo(5)));
    }

}
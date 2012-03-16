
package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.watersmart.parse.file.WATERSParser;
import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.net.URL;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertThat;
import org.junit.Test;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class WATERSParserTest {
    
    public static final File sampleFile;
    
    static {
        String sample = "gov/usgs/cida/watersmart/netcdf/WATERS.txt";
        URL tmp = SYEParserTest.class.getClassLoader().getResource(sample);
        sampleFile = new File(tmp.getFile());
    }

    /**
     * Test of getStationId method, of class WATERSParser.
     * @throws FileNotFoundException 
     */
    @Test
    public void testGetStationId() throws FileNotFoundException {
        String possibleStationLine = "StationID:\t12345";
        WATERSParser instance = new WATERSParser(new FileInputStream(sampleFile));
        String expResult = "12345";
        String result = instance.getStationId(possibleStationLine);
        assertThat(result, is(equalTo(expResult)));
    }

    /**
     * Test of parseMetadata method, of class WATERSParser.
     */
    @Test
    public void testParseMetadata() throws FileNotFoundException {
        System.out.println("parseMetadata");
        WATERSParser instance = new WATERSParser(new FileInputStream(sampleFile));
        RecordType result = instance.parseMetadata();
        // Should have written RecordType to be more testable
        assertThat(result, notNullValue());
    }

    @Test
    public void testNetcdfOutput() throws FileNotFoundException {
        WATERSParser watersParser = new WATERSParser(new FileInputStream(sampleFile));
        StationTimeSeriesNetCDFFile nc = null;
        File ncFile = null;
        try {
            ncFile = new File("/tmp/test.nc");
            RecordType rt = watersParser.parseMetadata();
            Station sampleStation = new Station(34.8139814f, -83.305993f, "02177000");
            nc = new StationTimeSeriesNetCDFFile(ncFile, rt, true, sampleStation);
            while (watersParser.hasNext()) {
                Observation ob = watersParser.next();
                if (null != ob) {
                    nc.putObservation(ob);
                }
                else {
                    break;
                }
            }
        }
        finally {
            IOUtils.closeQuietly(nc);
            assertThat(FileUtils.sizeOf(ncFile), is(equalTo(16769L)));
            FileUtils.deleteQuietly(ncFile);
        }
    }

}
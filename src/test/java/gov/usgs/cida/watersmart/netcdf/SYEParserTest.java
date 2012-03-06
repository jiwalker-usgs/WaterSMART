package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URL;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import org.joda.time.DateTimeFieldType;
import org.joda.time.Instant;
import static org.junit.Assert.assertThat;
import org.junit.Test;


/**
 * List all the assumptions about the data to be parsed
 * then test each assumption
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SYEParserTest {
    
    public static final File sampleFile;
    
    static {
        String sample = "gov/usgs/cida/watersmart/netcdf/02177000.txt";
        URL tmp = SYEParserTest.class.getClassLoader().getResource(sample);
        sampleFile = new File(tmp.getFile());
    }
    
    @Test
    public void testDateFormat() {

        // month/day/year not 0 padded
        String date1 = "1/2/2009";
        // some people might 0 pad
        String date2 = "02/03/1998";
        Instant instant = Instant.parse(date1, SYEParser.inputDateFormatter);
        assertThat(instant.get(DateTimeFieldType.monthOfYear()), is(equalTo(1)));
        assertThat(instant.get(DateTimeFieldType.dayOfMonth()), is(equalTo(2)));
        assertThat(instant.get(DateTimeFieldType.year()), is(equalTo(2009)));
        instant = Instant.parse(date2, SYEParser.inputDateFormatter);
        assertThat(instant.get(DateTimeFieldType.monthOfYear()), is(equalTo(2)));
        assertThat(instant.get(DateTimeFieldType.dayOfMonth()), is(equalTo(3)));
        assertThat(instant.get(DateTimeFieldType.year()), is(equalTo(1998)));
    }
    
    @Test
    public void testParseObservations() throws IOException {
        SYEParser syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName());
        syeParser.parseMetadata();
        if (syeParser.hasNext()) {
            Observation ob = syeParser.next();
            assertThat(((Float)ob.values[0]).floatValue(), is(equalTo(70.66f)));
        }
    }
    
    @Test(expected=IllegalStateException.class)
    public void testParseObservationsTooEarly() throws FileNotFoundException {
        SYEParser syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName());
        Observation ob = syeParser.next();
    }
    
    @Test
    public void testNetCDFOutput() throws IOException {
        SYEParser syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName());
        StationTimeSeriesNetCDFFile nc = null;
        File ncFile = null;
        try {
            ncFile = new File("/tmp/test.nc");
            RecordType rt = syeParser.parseMetadata();
            Station sampleStation = new Station(34.8139814f, -83.305993f, "02177000");
            nc = new StationTimeSeriesNetCDFFile(ncFile, rt, true, sampleStation);
            while (syeParser.hasNext()) {
                Observation ob = syeParser.next();
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
            assertThat(FileUtils.sizeOf(ncFile), is(equalTo(13079L)));
            FileUtils.deleteQuietly(ncFile);
        }
    }
    
}

package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import gov.usgs.cida.netcdf.dsg.Station;
import gov.usgs.cida.netcdf.dsg.StationTimeSeriesNetCDFFile;
import gov.usgs.cida.netcdf.dsg.Variable;
import gov.usgs.cida.netcdf.jna.NCUtil;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.TreeMap;
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
        String sample = "gov/usgs/cida/watersmart/netcdf/Archfield_sampleoutput_20Jan2012.txt";
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
        SYEParser syeParser = new SYEParser(sampleFile);
        syeParser.parseMetadata();
        if (syeParser.hasNext()) {
            Observation ob = syeParser.next();
            assertThat(((Float)ob.values[0]).floatValue(), is(equalTo(70.66f)));
        }

    }
    
    @Test
    public void testNetCDFOutput() throws IOException {
        SYEParser syeParser = new SYEParser(sampleFile);
        StationTimeSeriesNetCDFFile nc = null;
        File ncFile = null;
        try {
            ncFile = new File("/tmp/test.nc");
            RecordType rt = syeParser.parseMetadata();
            rt.addType(new Variable("obs", NCUtil.XType.NC_FLOAT, new TreeMap()));
            // can change to INT?
            rt.addType(new Variable("est", NCUtil.XType.NC_FLOAT, new TreeMap()));
            Station sampleStation = new Station(42.4f, -89.22f, "sample_station");
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
            assertThat(FileUtils.sizeOf(ncFile), is(equalTo(307571L)));
            FileUtils.deleteQuietly(ncFile);
        }
    }
    
}


package gov.usgs.cida.watersmart.parse.file;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import gov.usgs.cida.watersmart.common.ModelType;
import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip;

import java.io.File;
import java.io.IOException;

import javax.xml.stream.XMLStreamException;

import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import ucar.nc2.NetcdfFile;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class PRMS2ParserTest {

    public PRMS2ParserTest() {
    }
    private static final String outputDir = System.getProperty("java.io.tmpdir") + "/prms2";
    private static File sampleFile = null;
    
    @BeforeClass
    public static void setupClass() throws IOException {
        FileUtils.forceMkdir(new File(outputDir));
        sampleFile = new File(PRMS2ParserTest.class.getClassLoader()
                .getResource("gov/usgs/cida/watersmart/parse/test/PRMS2.zip")
                .getFile());
    }
    
    @AfterClass
    public static void tearDownClass() throws IOException {
        FileUtils.deleteDirectory(new File(outputDir));
    }

    @Test
    public void testNetCDF() throws IOException, XMLStreamException {
        RunMetadata runMeta = new RunMetadata(ModelType.PRMS2, "1", "test", "1", "1", "2012-07-10T00:00:00Z", 
            "Special", "comments", "jiwalker@usgs.gov", "http://cida-wiwsc-wsdev.er.usgs.gov:8081/geoserver/NWC/ows", 
            "NWC:Dense1", "site_no");
        CreateDSGFromZip.ReturnInfo info = CreateDSGFromZip.create(sampleFile, runMeta);
        File ncFile = new File(new File(outputDir), info.filename);
        
        assertEquals(info.filename, "PRMS2.nc");

        NetcdfFile dataFile = null;
		try {
			dataFile = NetcdfFile.open(ncFile.getPath(), null);

			/**
			 * location="/var/folders/nt/486jzvcj5d3g9bgwg5x1kv_c0000gp/T/prms2/PRMS2.nc"
			 */			
			assertEquals(dataFile.getLocation(), "/var/folders/nt/486jzvcj5d3g9bgwg5x1kv_c0000gp/T/prms2/PRMS2.nc");
		} catch (java.io.IOException e) {
			e.printStackTrace();
			fail();
		} finally {
			if (dataFile != null) {
				try {
					dataFile.close();
				} catch (IOException ioe) {
					ioe.printStackTrace();
				}
			}
		}
        FileUtils.deleteQuietly(ncFile);
    }
    
    @Test
    public void testNewSample() throws IOException, XMLStreamException {
        sampleFile = new File(PRMS2ParserTest.class.getClassLoader()
            .getResource("gov/usgs/cida/watersmart/parse/test/PRMS2.zip")
            .getFile());
        
        //TODO remove gdp2qa dependency
        RunMetadata runMeta = new RunMetadata(ModelType.PRMS2, "1", "test", "1", "1", "2012-07-10T00:00:00Z", 
            "Special", "comments", "jiwalker@usgs.gov", "http://cida-wiwsc-wsdev.er.usgs.gov:8081/geoserver/NWC/ows", 
            "NWC:Dense1", "site_no");
        CreateDSGFromZip.ReturnInfo info = CreateDSGFromZip.create(sampleFile, runMeta);
        File ncFile = new File(new File(outputDir), info.filename);
        
        assertEquals(info.filename, "PRMS2.nc");
        

        NetcdfFile dataFile = null;
		try {
			dataFile = NetcdfFile.open(ncFile.getPath(), null);

			/**
			 * location="/var/folders/nt/486jzvcj5d3g9bgwg5x1kv_c0000gp/T/prms2/PRMS2.nc"
			 */			
			assertEquals(dataFile.getLocation(), "/var/folders/nt/486jzvcj5d3g9bgwg5x1kv_c0000gp/T/prms2/PRMS2.nc");
		} catch (java.io.IOException e) {
			e.printStackTrace();
			fail();
		} finally {
			if (dataFile != null) {
				try {
					dataFile.close();
				} catch (IOException ioe) {
					ioe.printStackTrace();
				}
			}
		}
        FileUtils.deleteQuietly(ncFile);
    }

}
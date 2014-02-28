
package gov.usgs.cida.watersmart.parse.column;

import gov.usgs.cida.watersmart.common.ModelType;
import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip.ReturnInfo;

import java.io.File;
import java.io.IOException;
import java.net.URL;

import javax.xml.stream.XMLStreamException;

import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;
import static org.junit.Assert.*;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class AFINCHParserTest {

    public AFINCHParserTest() {
    }
    
    private static final String outputDir = System.getProperty("java.io.tmpdir") + "/afinch";
    private static File sampleFile = null;
    
    @BeforeClass
    public static void setupClass() throws IOException {
        FileUtils.forceMkdir(new File(outputDir));
        sampleFile = new File(AFINCHParserTest.class.getClassLoader()
                .getResource("gov/usgs/cida/watersmart/parse/test/AFINCH.zip")
                .getFile());
    }
    
    @AfterClass
    public static void tearDownClass() throws IOException {
        FileUtils.deleteDirectory(new File(outputDir));
    }

    @Test
    public void testNetCDFFromAfinch() throws IOException, XMLStreamException {
        // TODO stand up dummy service that reads shapefiles
        RunMetadata runMeta = new RunMetadata(ModelType.AFINCH, "1", "test", "1", "1", "2012-07-10T00:00:00Z", 
            "Special", "comments", "jiwalker@usgs.gov", "http://cida-wiwsc-wsdev.er.usgs.gov:8081/geoserver/NWC/ows", 
            "NWC:Dense1", "site_no");
        ReturnInfo info = CreateDSGFromZip.create(sampleFile, runMeta);
        File ncFile = new File(new File(outputDir), info.filename);
        
        assertEquals(info.filename, "AFINCH.nc");
        
        NetcdfFile dataFile = null;
		try {
			dataFile = NetcdfFile.open(ncFile.getPath(), null);

			/**
			 * observation=6169
			 */	
			Variable record = dataFile.findVariable("record");
			int[] shape = record.getShape();
			
			if(shape.length > 0) {
				int shapeValue = shape[0];
				assertEquals(shapeValue, 6169);
			}
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
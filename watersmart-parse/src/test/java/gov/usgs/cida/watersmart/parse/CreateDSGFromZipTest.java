/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.watersmart.parse;

import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip.ReturnInfo;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.BeforeClass;

/**
 *
 * @author isuftin
 */
public class CreateDSGFromZipTest {
    
    private static final File outputDir = new File(System.getProperty("java.io.tmpdir") + File.separatorChar + "WaterSMART-Test-DeleteMe");
    private static List<File> sampleFiles = new ArrayList<File>();
    
    public CreateDSGFromZipTest() {
    }
    
    @BeforeClass
    public static void setupClass() throws IOException {
        FileUtils.forceMkdir(outputDir);
        
        sampleFiles.add(new File(outputDir.getPath() + File.separatorChar + "AFINCH.txt.zip"));
        
        for (File file : sampleFiles) {
            FileUtils.copyFile(new File(CreateDSGFromZipTest.class.getClassLoader().getResource("gov/usgs/cida/watersmart/netcdf/" + file.getName()).getFile()), file);
        }
        
    }
    
    @AfterClass
    public static void teardownClass() throws IOException {
      FileUtils.forceDelete(outputDir);
    }

    //@Test
    public void testCreate() throws Exception {
        System.out.println("create");
        File srcZip = null;
        RunMetadata runMeta = null;
        ReturnInfo expResult = null;
        ReturnInfo result = CreateDSGFromZip.create(srcZip, runMeta);
        assertEquals(expResult, result);
        fail("The test case is a prototype.");
    }

    @Test
    public void testVerifyZipUsingMacOSXZippedFile() throws Exception {
        System.out.println("VerifyZipUsingMacOSXZippedFile");
//        File zipFile = sampleFiles.get(0);
//        File result = CreateDSGFromZip.verifyZip(zipFile);
//        
//        ZipFile resultZip = new ZipFile(result);
//        
//        assertNotSame(zipFile, result);
//        
//        Boolean containsMacOSXFolder = false;
//        Enumeration<? extends ZipEntry> zipFileList = resultZip.entries();
//        while (zipFileList.hasMoreElements()) {
//            ZipEntry zipEntry = zipFileList.nextElement();
//            String zipEntryName = zipEntry.getName();
//            if (zipEntryName.contains("__MACOSX/")) {
//                containsMacOSXFolder = true;
//            }
//        }
//        
//        assertFalse(containsMacOSXFolder);
    }
}

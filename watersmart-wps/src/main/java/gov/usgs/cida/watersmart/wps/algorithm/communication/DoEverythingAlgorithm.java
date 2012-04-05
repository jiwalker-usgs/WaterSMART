package gov.usgs.cida.watersmart.wps.algorithm.communication;

import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip;
import gov.usgs.cida.watersmart.wps.completion.CheckProcessCompletion;
import java.io.File;
import org.n52.wps.algorithm.annotation.Algorithm;
import org.n52.wps.algorithm.annotation.ComplexDataInput;
import org.n52.wps.algorithm.annotation.LiteralDataInput;
import org.n52.wps.algorithm.annotation.LiteralDataOutput;
import org.n52.wps.algorithm.annotation.Process;
import org.n52.wps.server.AbstractAnnotatedAlgorithm;
import org.slf4j.LoggerFactory;

/**
 * Servlet implementation class EmailWhenFinishedServlet
 */
@Algorithm(
        version="1.0.0",
        title="WaterSMART Model Run Processing",
        abstrakt="WaterSMART Model Run Processing")
public class DoEverythingAlgorithm extends AbstractAnnotatedAlgorithm {

    static org.slf4j.Logger log = LoggerFactory.getLogger(DoEverythingAlgorithm.class);
    private static final long serialVersionUID = 1L;

    private File zipLocation;
    private RunMetadata uploadMeta;
    private String email;
    
    @LiteralDataInput(
            identifier="zip-location",
            title="Zip File Location",
            abstrakt="This algorithm must have access to the filesystem where the webapp places zip files")
    public void setZipLocation(String zipLocation) {
        this.zipLocation = new File(zipLocation);
    }
    
//    @ComplexDataInput(
//            identifier="run-metadata",
//            title="Metadata corresponding to model run",
//            abstrakt="User specified model run metadata to be included in resulting NetCDF file and ISO metadata",
//            binding=RunMetadataBinding.class)
//    public void setUploadMeta(RunMetadata uploadMeta) {
//        this.uploadMeta = uploadMeta;
//    }
    
    @LiteralDataInput(
            identifier="email",
            title="User notification email",
            abstrakt="Process will do some stuff and email user upon completion")
    public void setEmail(String email) {
        this.email = email;
    }
    
    @LiteralDataOutput(
            identifier="output",
            title="Result string",
            abstrakt="Generic string indicating result")
    public String getOutput() {
        return "ok";
    }
    
	@Process
    public void process() {
        
        try {
            String filename = CreateDSGFromZip.create(zipLocation, uploadMeta);
            
			CheckProcessCompletion processChecker = CheckProcessCompletion.getInstance();
            // kick off R process
			//processChecker.addProcessToCheck(wpsCheckPoint, emailAddr);
            
            // copy results to persistant location
            
            // move csw to module?
            //CSWTransactionHelper helper = new CSWTransactionHelper(meta, filename);
            //helper.insert();
            
            // send email with good or bad, if bad send to WaterSMART team
            // with all needed info
		}
		catch (Exception e) {
            addError(e.getMessage());
			log.error("Unable to add process completion check");
		}
	}
}
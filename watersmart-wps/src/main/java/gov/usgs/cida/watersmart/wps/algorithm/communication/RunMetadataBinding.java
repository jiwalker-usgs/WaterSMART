package gov.usgs.cida.watersmart.wps.algorithm.communication;

import gov.usgs.cida.watersmart.common.RunMetadata;
import org.n52.wps.io.data.IComplexData;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class RunMetadataBinding implements IComplexData {

    private RunMetadata meta;
    
    public RunMetadataBinding(RunMetadata payload) {
        this.meta = payload;
    }
    
    @Override
    public RunMetadata getPayload() {
        return meta;
    }

    @Override
    public Class getSupportedClass() {
        return RunMetadata.class;
    }
    
}

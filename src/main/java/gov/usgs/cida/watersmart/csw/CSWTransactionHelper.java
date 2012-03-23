package gov.usgs.cida.watersmart.csw;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.parse.RunMetadata;
import gov.usgs.cida.watersmart.util.JNDISingleton;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import javax.xml.stream.XMLStreamReader;
import javax.xml.stream.XMLStreamWriter;
import javax.xml.stream.util.StreamReaderDelegate;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CSWTransactionHelper {
    
    private static DynamicReadOnlyProperties props = JNDISingleton.getInstance();
    private final String TRANSACTION_HEADER = "<csw:Transaction service=\"CSW\" version=\"2.0.2\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:dc=\"http://www.purl.org/dc/elements/1.1/\">";
    private static final String XPATH_SUBSTITUTION_SCENARIO = "{scenario}";
    private static final String XPATH_SUBSTITUTION_MODEL_VERSION = "{modelVersion}";
    private static final String XPATH_SUBSTITUTION_RUN_IDENTIFIER = "{runIdentifier}";
    
    private RunMetadata metadataBean;
    
    private String updateXpathTemplate = "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification[@id='ncSOS']/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString[text()='" +
                               XPATH_SUBSTITUTION_SCENARIO + "']/../../gmd:edition/gco:CharacterString[text()='" + 
                               XPATH_SUBSTITUTION_MODEL_VERSION + "." + XPATH_SUBSTITUTION_RUN_IDENTIFIER + 
                               "']/../../../..";
    
    public CSWTransactionHelper(RunMetadata runMeta) {
        this.metadataBean = runMeta;
    }
    
    public void insert() {
        XMLStreamReader recordsCall = getRecordsCall();
        String sosRepo = props.getProperty("watersmart.sos.model.repo");
        if (sosRepo == null) {
            throw new RuntimeException("Record not inserted, must specify thredds location");
        }
        // pull out gmd:MD_Metadata
    }
    
    public void update(RunMetadata oldInfo, RunMetadata newInfo) {
        String updateXml = buildUpdateEnvelope(null, null);
    }
    
    public void delete(RunMetadata info) {
        
    }
    
    private XMLStreamReader getRecordsCall() {
        String identifier = this.metadataBean.getModelId();
        
        String cswGetRecordsSearch = buildSearchXML(identifier);
        
        // GET or POST to get a record, create XMLStream
        return new StreamReaderDelegate();
    }
    
    private void fullRecordTransaction(XMLStreamWriter record) {
        
    }
    
    private void updateFieldsTransaction(Map<String, String> propValueMap) {
        
    }

    private String buildInsertEnvelope(String record) {
        StringBuilder insertXml = new StringBuilder();
        
        insertXml.append(this.TRANSACTION_HEADER)
                .append("<csw:Insert>")
                .append(record)
                .append("</csw:Insert>")
                .append("</csw:Transaction>");
        
        return insertXml.toString();
    }
    
    private String buildDeleteEnvelope(String identifier) {
        StringBuilder deleteXml = new StringBuilder();
        
        deleteXml.append(this.TRANSACTION_HEADER)
                .append("<csw:Delete typeName=\"csw:Record\">")
                .append(this.buildIdentifierFilter(identifier))
                .append("</csw:Delete>")
                .append("</csw:Transaction>");
        return deleteXml.toString();
    }
    
    private String buildUpdateEnvelope(HashMap<String, String> propValueMap, String identifier) {
        StringBuilder updateXml = new StringBuilder();
        
        updateXml.append(this.TRANSACTION_HEADER)
                .append("<csw:Update>");
        
        Iterator<String> recordIter = propValueMap.keySet().iterator();
        while (recordIter.hasNext()) {
            String recordName = recordIter.next();
            updateXml.append("<csw:RecordProperty>")
                    .append("<csw:Name>").append(recordName).append("</csw:Name>")
                    .append("<csw:Value>").append(propValueMap.get(recordName)).append("</csw:Value>")
                    .append("</csw:RecordProperty>");
        }
                
        updateXml.append(this.buildIdentifierFilter(identifier))
                .append("</csw:Update>")
                .append("</csw:Transaction>");
        
        return updateXml.toString();
    }
    
    private String buildSearchXML(String identifier) {
        StringBuilder searchXml = new StringBuilder();

        searchXml.append("<csw:GetRecords xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" service=\"CSW\" version=\"2.0.2\" resultType=\"results\" outputSchema=\"http://www.isotc211.org/2005/gmd\">")
                .append("<csw:Query typeNames=\"csw:Record\">")
                .append("<csw:ElementSetName>full</csw:ElementSetName>")
                .append(this.buildIdentifierFilter(identifier))
                .append("</csw:Query>")
                .append("</csw:GetRecords>");
        
        return searchXml.toString();
    }
    
    private String buildIdentifierFilter(String identifier) {
        StringBuilder filterXml = new StringBuilder();
        
        filterXml.append("<csw:Constraint version=\"1.1.0\">")
                .append("<ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\">")
                .append("<ogc:PropertyIsEqualTo>")
                .append("<ogc:PropertyName>Identifier</ogc:PropertyName>")
                .append("<ogc:Literal>").append(identifier).append("</ogc:Literal>")
                .append("</ogc:PropertyIsEqualTo>")
                .append("</ogc:Filter>")
                .append("</csw:Constraint>");
        
        return filterXml.toString();
    }
    
}

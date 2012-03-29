package gov.usgs.cida.watersmart.csw;

import com.google.common.collect.Maps;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.iso.ISOServiceIdentification;
import gov.usgs.cida.watersmart.parse.RunMetadata;
import gov.usgs.cida.watersmart.util.JNDISingleton;
import java.io.*;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamWriter;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.NoConnectionReuseStrategy;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CSWTransactionHelper {
    
    private static final Logger LOG = LoggerFactory.getLogger(CSWTransactionHelper.class);
    
    private static DynamicReadOnlyProperties props = JNDISingleton.getInstance();
    private final String TRANSACTION_HEADER = "<csw:Transaction service=\"CSW\" version=\"2.0.2\" xmlns:csw=\"http://www.opengis.net/cat/csw/2.0.2\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:dc=\"http://www.purl.org/dc/elements/1.1/\">";
    private final String TRANSACTION_FOOTER = "</csw:Transaction>";
    

    
    public static final String NAMESPACE_GMD = "http://www.isotc211.org/2005/gmd";
    public static final String NAMESPACE_SRV = "http://www.isotc211.org/2005/srv";
    public static final String NAMESPACE_GCO = "http://www.isotc211.org/2005/gco";
    public static final String NAMESPACE_XLINK = "http://www.w3.org/1999/xlink";
    
    private RunMetadata metadataBean;
    private String ncFile;
    private GeonetworkSession cswSession;

    
    public CSWTransactionHelper(RunMetadata runMeta, String ncFile) {
        this.metadataBean = runMeta;
        this.ncFile = ncFile;
        this.cswSession = new GeonetworkSession();
    }
    
    public CSWTransactionHelper(RunMetadata runMeta) {
        this(runMeta, null);
    }
    
    public void insert() throws IOException, UnsupportedEncodingException, URISyntaxException, ParserConfigurationException, SAXException, TransformerException {
        Document getRecordsDoc = getRecordsCall();
        NodeList nodes = getRecordsDoc.getElementsByTagNameNS(NAMESPACE_GMD, "MD_Metadata");
        
        if (nodes.getLength() != 1) {
            throw new RuntimeException("Record not inserted, could not narrow search down to one record");
        }
        
        Node recordNode = nodes.item(0);
        // not complete, node will be lacking
        
        String sosRepo = props.getProperty("watersmart.sos.model.repo");
        if (sosRepo == null) {
            throw new RuntimeException("Record not inserted, must specify thredds location");
        }
        recordNode.appendChild(buildServiceIdentificationNode(sosRepo, getRecordsDoc));
        

        
        String insertXml = buildUpdateEnvelope(nodeToString(recordNode), metadataBean.getModelId());
        LOG.debug(insertXml);
        String postResponse = performCSWPost(insertXml);
        // check that it updated alright
    }
    
    public String update(RunMetadata oldInfo) throws IOException, URISyntaxException {
        Map<String, String> updateMap = this.metadataBean.getUpdateMap(oldInfo);
        
        String updateXml = buildUpdateEnvelope(updateMap, metadataBean.getModelId());
        LOG.debug(updateXml);
        String postResponse = performCSWPost(updateXml);
        return postResponse;
    }
    
    public void delete(RunMetadata info) {
        
    }
    
    private Document getRecordsCall() throws IOException, UnsupportedEncodingException, URISyntaxException, ParserConfigurationException, SAXException {
        String identifier = this.metadataBean.getModelId();
        
        String cswGetRecordsSearch = buildSearchXML(identifier);
        System.out.println(cswGetRecordsSearch);
        
        String response = performCSWPost(cswGetRecordsSearch);

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(response.getBytes()));
        
        return doc;
    }
    
    private String performCSWPost(String postData) throws IOException, UnsupportedEncodingException, URISyntaxException {
        cswSession.login();
        HttpPost post = new HttpPost(cswSession.GEONETWORK_CSW);
        post.setEntity(new StringEntity(postData, "application/xml", "UTF-8"));
        
        HttpContext localContext = new BasicHttpContext();
        DefaultHttpClient httpClient = new DefaultHttpClient();
        httpClient.setReuseStrategy(new NoConnectionReuseStrategy());
        localContext.setAttribute(ClientContext.COOKIE_STORE, cswSession.getCookieJar());
        HttpResponse methodResponse = null;
        try {
             methodResponse = httpClient.execute(post, localContext);
            if (methodResponse.getStatusLine().getStatusCode() != 200) {
                throw new IOException(
                        methodResponse.getStatusLine().getReasonPhrase());
            }
        }
        finally {
            httpClient.getConnectionManager().closeExpiredConnections();
            cswSession.logout();
            InputStream is = methodResponse.getEntity().getContent();
            String responseText = IOUtils.toString(is);
            LOG.debug(responseText);
            IOUtils.closeQuietly(is);
            return responseText;
        }
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
                .append(this.TRANSACTION_FOOTER);
        
        return insertXml.toString();
    }
    
    private String buildDeleteEnvelope(String identifier) {
        StringBuilder deleteXml = new StringBuilder();
        
        deleteXml.append(this.TRANSACTION_HEADER)
                .append("<csw:Delete typeName=\"csw:Record\">")
                .append(this.buildIdentifierFilter(identifier))
                .append("</csw:Delete>")
                .append(this.TRANSACTION_FOOTER);
        return deleteXml.toString();
    }
    
    private String buildUpdateEnvelope(Map<String, String> propValueMap, String identifier) {
        StringBuilder recordXml = new StringBuilder();
        Iterator<String> recordIter = propValueMap.keySet().iterator();
        while (recordIter.hasNext()) {
            String recordName = recordIter.next();
            recordXml.append("<csw:RecordProperty>")
                    .append("<csw:Name>").append(recordName).append("</csw:Name>")
                    .append("<csw:Value>").append(propValueMap.get(recordName)).append("</csw:Value>")
                    .append("</csw:RecordProperty>");
        }
        return buildUpdateEnvelope(recordXml.toString(), identifier);
    }
    
    private String buildUpdateEnvelope(String recordXml, String identifier) {
        StringBuilder updateXml = new StringBuilder();
        
        updateXml.append(this.TRANSACTION_HEADER)
                .append("<csw:Update>")
                .append(recordXml)
                .append(this.buildIdentifierFilter(identifier))
                .append("</csw:Update>")
                .append(this.TRANSACTION_FOOTER);
        
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
    
    private Node buildServiceIdentificationNode(String sosRepo, Document doc) {
        String sosEndpoint = sosRepo + "/" + metadataBean.getTypeString() + "/" + ncFile;
        
        ISOServiceIdentification iso = new ISOServiceIdentification(metadataBean, sosEndpoint, doc);
        Node idNode = iso.makeIdentificationInfo();
        return idNode;
    }
    
    private static String nodeToString(Node node) throws TransformerException {
        StringWriter writer = new StringWriter();
        Transformer t = TransformerFactory.newInstance().newTransformer();
        t.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        t.transform(new DOMSource(node), new StreamResult(writer));
        return writer.toString();
    }

}

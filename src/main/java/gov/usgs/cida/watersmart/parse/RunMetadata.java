package gov.usgs.cida.watersmart.parse;

import static gov.usgs.cida.watersmart.csw.CSWTransactionHelper.*;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip.ModelType;
import java.io.File;
import org.apache.commons.fileupload.FileItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tuckey.noclash.gzipfilter.org.apache.commons.lang.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class RunMetadata {
    
    private static final Logger LOG = LoggerFactory.getLogger(RunMetadata.class);
    private static final String UPLOAD_EXTENSION = ".zip";
    
    private ModelType type;
    private String modelId;
    private String name;
    private String modelVersion;
    private String runIdent;
    private String creationDate;
    private String scenario;
    private String comments;
    private String email;
    private String wfsUrl;
    private String layerName;
    private String commonAttribute;
    
    public static final String XPATH_LOCATOR_NAME = "/gmd:citation/gmd:CI_Citation/gmd:citedResponsibleParty/gmd:CI_ResponsibleParty/gmd:individualName/gco:CharacterString";
    // Edition is modelVersion and runIdentifier, need to be changed at same time
    public static final String XPATH_LOCATOR_EDITION = "/gmd:citation/gmd:CI_Citation/gmd:edition/gco:CharacterString";
    public static final String XPATH_LOCATOR_DATE = "/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime";
    public static final String XPATH_LOCATOR_SCENARIO = "/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString";
    public static final String XPATH_LOCATOR_EMAIL = "/gmd:citation/gmd:CI_Citation/gmd:citedResponsibleParty/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString";
    public static final String XPATH_LOCATOR_COMMENTS = "/gmd:abstract/gco:CharacterString";
    
    public RunMetadata() {
        type = null;
        modelId = null;
        name = null;
        modelVersion = null;
        runIdent = null;
        creationDate = null;
        scenario = null;
        comments = null;
        email = null;
        wfsUrl = null;
        layerName = null;
        commonAttribute = null;
    }
    
    public boolean isFilledIn() {
        return (type != null &&
                StringUtils.isNotBlank(modelId) &&
                StringUtils.isNotBlank(name) &&
                StringUtils.isNotBlank(modelVersion) &&
                StringUtils.isNotBlank(runIdent) &&
                StringUtils.isNotBlank(creationDate) &&
                StringUtils.isNotBlank(scenario) &&
                StringUtils.isNotBlank(email) &&
                StringUtils.isNotBlank(wfsUrl) &&
                StringUtils.isNotBlank(layerName) &&
                StringUtils.isNotBlank(commonAttribute) &&
                comments != null);
    }
    
    /**
     * Tries to set value corresponding to the item
     * @param item file form field item
     * @return true if item is set, false if not found
     */
    public boolean set(FileItem item) {
        String param = item.getFieldName().toLowerCase();
        if ("modeltype".equals(param)) {
            ModelType mt = ModelType.valueOf(item.getString());
            setType(mt);
            return true;
        }
        if ("modelid".equals(param)) {
            setModelId(item.getString());
            return true;
        }
        if("name".equals(param)) {
            setName(item.getString());
            return true;
        }
        if ("modelversion".equals(param)) {
            setModelVersion(item.getString());
            return true;
        }
        if ("runident".equals(param)) {
            setRunIdent(item.getString());
            return true;
        }
        if ("creationdate".equals(param)) {
            setCreationDate(item.getString());
            return true;
        }
        if ("scenario".equals(param)) {
            setScenario(item.getString());
            return true;
        }
        if ("comments".equals(param)) {
            setComments(item.getString());
            return true;
        }
        if ("email".equals(param)) {
            setEmail(item.getString());
            return true;
        }
        if ("wfsurl".equals(param)) {
            setWfsUrl(item.getString());
            return true;
        }
        if ("layer".equals(param)) {
            setLayerName(item.getString());
            return true;
        }
        if ("commonattr".equals(param)) {
            setCommonAttribute(item.getString());
            return true;
        }
        return false;
    }
    
    public File getFile(String dirPath) throws UnsupportedOperationException {
        if (!isFilledIn()) {
            String err = "Call to getFile before all fields are set";
            LOG.debug(err);
            throw new UnsupportedOperationException(err);
        }
        
        if (StringUtils.isNotBlank(dirPath)) {
            File dir = new File(dirPath);
            if (dir.exists() && dir.canWrite()) {
                String file = type.toString().toLowerCase() + "-" + scenario + "-" + modelVersion + "." + runIdent + UPLOAD_EXTENSION;
                return new File(dirPath + File.separator + file);
            }
        }
        // Did not return, must have failed
        String err = "Must pass in a valid directory in which to create file";
        LOG.debug(err);
        throw new IllegalArgumentException(err);
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRunIdent() {
        return runIdent;
    }

    public void setRunIdent(String runIdent) {
        this.runIdent = runIdent;
    }

    public String getScenario() {
        return scenario;
    }

    public void setScenario(String scenario) {
        this.scenario = scenario;
    }

    public ModelType getType() {
        return type;
    }
    
    public String getTypeString() {
        return getType().toString().toLowerCase();
    }

    public void setType(ModelType type) {
        this.type = type;
    }
    
    public String getCommonAttribute() {
        return commonAttribute;
    }

    public void setCommonAttribute(String commonAttr) {
        this.commonAttribute = commonAttr;
    }

    public String getLayerName() {
        return layerName;
    }

    public void setLayerName(String layerName) {
        this.layerName = layerName;
    }

    public String getWfsUrl() {
        return wfsUrl;
    }

    public void setWfsUrl(String wfsUrl) {
        this.wfsUrl = wfsUrl;
    }

    /**
     * @return the modelId
     */
    public String getModelId() {
        return modelId;
    }

    /**
     * @param modelId the modelId to set
     */
    public void setModelId(String modelId) {
        this.modelId = modelId;
    }
    
    public String getEditionString() {
        return modelVersion + "." + runIdent;
    }
    
    public Node makeIdentificationInfo(Document doc) {
        Node identificationInfo = doc.createElementNS(NAMESPACE_GMD, "identificationInfo");
        Element serviceIdentification = doc.createElementNS(NAMESPACE_SRV, "SV_ServiceIdentification");
        serviceIdentification.setAttribute("id", "ncSOS");
        serviceIdentification.appendChild(makeCitation(doc));
        serviceIdentification.appendChild(makeDate(doc));
        serviceIdentification.appendChild(makeAbstract(doc));
        serviceIdentification.appendChild(makeServiceType(doc));
        serviceIdentification.appendChild(makeCouplingType(doc));
        serviceIdentification.appendChild(makeContainsOperations(doc));
        serviceIdentification.appendChild(makeOperatesOn(doc));
        return identificationInfo;
    }
    
    private Node makeCitation(Document doc) {
        Element citation = doc.createElementNS(NAMESPACE_GMD, "citation");
        Element CIcitation = doc.createElementNS(NAMESPACE_GMD, "CI_Citation");
        Node title = makeTitle(doc);
        // Do other sections
        CIcitation.appendChild(title);
        citation.appendChild(CIcitation);
        return citation;
    }
    
    private Node makeTitle(Document doc) {
        Element title = doc.createElementNS(NAMESPACE_GMD, "title");
        Element charString = doc.createElementNS(NAMESPACE_GCO, "CharacterString");
        Text text = doc.createTextNode(getScenario());
        charString.appendChild(text);
        title.appendChild(charString);
        return title;
    }
    
    private Node makeDate(Document doc) {
        Element date = doc.createElementNS(NAMESPACE_GMD, "date");
        Element CIdate = doc.createElementNS(NAMESPACE_GMD, "CI_Date");
        Element innerDate = doc.createElementNS(NAMESPACE_GMD, "date");
        Element dateTime = doc.createElementNS(NAMESPACE_GCO, "DateTime");
        Text text = doc.createTextNode(getCreationDate());
        dateTime.appendChild(text);
        innerDate.appendChild(dateTime);
        Element dateType = doc.createElementNS(NAMESPACE_GMD, "dateType");
        Element CIDateTypeCode = doc.createElementNS(NAMESPACE_GMD, "CI_DateTypeCode");
        CIDateTypeCode.setAttribute("codeListValue", "revision");
        CIDateTypeCode.setAttribute("codeList", "http://www.isotc211.org/2005/resources/codeList.xml#CI_DateTypeCode");
        dateType.appendChild(CIDateTypeCode);
        CIdate.appendChild(innerDate);
        CIdate.appendChild(CIDateTypeCode);
        date.appendChild(CIdate);
        return date;
    }
    
    private Node makeEdition(Document doc) {
        Element edition = doc.createElementNS(NAMESPACE_GMD, "edition");
        Element charString = doc.createElementNS(NAMESPACE_GCO, "CharacterString");
        Text text = doc.createTextNode(getEditionString());
        charString.appendChild(text);
        edition.appendChild(charString);
        return edition;
    }
    
    private Node makeAbstract(Document doc) {
        return null;
    }
    
    private Node makeServiceType(Document doc) {
        return null;
    }
    
    private Node makeCouplingType(Document doc) {
        return null;
    }
    
    private Node makeContainsOperations(Document doc) {
        return null;
    }
    
    private Node makeOperatesOn(Document doc) {
        return null;
    }
}

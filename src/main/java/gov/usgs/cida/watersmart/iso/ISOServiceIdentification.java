package gov.usgs.cida.watersmart.iso;

import static gov.usgs.cida.watersmart.csw.CSWTransactionHelper.*;
import gov.usgs.cida.watersmart.parse.RunMetadata;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ISOServiceIdentification {
    
    private RunMetadata metadata;
    private String sosEndpoint;
    private Document document;
    
    public ISOServiceIdentification(RunMetadata meta, String sosEndpoint, Document doc) {
        this.metadata = meta;
        this.sosEndpoint = sosEndpoint;
        this.document = doc;
    }
    
    public Node makeIdentificationInfo() {
        Node identificationInfo = document.createElementNS(NAMESPACE_GMD, "identificationInfo");
        Element serviceIdentification = document.createElementNS(NAMESPACE_SRV, "SV_ServiceIdentification");
        serviceIdentification.setAttribute("id", "ncSOS");
        serviceIdentification.appendChild(makeCitation());
        serviceIdentification.appendChild(makeAbstract());
        serviceIdentification.appendChild(makeServiceType());
        serviceIdentification.appendChild(makeContainsOperations());
        serviceIdentification.appendChild(makeCouplingType());
        serviceIdentification.appendChild(makeOperatesOn());
        identificationInfo.appendChild(serviceIdentification);
        return identificationInfo;
    }
    
    private Node makeCitation() {
        Element citation = document.createElementNS(NAMESPACE_GMD, "citation");
        Element ciCitation = document.createElementNS(NAMESPACE_GMD, "CI_Citation");
        Node title = makeTitle();
        Node date = makeDate();
        Node edition = makeEdition();
        Node crp = makeCitedResponsibleParty();
        Node presForm = makePresentationForm();
        // Do other sections
        ciCitation.appendChild(title);
        ciCitation.appendChild(date);
        ciCitation.appendChild(edition);
        ciCitation.appendChild(crp);
        ciCitation.appendChild(presForm);
        citation.appendChild(ciCitation);
        return citation;
    }
    
    private Node makeTitle() {
        Element title = document.createElementNS(NAMESPACE_GMD, "title");
        Node charString = makeCharacterString(metadata.getScenario());
        title.appendChild(charString);
        return title;
    }
    
    private Node makeDate() {
        Element date = document.createElementNS(NAMESPACE_GMD, "date");
        Element CIdate = document.createElementNS(NAMESPACE_GMD, "CI_Date");
        Element innerDate = document.createElementNS(NAMESPACE_GMD, "date");
        Element dateTime = document.createElementNS(NAMESPACE_GCO, "DateTime");
        Text text = document.createTextNode(metadata.getCreationDate());
        dateTime.appendChild(text);
        innerDate.appendChild(dateTime);
        Element dateType = document.createElementNS(NAMESPACE_GMD, "dateType");
        Element CIDateTypeCode = document.createElementNS(NAMESPACE_GMD, "CI_DateTypeCode");
        CIDateTypeCode.setAttribute("codeListValue", "revision");
        CIDateTypeCode.setAttribute("codeList", "http://www.isotc211.org/2005/resources/codeList.xml#CI_DateTypeCode");
        dateType.appendChild(CIDateTypeCode);
        CIdate.appendChild(innerDate);
        CIdate.appendChild(CIDateTypeCode);
        date.appendChild(CIdate);
        return date;
    }
    
    private Node makeEdition() {
        Element edition = document.createElementNS(NAMESPACE_GMD, "edition");
        Node charString = makeCharacterString(metadata.getEditionString());
        edition.appendChild(charString);
        return edition;
    }
    
    private Node makeCitedResponsibleParty() {
        Element citedResponsibleParty = document.createElementNS(NAMESPACE_GMD, "citedResponsibleParty");
        Element ciResponsibleParty = document.createElementNS(NAMESPACE_GMD, "CI_ResponsibleParty");
        Node individualName = makeIndividualName();
        Node contactInfo = makeContactInfo();
        Node role = makeRole();
        ciResponsibleParty.appendChild(individualName);
        ciResponsibleParty.appendChild(contactInfo);
        ciResponsibleParty.appendChild(role);
        citedResponsibleParty.appendChild(ciResponsibleParty);
        return citedResponsibleParty;
    }
    
    private Node makeIndividualName() {
        Element individualName = document.createElementNS(NAMESPACE_GMD, "individualName");
        Node charString = makeCharacterString(metadata.getName());
        individualName.appendChild(charString);
        return individualName;
    }
    
    private Node makeContactInfo() {
        Element contactInfo = document.createElementNS(NAMESPACE_GMD, "contactInfo");
        Element ciContact = document.createElementNS(NAMESPACE_GMD, "CI_Contact");
        // TODO phone number if available
        Node address = makeAddress();
        ciContact.appendChild(address);
        contactInfo.appendChild(ciContact);
        return contactInfo;
    }
    
    private Node makeAddress() {
        Element address = document.createElementNS(NAMESPACE_GMD, "address");
        Element ciAddress = document.createElementNS(NAMESPACE_GMD, "CI_Address");
        Node email = makeEmail();
        // should do other address types
        ciAddress.appendChild(email);
        address.appendChild(ciAddress);
        return address;
    }
    
    private Node makeEmail() {
        Element email = document.createElementNS(NAMESPACE_GMD, "electronicMailAddress");
        Node charString = makeCharacterString(metadata.getEmail());
        email.appendChild(charString);
        return email;
    }
    
    private Node makeRole() {
        Element role = document.createElementNS(NAMESPACE_GMD, "role");
        Element ciRoleCode = document.createElementNS(NAMESPACE_GMD, "CI_RoleCode");
        ciRoleCode.setAttribute("codeList", "http://www.isotc211.org/2005/resources/codeList.xml#CI_RoleCode");
        ciRoleCode.setAttribute("codeListValue", "processor");
        role.appendChild(ciRoleCode);
        return role;
    }
    
    private Node makePresentationForm() {
        Element presForm = document.createElementNS(NAMESPACE_GMD, "presentationForm");
        Element ciPresFormCode = document.createElementNS(NAMESPACE_GMD, "CI_PresentationFormCode");
        ciPresFormCode.setAttribute("codeList", "http://www.isotc211.org/2005/resources/codeList.xml#CI_PresentationFormCode");
        ciPresFormCode.setAttribute("codeListValue", "modelDigital");
        presForm.appendChild(ciPresFormCode);
        return presForm;
    }
    
    private Node makeAbstract() {
        Element abstrakt = document.createElementNS(NAMESPACE_GMD, "abstract");
        Node charString = makeCharacterString(metadata.getComments());
        abstrakt.appendChild(charString);
        return abstrakt;
    }
    
    private Node makeServiceType() {
        Element serviceType = document.createElementNS(NAMESPACE_SRV, "serviceType");
        Element localName = document.createElementNS(NAMESPACE_GCO, "LocalName");
        Text text = document.createTextNode("OGC:SOS");
        localName.appendChild(text);
        serviceType.appendChild(localName);
        return serviceType;
    }
    
    private Node makeCouplingType() {
        Element couplingType = document.createElementNS(NAMESPACE_SRV, "couplingType");
        Element svCouplingType = document.createElementNS(NAMESPACE_SRV, "SV_CouplingType");
        svCouplingType.setAttribute("codeList", "http://www.isotc211.org/2005/iso19119/resources/Codelist/gmxCodelists.xml#SV_CouplingType");
        svCouplingType.setAttribute("codeListValue", "mixed");
        couplingType.appendChild(svCouplingType);
        return couplingType;
    }
    
    private Node makeContainsOperations() {
        Element containsOperations = document.createElementNS(NAMESPACE_SRV, "containsOperations");
        Element svOperationMetadata = document.createElementNS(NAMESPACE_SRV, "SV_OperationMetadata");
        Element operationName = document.createElementNS(NAMESPACE_SRV, "operationName");
        Node charString = makeCharacterString("GetOperation");
        operationName.appendChild(charString);
        // skipping DCP
        Element connectPoint = document.createElementNS(NAMESPACE_SRV, "connectPoint");
        Element ciOnlineResource = document.createElementNS(NAMESPACE_GMD, "CI_OnlineResource");
        Element linkage = document.createElementNS(NAMESPACE_GMD, "linkage");
        Element url = document.createElementNS(NAMESPACE_GMD, "URL");
        Text text = document.createTextNode(sosEndpoint);
        url.appendChild(text);
        linkage.appendChild(url);
        Element name = document.createElementNS(NAMESPACE_GMD, "name");
        Node charString2 = makeCharacterString(metadata.getFileName());
        name.appendChild(charString2);
        ciOnlineResource.appendChild(linkage);
        ciOnlineResource.appendChild(name);
        connectPoint.appendChild(ciOnlineResource);
        svOperationMetadata.appendChild(operationName);
        svOperationMetadata.appendChild(connectPoint);
        containsOperations.appendChild(svOperationMetadata);
        return containsOperations;
    }
    
    private Node makeOperatesOn() {
        Element operatesOn = document.createElementNS(NAMESPACE_SRV, "operatesOn");
        operatesOn.setAttributeNS(NAMESPACE_XLINK, "href", "#DataIdentification");
        return operatesOn;
    }
    
    private Node makeCharacterString(String str) {
        Element charString = document.createElementNS(NAMESPACE_GCO, "CharacterString");
        Text text = document.createTextNode(str);
        charString.appendChild(text);
        return charString;
    }
    
}

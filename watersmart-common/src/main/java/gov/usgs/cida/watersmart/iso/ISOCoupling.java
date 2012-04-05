package gov.usgs.cida.watersmart.iso;

import static gov.usgs.cida.watersmart.csw.CSWTransactionHelper.NAMESPACE_GCO;
import static gov.usgs.cida.watersmart.csw.CSWTransactionHelper.NAMESPACE_SRV;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ISOCoupling {
    
    // should do srv:coupledResource insert here
    private String algIdentifier;
    private String url;
    private Document document;
    
    public ISOCoupling(Document doc, String algIdentifier, String url) {
        this.document = doc;
        this.algIdentifier = algIdentifier;
        this.url = url;
    }
    
    public Node makeCoupledResource() {
        Element coupledResource = document.createElementNS(NAMESPACE_SRV, "srv:coupledResource");
        Element svCoupledResource = document.createElementNS(NAMESPACE_SRV, "srv:SV_CoupledResource");
        Element operationName = document.createElementNS(NAMESPACE_SRV, "srv:operationName");
        Node charString = makeCharacterString(algIdentifier);
        operationName.appendChild(charString);
        
        Element identifier = document.createElementNS(NAMESPACE_SRV, "srv:identifier");
        Node charString2 = makeCharacterString(url);
        identifier.appendChild(charString2);
        svCoupledResource.appendChild(operationName);
        svCoupledResource.appendChild(identifier);
        coupledResource.appendChild(svCoupledResource);
        
        return coupledResource;
    }
    
    private Node makeCharacterString(String str) {
        Element charString = document.createElementNS(NAMESPACE_GCO, "gco:CharacterString");
        Text text = document.createTextNode(str);
        charString.appendChild(text);
        return charString;
    }
}

package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.watersmart.config.DynamicReadOnlyProperties;
import java.io.IOException;
import java.util.*;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

/**
 * Build a list of stations for a model run / netcdf file
 * Have a way to look up the index of stations
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class StationLookup {
    
    private static Logger LOG = LoggerFactory.getLogger(StationLookup.class);
    // Read wfs endpoint from JNDI
    private static DynamicReadOnlyProperties props = DynamicReadOnlyProperties.initProps();
    
    // Call to get the list of all stations, create 
    public static List<String> getStationList() {
        List<String> stations = new LinkedList<String>();

        try {
            String wfsUrl = props.getProperty("watersmart.stations.url", "http://igsarm-cida-javadev1.er.usgs.gov:8081/geoserver/watersmart/ows");
            String typeName = props.getProperty("watersmart.stations.url", "watersmart:se_sites");
            String url = wfsUrl + "?service=WFS&version=1.1.0&request=GetFeature&typeName=" + typeName + "&outputFormat=text/xml; subtype=gml/3.2";
            String primaryAtt = props.getProperty("watersmart.stations.primaryAttribute", "site_no");

            // May want to switch to StAX
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            Document doc = dbf.newDocumentBuilder().parse(url);

            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            xpath.setNamespaceContext(new GetFeatureNamespaceContext());
            XPathExpression expr = xpath.compile("/wfs:FeatureCollection/wfs:member/" + typeName + "/watersmart:" +
                                                 primaryAtt);
            NodeList nodes = (NodeList)expr.evaluate(doc, XPathConstants.NODESET);

            for (int i=0; i<nodes.getLength(); i++) {
                Node item = nodes.item(i);
                stations.add(item.getTextContent());
            }
        }
        catch (SAXException ex) {
            LOG.debug("Problem reading XML", ex);
        }
        catch (XPathExpressionException ex) {
            LOG.debug("XPath is broken", ex);
        }
        catch (IOException ex) {
            LOG.debug("IOException from somewhere", ex);
        }
        catch (ParserConfigurationException ex) {
            LOG.debug("Parser fail", ex);
        }
        return stations;
    }
    
    public static int lookup(String station) {
        try {
            String wfsUrl = props.getProperty("watersmart.stations.url", "http://igsarm-cida-javadev1.er.usgs.gov:8081/geoserver/watersmart/ows");
            String typeName = props.getProperty("watersmart.stations.url", "watersmart:se_sites");
            String primaryAtt = props.getProperty("watersmart.stations.primaryAttribute", "site_no");
            String url = wfsUrl + "?service=WFS&version=1.1.0&request=GetFeature&typeName=" + 
                         typeName + "&outputFormat=text/xml; subtype=gml/3.2&CQL_FILTER=" +
                         primaryAtt + "%20like%20'%25" + station + "'";
            
            // May want to switch to StAX
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            Document doc = dbf.newDocumentBuilder().parse(url);

            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            xpath.setNamespaceContext(new GetFeatureNamespaceContext());
            XPathExpression expr = xpath.compile("/wfs:FeatureCollection/wfs:member/" + typeName + "/@gml:id");
            String attr = (String)expr.evaluate(doc, XPathConstants.STRING);
            String[] split = attr.split("\\.");
            if (split.length == 2) {
                // gml is one-indexed
                int index = Integer.parseInt(split[1]) - 1;
                return index;
            }
        }
        catch (XPathExpressionException ex) {
            LOG.debug("XPath is broke", ex);
        }
        catch (SAXException ex) {
            LOG.debug("XML parsing failed", ex);
        }
        catch (IOException ex) {
            LOG.debug("I/O Exception reading xml", ex);
        }
        catch (ParserConfigurationException ex) {
            LOG.debug("parser unable to parse", ex);
        }
        return -1;
    }
    
    private static class GetFeatureNamespaceContext implements NamespaceContext {

        public final static Map<String, String> namespaceMap;

        static {
            namespaceMap = new HashMap<String, String>();
            namespaceMap.put("", "http://www.opengis.net/wfs/2.0");
            namespaceMap.put("wfs", "http://www.opengis.net/wfs/2.0");
            namespaceMap.put("ows", "http://www.opengis.net/ows");
            namespaceMap.put("gml", "http://www.opengis.net/gml/3.2");
            namespaceMap.put("ogc", "http://www.opengis.net/ogc");
            namespaceMap.put("xlink", "http://www.w3.org/1999/xlink");
            namespaceMap.put("watersmart", "gov.usgs.cida.watersmart");
        }

        @Override
        public String getNamespaceURI(String prefix) {
            if (prefix == null) {
                throw new NullPointerException("prefix is null");
            }
            String namespaceURI = namespaceMap.get(prefix);

            return namespaceURI;
        }

        @Override
        public String getPrefix(String namespaceURI) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Iterator<String> getPrefixes(String namespaceURI) {
            throw new UnsupportedOperationException();
        }
    }
}

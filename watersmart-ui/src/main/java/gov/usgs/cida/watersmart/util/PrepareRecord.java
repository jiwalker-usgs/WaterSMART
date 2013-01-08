package gov.usgs.cida.watersmart.util;

import com.google.common.collect.Maps;
import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.csw.CSWTransactionHelper;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URISyntaxException;
import java.util.Enumeration;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

/**
 * @author isuftin
 */
public class PrepareRecord extends HttpServlet {

    static final org.slf4j.Logger log = LoggerFactory.getLogger(PrepareRecord.class);

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        RunMetadata meta = new RunMetadata();
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String elementName = parameterNames.nextElement();
            String elementValue = request.getParameter(elementName);
            meta.set(elementName.toLowerCase(), elementValue);
        }

        Map<String, String> wpsOutputMap = Maps.newHashMap();
        wpsOutputMap.put(WPSImpl.stats_compare, "");

        CSWTransactionHelper cswTransactionHelper = new CSWTransactionHelper(RunMetadata.getInstance(meta.toKeyValueMap()), null, wpsOutputMap);
        String addRecordResponse;
        try {
            addRecordResponse = cswTransactionHelper.addServiceIdentification();
        } catch (Exception ex) {
            String responseText = "{success: false, message: " + ex.getMessage() + "}";
            sendResponse(response, responseText);
            return;
        }
        if (StringUtils.isNotBlank(addRecordResponse) && addRecordResponse.contains("<csw:totalUpdated>1</csw:totalUpdated>")) {
            
        }
        String responseText = "{success: false, message: 'still in dev'}";
        sendResponse(response, responseText);
    }

    //TODO- Refactor this into a util method somewhere
    public static void sendResponse(HttpServletResponse response, String text) {

        response.setContentType("text/html");

        try {
            Writer writer = response.getWriter();
            writer.write(text);
            writer.close();
        } catch (IOException ex) {
            // LOG
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}

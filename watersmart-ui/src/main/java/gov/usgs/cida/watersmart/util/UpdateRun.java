package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.watersmart.common.ModelType;
import gov.usgs.cida.watersmart.common.RunMetadata;
import gov.usgs.cida.watersmart.csw.CSWTransactionHelper;
import java.io.IOException;
import java.io.Writer;
import java.net.URISyntaxException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class UpdateRun extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(UpdateRun.class);

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        LOG.debug("Received new update request");
        
        String modelerName = request.getParameter("name");
        String originalModelerName = request.getParameter("originalName");
        String modelId = request.getParameter("modelId");
        String modelType = request.getParameter("modeltype");
        String modelVersion = request.getParameter("version");
        String originalModelVersion = request.getParameter("originalModelVersion");
        String runIdent = request.getParameter("runIdent");
        String originalRunIdent = request.getParameter("originalRunIdent");
        String runDate = request.getParameter("creationDate");
        String originalRunDate = request.getParameter("originalCreationDate");
        String scenario = request.getParameter("scenario");
        String originalScenario = request.getParameter("originalScenario");
        String comments = request.getParameter("comments");
        String originalComments = request.getParameter("originalComments");
        String email = request.getParameter("email");
        String wfsUrl = request.getParameter("wfsUrl");
        String layer = request.getParameter("layer");
        String commonAttr = request.getParameter("commonAttr");
        Boolean updateAsBest = "on".equalsIgnoreCase(request.getParameter("markAsBest")) ? Boolean.TRUE : Boolean.FALSE;
        Boolean rerun = Boolean.parseBoolean(request.getParameter("rerun")); // If this is true, we only re-run the R processing 
        String responseText;
        RunMetadata newRunMetadata;
        RunMetadata originalRunMetadata;
        
        ModelType modelTypeEnum = null;
            if ("prms".equals(modelType.toLowerCase())) modelTypeEnum = ModelType.PRMS;
            if ("afinch".equals(modelType.toLowerCase())) modelTypeEnum = ModelType.AFINCH;
            if ("waters".equals(modelType.toLowerCase())) modelTypeEnum = ModelType.WATERS;
            if ("sye".equals(modelType.toLowerCase())) modelTypeEnum = ModelType.SYE;
            
        if (rerun) {
            // shortcut the process for now 
            if (true) {
                responseText = "{success: true, msg: 'The run is processing'}";
                response.setContentType("application/json");
                response.setCharacterEncoding("utf-8");

                try {
                    Writer writer = response.getWriter();
                    writer.write(responseText);
                    writer.close();
                } catch (IOException ex) {
                    // LOG
                }
                return;
            }
   
            // TODO- Create the run metadata from the original run
            originalRunMetadata = new RunMetadata(
                modelTypeEnum,
                modelId,
                modelerName,
                modelVersion,
                runIdent,
                runDate,
                scenario,
                comments,
                email,
                wfsUrl,
                layer,
                commonAttr,
                updateAsBest);
            
            
            // TODO- Re-run R-Process
                   // 4. Run the compare stats using the R-WPS package
            try {
    //            compReq = WPSImpl.createCompareStatsRequest(sosEndpoint, info.stations, info.properties);
    //            String algorithmOutput = runNamedAlgorithm("compare", compReq, uuid, metaObj);
    //            wpsOutputMap.put(WPSImpl.stats_compare, algorithmOutput);
            } catch (Exception ex) {
//                log.error("Failed to run WPS algorithm", ex);
//                sendFailedEmail(ex, email);
//                return;
            }
    //
    //        // 5. Add results from WPS process to CSW record
    //        if (wpsOutputMap.get(WPSImpl.stats_compare) != null) {
    //            rStatsSuccessful = true;
    //            helper = new CSWTransactionHelper(metaObj, sosEndpoint, wpsOutputMap);
    //            try {
    //                cswResponse = helper.updateRunMetadata(metaObj);
    //                cswTransSuccessful = cswResponse != null;
    //                sendCompleteEmail(wpsOutputMap, email);
    //            } catch (IOException ex) {
    //                log.error("Failed to perform CSW update", ex);
    //                sendFailedEmail(ex, email);
    //            } catch (URISyntaxException ex) {
    //                log.error("Failed to perform CSW update,", ex);
    //                sendFailedEmail(ex, email);
    //            }
    //        } else {
    //            log.error("Failed to run WPS algorithm");
    //            sendFailedEmail(new Exception("Failed to run WPS algorithm"), email);
    //        }
            
            // Create the updated model run. Everything should remain the same 
            // except the date unless there was no R process run previously
            newRunMetadata = new RunMetadata(
                    modelTypeEnum,
                    modelId,
                    modelerName,
                    modelVersion,
                    runIdent,
                    runDate, // set a new date
                    scenario,
                    comments,
                    email,
                    wfsUrl,
                    layer,
                    commonAttr,
                    updateAsBest);
            
        } else {
            newRunMetadata = new RunMetadata(
                    modelTypeEnum,
                    modelId,
                    modelerName,
                    modelVersion,
                    runIdent,
                    runDate,
                    scenario,
                    comments,
                    email,
                    wfsUrl,
                    layer,
                    commonAttr,
                    updateAsBest
            );

            originalRunMetadata = new RunMetadata(
                    modelTypeEnum,
                    modelId,
                    originalModelerName,
                    originalModelVersion,
                    originalRunIdent,
                    originalRunDate,
                    originalScenario,
                    originalComments,
                    email, 
                    wfsUrl,
                    layer,
                    commonAttr
            );
            
        }
        
        CSWTransactionHelper helper = new CSWTransactionHelper(newRunMetadata);
        try {
            String results = helper.updateRunMetadata(originalRunMetadata);
            // TODO- parse xml, make sure stuff happened alright, if so don't say success
            responseText = "{success: true, msg: 'The record has been updated'}";
        }
        catch (IOException ex) {
            responseText = "{success: false, msg: '" + ex.getMessage() + "'}";
        }
        catch (URISyntaxException ex) {
            responseText = "{success: false, msg: '" + ex.getMessage() + "'}";
        }
        
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");

        try {
            Writer writer = response.getWriter();
            writer.write(responseText);
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

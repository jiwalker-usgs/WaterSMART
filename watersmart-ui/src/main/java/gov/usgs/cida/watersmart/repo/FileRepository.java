package gov.usgs.cida.watersmart.repo;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.common.JNDISingleton;
import java.io.*;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class FileRepository extends HttpServlet {

    private static final Logger LOG = LoggerFactory.getLogger(FileRepository.class);
    private static final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
    private static final String filePath = props.getProperty("watersmart.file.location")
            + props.getProperty("watersmart.file.location.wps.repository");
    
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
    protected void processRequest(HttpServletRequest request,
                                  HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/plain;charset=UTF-8");
        String file = request.getPathInfo();
        File repoFile = new File(filePath + file);
        
        if (!repoFile.exists() || !repoFile.canRead()) {
            LOG.info("User requested file which does not exist. File: " + repoFile.getPath());
            response.sendError(404);
            return;
        }
        
        LOG.debug("User is requesting file: " + repoFile.getPath());
        PrintWriter out = response.getWriter();
        BufferedReader bufIn = new BufferedReader(new FileReader(repoFile));
        String line = null;
        try {
            while (null != (line = bufIn.readLine())) {
                out.println(line);
            }
        }
        finally {            
            IOUtils.closeQuietly(bufIn);
            IOUtils.closeQuietly(out);
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
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
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
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
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

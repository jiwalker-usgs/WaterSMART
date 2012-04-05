package gov.usgs.cida.watersmart.proxy;

import gov.usgs.cida.watersmart.csw.GeonetworkSession;
import gov.usgs.service.OWSProxyServletX;
import java.io.IOException;
import java.net.URISyntaxException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.protocol.ClientContext;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class GeonetworkProxy extends OWSProxyServletX {

    private static final Logger LOGGER = LoggerFactory.getLogger(GeonetworkProxy.class);
    private static GeonetworkSession geonetworkSession;
    
    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        geonetworkSession = new GeonetworkSession();
        LOGGER.debug("Geonetwork proxy initialized");
    }

    @Override
    public void destroy() {
        try {
            geonetworkSession.logout();
        }
        catch (IOException ioe) {
            LOGGER.debug("Error logging out of geonetwork", ioe);
        }
        catch (URISyntaxException ex) {
            LOGGER.debug("Exception in logout URI", ex);
        }
        HttpClient httpClient = getHttpClient(null);
        if (null != httpClient) {
            ClientConnectionManager conMgr = httpClient.getConnectionManager();
            if (null != conMgr) {
                conMgr.shutdown();
            }
        }
        geonetworkSession.clearCookieJar();
        LOGGER.debug("Servlet destroy complete");
    }

    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void service(HttpServletRequest request,
                           HttpServletResponse response)
            throws ServletException, IOException {

        try {
            if(!geonetworkSession.isExistingCookie()) {
                geonetworkSession.login();
            }
            HttpUriRequest serverRequest = generateServerRequest(request);
            handleServerRequest(request, response, serverRequest);
        }
        catch (ProxyException ex) {
            LOGGER.debug("Parent proxy class threw exception", ex);
            // should probably throw something to front end
        }
        catch (URISyntaxException ex) {
            LOGGER.debug("FAIL!", ex);
        }
    }

    @Override
    protected void handleServerRequest(HttpServletRequest clientRequest,
                                       HttpServletResponse clientResponse,
                                       HttpUriRequest serverRequest) throws
            ProxyException {
        HttpClient serverClient = getHttpClient(clientRequest);
        try {
            HttpContext localContext = new BasicHttpContext();
            localContext.setAttribute(ClientContext.COOKIE_STORE, geonetworkSession.getCookieJar());
            HttpResponse methodReponse = serverClient.execute(serverRequest,
                                                              localContext);
            handleServerResponse(clientRequest, clientResponse, methodReponse);
        }
        catch (ClientProtocolException e) {
            throw new ProxyException("Client protocol error", e);
        }
        catch (IOException e) {
            throw new ProxyException("I/O error on server request", e);
        }

    }

    @Override
    protected String getServerRequestURIAsString(
            HttpServletRequest clientrequest) {
        return geonetworkSession.GEONETWORK_CSW;
    }
}

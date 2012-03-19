package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip;
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip.ModelType;
import java.io.*;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.IOUtils;

public class Upload extends HttpServlet {

    private static DynamicReadOnlyProperties props = null;

    @Override
    public void init() throws ServletException {
        super.init();
        props = JNDISingleton.getInstance();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException {

        int maxFileSize = Integer.parseInt(props.getProperty("watersmart.file.maxsize"));
        int fileSize = Integer.parseInt(request.getHeader("Content-Length"));
        if (fileSize > maxFileSize) {
            sendErrorResponse(response, "Upload exceeds max file size of " + maxFileSize + " bytes");
            return;
        }

        // filename is parameter passed by our javascript uploader
        //String filename = request.getParameter("filename");
        String tempDir = props.getProperty("watersmart.file.location");
        File dirFile = new File(tempDir);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }

        File destinationFile = null;

        // Handle form-based upload (from IE)
        if (ServletFileUpload.isMultipartContent(request)) {
            FileItemFactory factory = new DiskFileItemFactory();
            ServletFileUpload upload = new ServletFileUpload(factory);

            // Parse the request
            FileItemIterator iter;
            try {
                List<FileItem> itemList = upload.parseRequest(request);
                ModelType modelType = null;
                String filename = null;
                InputStream filein = null;
                String wfsUrl = null;
                String layer = null;
                String commonAttr = null;
                for (FileItem item : itemList) {
                    String name = item.getFieldName();
                    // filename must come first
                    if (item.isFormField() && "modeltype".equals(item.getFieldName().toLowerCase())) {
                        modelType = ModelType.valueOf(item.getString());
                    }
                    else if (item.isFormField() && "wfsurl".equals(item.getFieldName().toLowerCase())) {
                        wfsUrl = item.getString();
                    }
                    else if (item.isFormField() && "layer".equals(item.getFieldName().toLowerCase())) {
                        layer = item.getString();
                    }
                    else if (item.isFormField() && "commonattr".equals(item.getFieldName().toLowerCase())) {
                        commonAttr = item.getString();
                    }
                    else if (!item.isFormField()) {
                        filename = item.getName();
                        filein = item.getInputStream();
                    }
                }
                if (modelType != null &&
                    filein != null &&
                    filename != null &&
                    wfsUrl != null &&
                    layer != null &&
                    commonAttr != null) {
                    destinationFile = new File(tempDir + File.separator + filename);
                    saveFileFromRequest(filein, destinationFile);
                    CreateDSGFromZip.create(destinationFile, modelType, wfsUrl, layer, commonAttr);
                } else {
                    throw new Exception("Must provide all required parameters: model, file, wfs URL, layer name, common attribute");
                }
            } catch (Exception ex) {
                // pass exception text along?
                sendErrorResponse(response, "Unable to upload file");
                return;
            }
        } else {
            // Handle octet streams (from standards browsers)
            //String filename = request.getParameter("filename");
//            destinationFile = new File(tempDir + File.separator + filename);
//            try {
//                saveFileFromRequest(request.getInputStream(), destinationFile);
//                CreateDSGFromZip.create(destinationFile);
//            } catch (IOException ex) {
//                // LOG
//            }
        }

        String responseText = null;
        responseText = "{success: true, file: '" + destinationFile.getName() + "'}";
        // can do post processing stuff here
        sendResponse(response, responseText);
    }

    public static void sendErrorResponse(HttpServletResponse response, String text) {
        sendResponse(response, "{success: false, message: '" + text + "'}");
    }

    public static void sendResponse(HttpServletResponse response, String text) {

        response.setContentType("text/html");
        //response.setCharacterEncoding("utf-8");

        try {
            Writer writer = response.getWriter();
            writer.write(text);
            writer.close();
        } catch (IOException ex) {
            // LOG
        }
    }

    private void saveFileFromRequest(InputStream is, File destinationFile) throws IOException {
        FileOutputStream os = null;
        try {
            os = new FileOutputStream(destinationFile);
            IOUtils.copy(is, os);
        } finally {
            IOUtils.closeQuietly(os);
        }
    }
}

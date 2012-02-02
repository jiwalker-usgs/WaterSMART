
<%@page import="javax.naming.NamingException"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.watersmart.config.DynamicReadOnlyProperties"%>
<%@page language="java" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
    <head>
        <jsp:include page="pages/head.jspf"/>
        <jsp:include page="template/USGSHead.jspf"/>
        
        <script type="text/javascript">
            var WATERSMART = {};
            var CONFIG = {};
            
            <% 
                DynamicReadOnlyProperties props = DynamicReadOnlyProperties.initProps(); 
                boolean development = Boolean.parseBoolean(props.getProperty("watersmart.development"));
            %>
            
            CONFIG.LOG4JS_PATTERN_LAYOUT = '<%= props.getProperty("watersmart.frontend.log4js.pattern.layout","%rms - %-5p - %m%n") %>';
            CONFIG.LOG4JS_LOG_THRESHOLD = '<%= props.getProperty("watersmart.frontend.log4js.threshold", "info") %>';
            CONFIG.DEVELOPMENT = <%= development %>;

            /**
             * Takes an element, checks the array for that element
             * and if found, returns the index of that element. 
             * Otherwise, returns -1
             */
            Array.prototype.contains = function(element) {
                for (var i = 0;i < this.length;i++) {
                    if (this[i] == element) {
                        return i;
                    }
                }
                return -1;
            }
        </script>
        
        <jsp:include page="js/ext/ext.jsp">
            <jsp:param name="debug-qualifier" value="<%= development %>" />
        </jsp:include>

        <jsp:include page="js/openlayers/openlayers.jsp">
            <jsp:param name="isDevelopment" value="<%= development %>" />
        </jsp:include>

        <script type="text/javascript">
            // change this?
            OpenLayers.ProxyHost = "proxy/?url=";
        </script>

        <jsp:include page="js/geoext/geoext.jsp" >
            <jsp:param name="debug-qualifier" value="<%= development %>" />
        </jsp:include>

        <jsp:include page="js/log4javascript/log4javascript.jsp"/>
        <jsp:include page="js/ext/ux/notify/notify.jsp"/>
        <jsp:include page="js/ext/ux/cida-load/cida-load.jsp"/>
        <jsp:include page="js/ext/ux/fileuploadfield/upload.jsp"/>
        <jsp:include page="js/sarissa/sarissa.jsp"/>

        <script type="text/javascript" src="pages/index/Form/isoFormPanel.js"></script>
        <script type="text/javascript" src="pages/index/Form/fileUploadPanel.js"></script>
        <script type="text/javascript" src="pages/index/onReady.js"></script>
        
        
        
    </head>
    <body>
        <jsp:include page="template/USGSHeader.jspf">
            <jsp:param name="header-class" value="x-hidden"/>
            <jsp:param name="site-title" value="WaterSMART"/>
        </jsp:include>

        <div id="xslt-output-div"></div>

        <jsp:include page="template/USGSFooter.jspf">
            <jsp:param name="footer-class" value="x-hidden"/>
            <jsp:param name="site-url" value=""/>
            <jsp:param name="contact-info" value=""/>
        </jsp:include>
    </body>
</html>

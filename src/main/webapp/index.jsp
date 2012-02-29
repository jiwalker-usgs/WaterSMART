
<%@page import="javax.naming.NamingException"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page language="java" %>
<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
    <head>
        <jsp:include page="template/USGSHead.jsp">
            <jsp:param name="shortName" value="WaterSMART" />
            <jsp:param name="title" value="WaterSMART Model Intercomparison Portal" />
            <jsp:param name="description" value="WaterSMART Modle Intercomparison Portal" />
            <jsp:param name="author" value="Jordan Walker"/>
            <jsp:param name="publisher" value="USGS - U.S. Geological Survey, Water Resources; CIDA - Center for Integrated Data Analytics" />
            <jsp:param name="keywords" value="USGS, U.S. Geological Survey, water, earth science, hydrology, hydrologic, data, streamflow, stream, river, lake, flood, drought, quality, basin, watershed, environment, ground water, groundwater" />
            <jsp:param name="revisedDate" value="20120221" />
            <jsp:param name="nextReview" value="20130221" />
            <jsp:param name="expires" value="never" />
        </jsp:include>
        <link type="text/css" rel="stylesheet" href="css/cswclient.css" />
        
        <script type="text/javascript">
            var WATERSMART = {};
            var CONFIG = {};
            
            <% 
                DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
                props.addJNDIContexts(new String[0]);
                boolean development = Boolean.parseBoolean(props.getProperty("watersmart.development"));
            %>
            
            CONFIG.LOG4JS_PATTERN_LAYOUT = '<%= props.getProperty("watersmart.frontend.log4js.pattern.layout","%rms - %-5p - %m%n") %>';
            CONFIG.LOG4JS_LOG_THRESHOLD = '<%= props.getProperty("watersmart.frontend.log4js.threshold", "info") %>';
            CONFIG.GEOSERVER_URL = '<%= props.getProperty("watersmart.stations.url", "http://localhost:8080/geoserver/ows") %>';
            CONFIG.SITES_LAYER = '<%= props.getProperty("watersmart.stations.typeName", "watersmart:se_sites") %>';
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
            
            // http://jibbering.com/faq/#parseDate
            Date.parseISO8601 = function(dateStringInRange){
                var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/,
                date = new Date(NaN), month,
                parts = isoExp.exec(dateStringInRange);

                if(parts) {
                    month = +parts[2];
                    date.setFullYear(parts[1], month - 1, parts[3]);
                    if(month != date.getMonth() + 1) {
                        date.setTime(NaN);
                    }
                }
                return date;
            };
        </script>
        
        <jsp:include page="js/ext/ext.jsp">
            <jsp:param name="debug-qualifier" value="<%= development %>" />
        </jsp:include>

        <jsp:include page="js/openlayers/openlayers.jsp">
            <jsp:param name="isDevelopment" value="<%= development %>" />
        </jsp:include>
        <script type="text/javascript" src="js/watersmart/XMLHttpRequest.js"></script>

        <script type="text/javascript">
            // change this?
            OpenLayers.ProxyHost = "proxy/?url=";
        </script>

        <jsp:include page="js/geoext/geoext.jsp" >
            <jsp:param name="debug-qualifier" value="<%= development %>" />
        </jsp:include>
        <jsp:include page="js/geoext/ux/SOS/SOS.jsp"/>

        <jsp:include page="js/log4javascript/log4javascript.jsp"/>
        <jsp:include page="js/ext/ux/notify/notify.jsp"/>
        <jsp:include page="js/ext/ux/cida-load/cida-load.jsp"/>
        <jsp:include page="js/ext/ux/fileuploadfield/upload.jsp"/>
        <jsp:include page="js/sarissa/sarissa.jsp"/>
        <jsp:include page="js/dygraphs/dygraphs.jsp"/>

        <script type="text/javascript" src="pages/index/Form/isoFormPanel.js"></script>
        <script type="text/javascript" src="pages/index/Form/fileUploadPanel.js"></script>
        <script type="text/javascript" src="pages/index/Plotter/PlotterPanel.js"></script>
        <script type="text/javascript" src="pages/index/Map/map.js"></script>
        <script type="text/javascript" src="pages/index/onReady.js"></script>
        
        
        
    </head>
    <body>
        <jsp:include page="template/USGSHeader.jsp">
            <jsp:param name="header-class" value="x-hidden"/>
            <jsp:param name="site-title" value="WaterSMART Model Intercomparison Portal"/>
        </jsp:include>

        <div id="xslt-output-div"></div>
        <div id="dygraph-div" class="x-hidden">
            <div id="dygraph-content" class="x-hidden"></div>
            <div id="dygraph-legend" class="x-hidden"></div>
        </div>

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="footer-class" value="x-hidden"/>
            <jsp:param name="site-url" value="http://cida.usgs.gov/watersmart"/>
            <jsp:param name="contact-info" value="dblodgett@usgs.gov"/>
        </jsp:include>
    </body>
</html>

<%-- 
    Document   : login
    Created on : Feb 27, 2012, 2:10:11 PM
    Author     : Jordan Walker <jiwalker@usgs.gov>
--%>

<%@page import="gov.usgs.cida.watersmart.ldap.LoginMessage"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>WaterSMART Login</title>
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

        <jsp:include page="js/ext/ext.jsp" />
        <jsp:include page="js/ext/ux/cida-load/cida-load.jsp"/>
    </head>
    <body>
        <jsp:include page="template/USGSHeader.jsp">
            <jsp:param name="header-class" value="x-hidden"/>
            <jsp:param name="site-title" value="WaterSMART Model Intercomparison Portal"/>
        </jsp:include>

        <%
            String code = request.getParameter("code");
            String msg = "";
            if (code != null) {
                int codeVal = -1;
                try {
                    codeVal = Integer.parseInt(code);
                }
                catch (NumberFormatException nfe) {
                    codeVal = -1;
                }
                msg = "<p style=\"color:red\">" + LoginMessage.getMessage(codeVal) + "</p>";
            }
        %>
        
        <script type="text/javascript">
            Ext.onReady(function() {
                initializeLoadMask();
                LOADMASK.show();
                
                var body = new Ext.FormPanel({
                    region: 'center',
                    border: false,
                    autoShow: true,
                    standardSubmit: true,
                    url: 'index.jsp',
                    title: 'Identify Yourself!',
                    items: [{
                            xtype: 'displayfield',
                            html: '<%= msg %>'
                        },{
                            fieldLabel: 'Username',
                            xtype: 'textfield',
                            name: 'username'
                        }, {
                            fieldLabel: 'Password',
                            xtype: 'textfield',
                            inputType: 'password',
                            name: 'password'
                        }],
                    buttons: [{
                            text: 'Save',
                            handler: function(){
                                var fp = this.ownerCt.ownerCt,
                                form = fp.getForm();
                                if (form.isValid()) {
                                    form.submit();
                                }
                            }
                        }]
                });
                
                var headerPanel = new Ext.Panel({
                    id: 'header-panel',
                    region: 'north',
                    height: 'auto',
                    border : false,
                    autoShow: true,
                    contentEl: 'usgs-header-panel'
                });
                var footerPanel = new Ext.Panel({
                    id: 'footer-panel',
                    region: 'south',
                    height: 'auto',
                    border : false,
                    autoShow: true,
                    contentEl: 'usgs-footer-panel'
                });
                VIEWPORT = new Ext.Viewport({
                    renderTo : document.body,
                    layout : 'border',
                    items : [
                        headerPanel,
                        body,
                        footerPanel
                    ]
                });
                LOADMASK.hide();
            });
            

        </script>
    <!--
        <form method="POST" action='<%= response.encodeURL("index.jsp")%>' >
            <table cellpadding="2" border="0" cellspacing="0">
                <tr>
                    <td align="right">Username:</td>
                    <td align="left"><input type="text" name="username" size="9"></td>
                </tr>
                <tr>
                    <td align="right">Password:</td>
                    <td align="left"><input type="password" name="password" size="9"></td>
                </tr>
                <tr>
                    <td align="right"><input type="submit" value="Log In"></td>
                    <td align="left"><input type="reset"></td>
                </tr>
            </table>
        </form>-->

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="footer-class" value="x-hidden"/>
            <jsp:param name="site-url" value="http://cida.usgs.gov/watersmart"/>
            <jsp:param name="contact-info" value="dblodgett@usgs.gov"/>
        </jsp:include>
    </body>
</html>

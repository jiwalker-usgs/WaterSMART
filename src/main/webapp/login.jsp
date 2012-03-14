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
        <title>WaterSMART</title>
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
                } catch (NumberFormatException nfe) {
                    codeVal = -1;
                }
                msg = "<p style=\"color:red\">" + LoginMessage.getMessage(codeVal) + "</p>";
            }
        %>

        <script type="text/javascript">
            Ext.onReady(function() {
                initializeLoadMask();
                LOADMASK.show();
                
                var bodyPanel = new Ext.Panel({
                    id : 'body-panel',
                    layout : 'column',
                    region: 'center',
                    items: [
                        new Ext.Panel({
                            border : false,
                            html : '<img src="images/key.jpg" id="watersmart-key-image" />',
                            style : {
                                'margin-top':'10%'
                            }
                        }),
                        new Ext.FormPanel({
                            id : 'form-panel',
                            style : {
                                'margin-top':'10%'
                            },
                            columnWidth: .3,
                            border: false,
                            autoShow: true,
                            standardSubmit: true,
                            url: 'index.jsp',
                            buttonAlign : 'center',
                            labelSeparator : '',
                            bodyStyle : {
                                'color' : '#616161'
                            },
                            style : {
                                'margin-top' : '9%'
                            },
                            items: [
                                new Ext.Panel({
                                    border : false,
                                    html : '<img src="images/stop-hand.gif" id="watersmart-stophand-image" />&nbsp;Please identify yourself:'
                                }),
                                {
                                    xtype: 'displayfield',
                                    html: '<%= msg%>',
                                    id : 'errorMessage'
                                },{
                                    id : 'username-input-field',
                                    fieldLabel: 'User Name',
                                    xtype: 'textfield',
                                    name: 'username'
                                }, {
                                    id : 'password-input-field',
                                    fieldLabel: 'Password',
                                    xtype: 'textfield',
                                    inputType: 'password',
                                    name: 'password'
                                }],
                            buttons: [{
                                    text: 'Sign In',
                                    handler: function(){
                                        var fp = this.ownerCt.ownerCt,
                                        form = fp.getForm();
                                        if (form.isValid()) {
                                            form.submit();
                                        }
                                    }
                                }]
                        }),
                        new Ext.Panel({
                            id : 'description-panel',
                            columnWidth: .38,
                            html : '<img src="images/watersmart-graphic-small.jpg" id="watersmart-title-image" />'+
                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vehicula interdum orci, ac pellentesque purus fermentum eu. Nulla facilisi. Morbi id dui diam. Nulla facilisi. Etiam vitae nunc dui, et suscipit justo. Vivamus mauris lorem, facilisis et dignissim et, ornare iaculis nunc. Suspendisse potenti. Curabitur orci ante, posuere in accumsan at, vestibulum in nibh. In hendrerit mollis lacinia. Sed quam ligula, dapibus nec facilisis quis, sollicitudin a ligula. Nullam pulvinar auctor turpis, ut semper urna facilisis vitae. Duis neque urna, adipiscing sed accumsan id, vestibulum at lorem. Pellentesque sit amet purus imperdiet risus suscipit pharetra at id massa.<br /><br />',
                            style : {
                                'margin-top':'7%',
                                'color' : '#616161'
                            },
                            border : false
                        }),
                        new Ext.Panel({
                            columnWidth: .03,
                            border : false,
                            html : '&nbsp;'
                        })
                    ]
                })
                
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
                        bodyPanel,
                        footerPanel
                    ]
                });
                LOADMASK.hide();
            });
            

        </script>
        <%= response.encodeURL("index.jsp")%>' >

        <jsp:include page="template/USGSFooter.jsp">
            <jsp:param name="footer-class" value="x-hidden"/>
            <jsp:param name="site-url" value="http://cida.usgs.gov/watersmart"/>
            <jsp:param name="contact-info" value="dblodgett@usgs.gov"/>
        </jsp:include>
    </body>
</html>

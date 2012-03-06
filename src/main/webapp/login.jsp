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
    </head>
    <body>
        <h3>Identify yourself!</h3>
        <%= (request.getParameter("code") != null) ? 
            "<p style='color:red'>" + LoginMessage.getMessage(request.getParameter("code")) + "</p>":
            ""  
        %>
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
        </form>
    </body>
</html>

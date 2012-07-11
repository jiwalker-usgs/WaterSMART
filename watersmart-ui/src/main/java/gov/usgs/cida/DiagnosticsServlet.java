package gov.usgs.cida;

import java.io.BufferedReader;
import java.io.CharArrayWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.URL;
import java.util.Enumeration;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This servlet rips a bunch of code from I-Lin's Diagnostics request_test.jsp
 * 
 * I don't know why he didn't just leave a copy of it as a servlet.
 * @author dmsibley
 *
 */
public class DiagnosticsServlet extends HttpServlet {
	private static final long serialVersionUID = 4013847865181120576L;

	static final String KEY_VALUE_LISTING= "<div name=\"%s\">%s</div>";
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		diagnose(req, resp);
		
	}
	
	
	protected void diagnose(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		PrintWriter out = null;
		
		try {
			response.setContentType("text/html;charset=UTF-8");
			out = response.getWriter();
			
			out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\"	\"http://www.w3.org/TR/html4/loose.dtd\">");
			out.println("<html>");
			out.println("<head>");
			out.println("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>");
			out.println("<title>Diagnostics Servlet</title>");
			out.println("</head>");
			out.println("<body>");
			
			out.println("<div id=\"getHeaderNames\">");
			Enumeration<String> headers = request.getHeaderNames();
			while (headers.hasMoreElements()) {
				String name = headers.nextElement();
				out.println(String.format(KEY_VALUE_LISTING, name, request.getHeader(name)));
			}
			out.println("</div>");

			out.println("<div id=\"getAttributeNames\">");
			Enumeration<String> attribs = request.getAttributeNames();
			while (attribs.hasMoreElements()) {
				String name = attribs.nextElement();
				out.println(String.format(KEY_VALUE_LISTING, name, request.getAttribute(name).toString()));
			}
			out.println("</div>");
			
			out.println("<div id=\"request\">");
			out.println(String.format(KEY_VALUE_LISTING, "getAuthType", request.getAuthType()));
			out.println(String.format(KEY_VALUE_LISTING, "getContextPath", request.getContextPath()));
			out.println(String.format(KEY_VALUE_LISTING, "getDateHeader-If-Modified-Since", request.getDateHeader("If-Modified-Since")));
			out.println(String.format(KEY_VALUE_LISTING, "getMethod", request.getMethod()));

			out.println(String.format(KEY_VALUE_LISTING, "getPathInfo", request.getPathInfo()));
			out.println(String.format(KEY_VALUE_LISTING, "getPathTranslated", request.getPathTranslated()));

			out.println(String.format(KEY_VALUE_LISTING, "getQueryString", request.getQueryString()));

			out.println(String.format(KEY_VALUE_LISTING, "getRequestedSessionId", request.getRequestedSessionId()));
			out.println(String.format(KEY_VALUE_LISTING, "getRequestURI", request.getRequestURI()));
			out.println(String.format(KEY_VALUE_LISTING, "getRequestURL", request.getRequestURL()));

			out.println(String.format(KEY_VALUE_LISTING, "getServletPath", request.getServletPath()));

			out.println(String.format(KEY_VALUE_LISTING, "getUserPrincipal", request.getUserPrincipal()));
			out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdFromCookie", request.isRequestedSessionIdFromCookie()));
			out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdFromURL", request.isRequestedSessionIdFromURL()));
			out.println(String.format(KEY_VALUE_LISTING, "isRequestedSessionIdValid", request.isRequestedSessionIdValid()));
			
			out.println(String.format(KEY_VALUE_LISTING, "getCharacterEncoding", request.getCharacterEncoding()));
			out.println(String.format(KEY_VALUE_LISTING, "getContentLength", request.getContentLength()));
			out.println(String.format(KEY_VALUE_LISTING, "getContentType", request.getContentType()));

			out.println(String.format(KEY_VALUE_LISTING, "getLocale", request.getLocale().toString()));
			out.println(String.format(KEY_VALUE_LISTING, "getLocalName", request.getLocalName()));
			out.println(String.format(KEY_VALUE_LISTING, "getLocalAddr", request.getLocalAddr()));
			out.println(String.format(KEY_VALUE_LISTING, "getLocalPort", request.getLocalPort()));

			out.println(String.format(KEY_VALUE_LISTING, "getProtocol", request.getProtocol()));
			out.println(String.format(KEY_VALUE_LISTING, "getRemoteAddr", request.getRemoteAddr()));
			out.println(String.format(KEY_VALUE_LISTING, "getRemoteUser", request.getRemoteUser()));
			out.println(String.format(KEY_VALUE_LISTING, "getRemoteHost", request.getRemoteHost()));
			out.println(String.format(KEY_VALUE_LISTING, "getRemotePort", request.getRemotePort()));

			out.println(String.format(KEY_VALUE_LISTING, "getScheme", request.getScheme()));
			out.println(String.format(KEY_VALUE_LISTING, "getServerName", request.getServerName()));
			out.println(String.format(KEY_VALUE_LISTING, "getServerPort", request.getServerPort()));
			out.println(String.format(KEY_VALUE_LISTING, "isSecure", request.isSecure()));
			out.println("</div>");
			
			out.println("<div id=\"getLocales\">");
			Enumeration<Locale> locales = request.getLocales();
			while (locales.hasMoreElements()) {
				Locale locale = locales.nextElement();
				out.println(String.format(KEY_VALUE_LISTING, locale.getDisplayName(), locale.toString()));
			}
			out.println("</div>");
			
			out.println("<div id=\"getCookies\">");
			Cookie[] cookies = request.getCookies();
			if (cookies != null){
				for (Cookie cookie: cookies) {
					out.println("<div name=\"" + cookie.getName() + "\">");
					out.println(String.format(KEY_VALUE_LISTING, "value",cookie.getValue()));
					out.println(String.format(KEY_VALUE_LISTING, "domain",cookie.getDomain()));
					out.println(String.format(KEY_VALUE_LISTING, "maxAge(sec)",cookie.getMaxAge()));
					out.println("</div>");
				}
			}
			out.println("</div>");
			
			out.println("</body>");
			out.println("</html>");
		} finally {
			if (null != out) {
				out.flush();
				out.close();
			}
		}
	}
	
}

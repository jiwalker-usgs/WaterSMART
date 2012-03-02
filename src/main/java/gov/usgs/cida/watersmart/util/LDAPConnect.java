package gov.usgs.cida.watersmart.util;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.netcdf.DSGParser;
import java.util.Properties;
import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.InitialDirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class LDAPConnect {

    private static final Logger LOG = LoggerFactory.getLogger(DSGParser.class);
    private static DynamicReadOnlyProperties jndiProps = null;

    static {
        try {
            jndiProps = new DynamicReadOnlyProperties().addJNDIContexts(
                    new String[0]);
        }
        catch (NamingException ex) {
            // LOG
        }
    }

    public static boolean authenticate(String username, String password) {
        Properties props = new Properties();
        props.put(Context.INITIAL_CONTEXT_FACTORY,
                  "com.sun.jndi.ldap.LdapCtxFactory");
        props.put(Context.PROVIDER_URL, jndiProps.getProperty(
                "watersmart.ldap.url", "ldaps://gsvaresh02.er.usgs.gov:636"));
        props.put(Context.REFERRAL, "ignore");

        // set properties for authentication
        props.put(Context.SECURITY_PRINCIPAL, username);
        props.put(Context.SECURITY_CREDENTIALS, password);

        try {
            InitialDirContext context = new InitialDirContext(props);
//            SearchControls ctrls = new SearchControls();
//            ctrls.setReturningAttributes(new String[] { "givenName", "sn" });
//            ctrls.setSearchScope(SearchControls.SUBTREE_SCOPE);
//
//            NamingEnumeration<SearchResult> answers = context.search(
//                    "dc=People,dc=example,dc=com", "(uid=" + username + ")",
//                                                                     ctrls);
//            SearchResult result = answers.next();
//            
            return true;
        }
        catch (NamingException ex) {
            return false;
        }
    }
}

package gov.usgs.cida.watersmart.ldap;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.watersmart.common.ContextConstants;
import gov.usgs.cida.watersmart.parse.DSGParser;
import gov.usgs.cida.watersmart.common.JNDISingleton;
import java.security.KeyStore;
import java.util.Properties;
import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
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
    private static DynamicReadOnlyProperties jndiProps = JNDISingleton.getInstance();
    

    public static User authenticate(String username, String password) {
        
        Properties props = new Properties();
        props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        props.put(Context.PROVIDER_URL, jndiProps.getProperty(
            ContextConstants.LDAP_URL, "ldaps://gssdsflh02.cr.usgs.gov:636"));
        props.put(Context.REFERRAL, "ignore");
        props.put(Context.SECURITY_AUTHENTICATION, "simple");

        // set properties for authentication
        props.put(Context.SECURITY_PRINCIPAL, username + "@gs.doi.net");
        props.put(Context.SECURITY_CREDENTIALS, password);
        
        User user = null;

        try {
            InitialDirContext context = new InitialDirContext(props);
            SearchControls ctrls = new SearchControls();
            ctrls.setReturningAttributes(new String[] { "dn", "mail", "givenname", "sn", "samaccountname" });
            ctrls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            String basedn = props.getProperty(ContextConstants.LDAP_BASEDN, "DC=gs,DC=doi,dc=net");
            NamingEnumeration<SearchResult> answers = context.search(
                    basedn,  
                    "(samaccountname=" + username + ")",
                    ctrls
                    );
            if (answers.hasMore()) {
                SearchResult result = answers.next();
                Attributes attributes = result.getAttributes();
                String mail = (String)attributes.get("mail").get();
                String givenname = (String)attributes.get("givenname").get();
                String sn = (String)attributes.get("sn").get();
                String uid = (String)attributes.get("samaccountname").get();
                String dn = result.getNameInNamespace();
                
                user = new User(dn, mail, givenname, sn, uid);
                user.setAuthentication(true);
            }
        }
        catch (NamingException ex) {
            LOG.debug("unable to authenticate user", ex);
        }
        finally {
            return user;
        }
    }
}

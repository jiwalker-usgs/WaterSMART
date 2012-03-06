package gov.usgs.cida.watersmart.ldap;

/**
 * User POJO
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class User {
    public final String fullyQualifiedName;
    public final String email;
    public final String givenName;
    public final String fullName;
    public final String uid;
    private boolean isAuthenticated;
    
    public User(String dn, String mail, String givenname, String sn, String uid) {
        this.fullyQualifiedName = dn;
        this.email = mail;
        this.givenName = givenname;
        this.fullName = givenname + " " + sn;
        this.uid = uid;
        this.isAuthenticated = false;
    }
    
    // package protected to avoid much reuse
    void setAuthentication(boolean authenticated) {
        this.isAuthenticated = authenticated;
    }
    
    public boolean isAuthenticated() {
        return isAuthenticated;
    }
    
    public static User devUser() {
        User user = new User("CN=Dev,OU=USGS,O=DOI", "devuser@usgs.gov", "Developer", "Dude", "dev");
        user.setAuthentication(true);
        return user;
    }
}

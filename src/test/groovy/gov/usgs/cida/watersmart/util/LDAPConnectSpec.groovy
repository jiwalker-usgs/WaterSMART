package gov.usgs.cida.watersmart.util

import spock.lang.*
import gov.usgs.cida.watersmart.util.JNDISingleton
import gov.usgs.cida.watersmart.ldap.LDAPConnect

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class LDAPConnectSpec extends Specification {

    @Ignore
    def "authentication for user not in group fails"() {
        setup:
        def username = "alertscidajavadev"
        def password = "???"
        
        expect:
        !LDAPConnect.authenticate(username, password)
    }
    
    @Ignore
    def "authentication for user in group succeeds"() {
        setup:
        def username = "jiwalker"
        def password = "???"
        
        expect:
        LDAPConnect.authenticate(username, password)
    }
    
    def "authentication for incorrect password fails"() {
        setup:
        def username = "alertscidajavadev"
        def password = "f@!l"
        
        expect:
        !LDAPConnect.authenticate(username, password)
    }
}


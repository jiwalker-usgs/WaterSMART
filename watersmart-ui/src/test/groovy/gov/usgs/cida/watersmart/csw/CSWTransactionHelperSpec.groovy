package gov.usgs.cida.watersmart.csw

import spock.lang.*
import gov.usgs.cida.watersmart.parse.RunMetadata

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class CSWTransactionHelperSpec extends Specification {
    
    @Ignore
	def "csw getRecords successfully returns record"() {
        setup:
        System.setProperty("watersmart.geonetwork.addr", "http://130.11.165.241:8081/geonetwork")
        System.setProperty("watersmart.geonetwork.user", "watersmart")
        System.setProperty("watersmart.geonetwork.pass", "???")
        def meta = new RunMetadata()
        meta.setModelId("1aab27ee-87cd-4d6c-a3a1-0a532f84616e")
        
        when:
        def transaction = new CSWTransactionHelper(meta)
        def doc = transaction.getRecordsCall()
        
        then:
        doc != null
        doc.getFirstChild().getNodeName() == "csw:GetRecordsResponse"
    }
}


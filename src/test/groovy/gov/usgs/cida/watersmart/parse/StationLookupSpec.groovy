package gov.usgs.cida.watersmart.parse

import spock.lang.*
import gov.usgs.cida.watersmart.parse.StationLookup

class StationLookupSpec extends Specification {
    
    def stations = new StationLookup("http://igsarm-cida-javadev1.er.usgs.gov:8081/geoserver/watersmart/ows", "watersmart:se_sites", "site_no")
    
	def "there should be 509 stations"() {
        expect:
        stations.getStations().size() == 509
    }
    
    @Unroll
    def "#stationId has index #index"() {
        expect:
        stations.lookup(stationId) == index
        
        where:
        stationId  | index
        "02177000" | 0
        "02186000" | 7
        "02204130" | 15
        "blah"     | -1
    }
}


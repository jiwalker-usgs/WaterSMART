package gov.usgs.cida.watersmart.parse

import spock.lang.*
import gov.usgs.cida.watersmart.parse.StationLookup

class StationLookupSpec extends Specification {
    
    def stations = new WFSPointStationLookup("http://cida-wiwsc-gdp2qa.er.usgs.gov:8082/geoserver/NWC/ows", "NWC:Dense1", "site_no")
    
	def "there should be 199 stations"() {
        expect:
        stations.getStations().size() == 199
    }
    
    @Unroll
    def "#stationId has index #index"() {
        expect:
        stations.lookup(stationId) == index
        
        where:
        stationId  | index
        "02177000" | 0
        "02186000" | 3
        "02204130" | -1
        "blah"     | -1
    }
}


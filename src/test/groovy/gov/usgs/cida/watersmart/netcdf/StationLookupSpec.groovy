package gov.usgs.cida.watersmart.netcdf

import spock.lang.*;

class StationLookupSpec extends Specification {
	def "there should be 509 stations"() {
        expect:
        stationList.size() == 509
        
        where:
        stationList = StationLookup.getStationList()
    }
    
    @Unroll
    def "#stationId has index #index"() {
        expect:
        StationLookup.lookup(stationId) == index
        
        where:
        stationId  | index
        "02177000" | 0
        "02186000" | 7
        "02204130" | 15
        "blah"     | -1
    }
}


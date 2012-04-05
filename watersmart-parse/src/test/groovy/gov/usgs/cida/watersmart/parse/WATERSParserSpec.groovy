
package gov.usgs.cida.watersmart.parse

import spock.lang.*
import gov.usgs.cida.netcdf.dsg.*
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils
import gov.usgs.cida.watersmart.parse.*
import gov.usgs.cida.watersmart.parse.file.*
import static spock.util.matcher.HamcrestMatchers.closeTo
/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class WATERSParserSpec extends Specification {
	
    def sampleFile = new File(
        SYEParserSpec.class.getClassLoader().getResource(
            "gov/usgs/cida/watersmart/netcdf/WATERS.txt"
        ).getFile())
    
    def "date format works as expected"() {
        
    }
    
    def "next called without calling getMetadata should fail"() {
        
    }
    
    def "observations are parsed correctly"() {
        setup:
        def lookup = Mock(StationLookup)
        lookup.lookup("02177000") << 0
        def watersParser = new WATERSParser(new FileInputStream(sampleFile), lookup)
        watersParser.parse()
        def ob = watersParser.next()
        
        expect:
        ob.time_offset == 0
        ob.station_index == 0
        ob.values[0](closeTo(277.42618, 0.01))
    }
    
    def "stationId gets picked up from file"() {
        setup:
        def lookup = Mock(StationLookup)
        lookup.lookup("02177000") << 0
        def watersParser = new WATERSParser(new FileInputStream(sampleFile), lookup)
        watersParser.parse()
        
        expect:
        watersParser.stationIndex == 0;
    }
    
    def "NetCDF from SYE input completes successfully"() {
        setup:
        def lookup = Mock(StationLookup)
        def watersParser = new WATERSParser(new FileInputStream(sampleFile), lookup)
        def ncFile = new File("/tmp/test.nc")
        def rt = watersParser.parse()
        def sampleStation = new Station(34.8139814f, -83.305993f, "02177000")
        def nc = new StationTimeSeriesNetCDFFile(ncFile, rt, true, sampleStation)
        
        while (watersParser.hasNext()) {
            Observation ob = watersParser.next()
            nc.putObservation(ob)
        }
        IOUtils.closeQuietly(nc)
        
        expect:
        FileUtils.sizeOf(ncFile) == 16769
        
        cleanup:
        FileUtils.deleteQuietly(ncFile)
    }
}


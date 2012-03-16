package gov.usgs.cida.watersmart.netcdf

import spock.lang.*
import org.joda.time.*
import static spock.util.matcher.HamcrestMatchers.closeTo
import gov.usgs.cida.netcdf.dsg.*
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class SYEParserSpec extends Specification {
	
    def sampleFile = new File(
        SYEParserTest.class.getClassLoader().getResource(
            "gov/usgs/cida/watersmart/netcdf/02177000.txt"
        ).getFile())
    
    def "date format handles padded and unpadded dates"() {
        when:
        // month/day/year not 0 padded
        def date1 = "1/2/2009"
        // some people might 0 pad
        def date2 = "02/03/1998"
        def instant1 = Instant.parse(date1, SYEParser.inputDateFormatter)
        def instant2 = Instant.parse(date2, SYEParser.inputDateFormatter)
        
        then:
        instant1.get(DateTimeFieldType.monthOfYear()) == 1
        instant1.get(DateTimeFieldType.dayOfMonth()) == 2
        instant1.get(DateTimeFieldType.year()) == 2009
        
        and:
        instant2.get(DateTimeFieldType.monthOfYear()) == 2
        instant2.get(DateTimeFieldType.dayOfMonth()) == 3
        instant2.get(DateTimeFieldType.year()) == 1998
    }
    
    def "next called without calling getMetadata should fail"() {
        when:
        def syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName())
        syeParser.next()
        
        then:
        thrown(IllegalStateException)
    }
    
    def "observations are parsed correctly"() {
        setup:
        def syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName())
        syeParser.parseMetadata()
        def ob = syeParser.next()
        
        expect:
        ob.time_offset == 0
        ob.station_index == 0
        ob.values[0](closeTo(70.66, 0.01))
    }
    
    def "NetCDF from SYE input completes successfully"() {
        setup:
        def syeParser = new SYEParser(new FileInputStream(sampleFile), sampleFile.getName())
//        StationTimeSeriesNetCDFFile nc = null;
//        File ncFile = null;
        def ncFile = new File("/tmp/test.nc")
        def rt = syeParser.parseMetadata()
        def sampleStation = new Station(34.8139814f, -83.305993f, "02177000")
        def nc = new StationTimeSeriesNetCDFFile(ncFile, rt, true, sampleStation)
        
        while (syeParser.hasNext()) {
            Observation ob = syeParser.next()
            nc.putObservation(ob)
        }
        IOUtils.closeQuietly(nc)
        
        expect:
        FileUtils.sizeOf(ncFile) == 13079
        
        cleanup:
        FileUtils.deleteQuietly(ncFile)
    }
}


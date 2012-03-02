package gov.usgs.cida.watersmart.netcdf

import spock.lang.*;
import org.joda.time.*;

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
}


package gov.usgs.cida.watersmart.parse

import spock.lang.*
import com.google.common.collect.Sets
import gov.usgs.cida.watersmart.parse.column.PRMSParser
import gov.usgs.cida.watersmart.parse.CreateDSGFromZip
import gov.usgs.cida.watersmart.common.RunMetadata
import gov.usgs.cida.watersmart.common.ModelType

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class PRMSParserSpec extends Specification {
	
    def sampleFile = new File(
        PRMSParserSpec.class.getClassLoader().getResource(
            "gov/usgs/cida/watersmart/netcdf/prms.zip"
        ).getFile())
    
    def "data regex matches sample line"() {
        given: "simplified input string"
        def str = "1234 1980 10 1 0 0 0 31.271 980.25 49.913"

        when: "get matcher from parser pattern"
        def matcher = PRMSParser.dataLinePattern.matcher(str)
        
        then: "matcher should match"
        matcher.matches()
        
        and: "there should be 3 items in group 2"
        matcher.group(7).split("\\s+").size() == 3
    }
        
}
package gov.usgs.cida.watersmart.parse

import spock.lang.*
import com.google.common.collect.Sets
import gov.usgs.cida.watersmart.parse.column.AFINCHParser

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
class AFINCHParserSpec extends Specification {
	def "adding long redundant array to set gives unique items"() {
        given: "long array of redundant things"
        def things = ["abc", "def", "abc", "def", "abc"]
        
        when: "create new hash set"
        def uniqueThings = Sets.newLinkedHashSet(things)
        
        then: "set has two items"
        uniqueThings.size() == 2
        
        and: "item 1 is abc, 2 is def"
        uniqueThings.toArray() == ["abc", "def"]
    }
    
    def "statistic regex satisfies criteria"() {
        given: "simplified input string"
        def str = "TIMESTEP	 MEAN(ft3/s)	 MEAN(ft3/s)	 MEAN(ft3/s)	"
        
        when: "create matcher off pattern in Parser"
        def matcher = AFINCHParser.headerLinePattern.matcher(str)
        
        then: "matcher should match sample line"
        matcher.matches()
    }
    
    def "variable regex works as specified"() {
        given: "same string as above"
        def str = "TIMESTEP	 MEAN(ft3/s)	 MEAN(ft3/s)	 MEAN(ft3/s)	"
        
        when: "pulled apart by regex"
        def matcher = AFINCHParser.headerLinePattern.matcher(str)
        def firstGuy = (matcher.matches()) ? matcher.group(1).split("\\s+")[0] : "fail"
        def statMatcher = AFINCHParser.statisticAndUnitsPattern.matcher(firstGuy)
        
        then: "matcher will yield statistic and unit"
        statMatcher.matches()
        statMatcher.group(1) == "MEAN"
        statMatcher.group(2) == "ft3/s"
    }
    
    def "data regex matches sample line"() {
        given: "simplified input string"
        def str = "1980-10-01T00:00:00Z	       31.271	       980.25	       49.913	"

        when: "get matcher from parser pattern"
        def matcher = AFINCHParser.dataLinePattern.matcher(str)
        
        then: "matcher should match"
        matcher.matches()
        
        and: "there should be 3 items in group 2"
        matcher.group(2).split("\\s+").size() == 3
    }
        
}
package gov.usgs.cida.watersmart.parse

import spock.lang.*
import com.google.common.collect.Sets

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
}


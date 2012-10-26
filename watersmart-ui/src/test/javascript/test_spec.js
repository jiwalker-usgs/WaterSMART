describe("Library Checking", function() {
    it("verifies that ExtJS gets loaded", function() {
        expect(Ext).toBeDefined();
        expect(Ext.isBoolean(true)).toBeTruthy(); 
    });
    
    it("verifies that ExtJS Ajax is initialized", function() {
        expect(Ext.Ajax.events['ajax-request-firing']).toBeUndefined(); 
        expect(Ext.Ajax.events['ajax-requests-complete']).toBeUndefined(); 
        expect(Ext.Ajax.events['ajax-request-exception']).toBeUndefined(); 
       
        initializeAjax()
       
        expect(Ext.Ajax.events['ajax-request-firing']).toBeDefined();
        expect(Ext.Ajax.events['ajax-requests-complete']).toBeDefined();
        expect(Ext.Ajax.events['ajax-request-exception']).toBeDefined();
    });
    
    it("verifies that Log4JS gets loaded", function() {
        expect(LOG).toBeUndefined(); 
       
        initializeLogging();
       
        expect(LOG).toBeDefined(); 
    });
    
});

describe("EXT Stores", function() {
    var cswStore;
    it("verifies loading of a CIDA.CSWGetRecordsStore", function() {
        runs(function() {
            var tests = function(store) {
                expect(store).toBeTruthy()
                expect(store.getCount()).toEqual(1);
                expect(store.getAt(0).data.fileIdentifier).toBe("1aab27ee-87cd-4d6c-a3a1-0a532f84616e");
                expect(store.getAt(0).data.language).toBe("eng");
                expect(store.getAt(0).data.identificationInfo.length).toEqual(6);
                expect(store.getAt(0).data.identificationInfo[0]['abstract'].CharacterString.value).toBe('');
                expect(store.getAt(0).data.identificationInfo[0].citation.title.CharacterString.value).toBe('WATERS');
                expect(store.getAt(0).data.identificationInfo[0].graphicOverview[0].fileDescription.CharacterString.value).toBe('thumbnail');
            }
            expect(cswStore).toBeUndefined();
            cswStore = new CIDA.CSWGetRecordsStore({
                // Found in src/test/javascript/test_spec.js
                url : "spec/csw-test.xml",
                storeId : 'parentCswStore',
                opts : {
                    resultType : 'results',
                    outputSchema : 'http://www.isotc211.org/2005/gmd',
                    Query : {
                        ElementSetName : {
                            value: 'full'
                        },
                        Constraint : {
                            Filter : {
                                type : '==',
                                property : 'ParentIdentifier',
                                value : "497cf2db-56d6-4cad-9a56-a14b63fb232a"
                            },
                            version : '1.1.0'
                        }
                    }
                },
                listeners : {
                    load : tests,
                    exception : function() {
                        // fail
                        expect(true).toBeFalsy();
                    }, 
                    scope : this
                }
            });
            expect(cswStore).toBeDefined();
            cswStore.load();
        })
        // Because this is asynchronous, we must wait before proceeding
        waits(500);
    })
})
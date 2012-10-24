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
    it("verifies that it's possible to attain a CSW store", function() {
        cswStore.load();
    })
})
//
//describe("A spec", function() {
//  var foo;
//
//  beforeEach(function() {
//    foo = 0;
//    foo += 1;
//  });
//
//  afterEach(function() {
//    foo = 0;
//  });
//
//  it("is just a function, so it can contain any code", function() {
//    expect(foo).toEqual(1);
//  });
//
//  it("can have more than one expectation", function() {
//    expect(foo).toEqual(1);
//    expect(true).toEqual(true);
//  });
//
//  describe("nested inside a second describe", function() {
//    var bar;
//
//    beforeEach(function() {
//      bar = 1;
//    });
//
//    it("can reference both scopes as needed ", function() {
//      expect(foo).toEqual(bar);
//    });
//  });
//});


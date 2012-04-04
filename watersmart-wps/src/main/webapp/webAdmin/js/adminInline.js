// constants
var itemListTypes = new Array("Generator","Parser","Repository","RemoteRepository");
var itemListTypeNr = {
    "Generator":0,
    "Parser":1,
    "Repository":2,
    "RemoteRepository":3
};
var relativeConfigPath = "../config/";
var configurationFileName = "wps_config.xml";
            
// upload req
var uploadId = "";

// at page load
$(document).ready(function(){
                
    $("#Tabs > ul").tabs();
    $("#sections").accordion({
        header: "div.accHeader",
        fillSpace: false
    });

    new Ajax_upload('#upload_button', {
        // Location of the server-side upload script
        action: 'index.jsp',
        // File upload name
        name: 'userfile',
        // Additional data to send
        //data: {
        //  example_key1 : 'example_value',
        //  example_key2 : 'example_value2'
        //},
        // Fired when user selects file
        // You can return false to cancel upload
        // @param file basename of uploaded file
        // @param extension of that file
        onSubmit: function(file, extension) {
        },
        // Fired when file upload is completed
        // @param file basename of uploaded file
        // @param response server response
        onComplete: function(file, response) {
            loadConfiguration(relativeConfigPath + "<%=fileUpload.getFilenamePrefix()%>" + file);
        }
    });
                
               	
    $("#upload_process").click(function(){
        openbox('Upload a WPS process', 1, 'box')             
    });

    $("#manage_rem_repos").click(function(){
        openbox('Manage Remote Repositories', 1, 'box')             
    });
               	
    $("#upload_r_script").click(function(){
        openbox('Upload an R script', 1, 'box2')             
    });

    $("#loadConfBtn").click(function(){
        loadConfiguration(relativeConfigPath + configurationFileName);
    });

    $("#saveConfBtn").click(function(){
        // check if there are "unsaved" properties, because they can contain empty data
        if($("img#saveEditImg").length > 0){
            alert("There are unsaved properties, please save or delete them.");
        } else {						
            if (confirm("Save and Activate Configuration?")) {
                $("input[name='serializedWPSConfiguraton']:first").val($("#form1").serialize());
                $("#saveConfogurationForm").submit();
            }
        }
    });
    loadConfiguration(relativeConfigPath + configurationFileName);
});          
            
function uploadFiles() {
    var uploadCheck = new Boolean(false);
    var extA = document.getElementById("processFile").value;
    var extB = document.getElementById("processDescriptionFile").value;
    extA = extA.substring(extA.length-3,extA.length);
    extA = extA.toLowerCase();
    extB = extB.substring(extB.length-3,extB.length);
    extB = extB.toLowerCase();
	 			
    if(extA != 'ava' & extA != 'zip' | extB != 'xml' & extB != '')
    {
        if (extA != 'ava' & extA != 'zip')
        {
            alert('You selected a .'+extA+ ' file containing the process; please select a .java or .zip file instead!');
            if (extB != 'xml' & extB != '') alert('You also selected a .'+extB+ ' file containing the process description; please select a .xml file instead!');
        }
        else{
            alert('You selected a .'+extB+ ' file containing the process description; please select a .xml file instead!');
        }
        uploadCheck=false;
    }
    else {
        uploadCheck=true;
    }
				
    if (uploadCheck)
    {
        appendProcessToList();
        $("input[name='serializedWPSConfiguraton']:first").val($("#form1").serialize());
        $("#saveConfogurationForm").submit();
        return true;
    }
    return false;
}
            

function loadConfiguration(configFile){
    // ensure not getting cached version
    var confFile = configFile + "?" + 1*new Date();

    $.get(confFile,{},function(xml){
        var hostname = $("Server:first",xml).attr("hostname");
        var hostport = $("Server:first",xml).attr("hostport");
        var includeDataInputsInResponse = $("Server:first",xml).attr("includeDataInputsInResponse");
        var computationTimeoutMilliSeconds = $("Server:first",xml).attr("computationTimeoutMilliSeconds");
        var cacheCapabilites = $("Server:first",xml).attr("cacheCapabilites");
        var webappPath = $("Server:first",xml).attr("webappPath");
        var repoReloadInterval = $("Server:first",xml).attr("repoReloadInterval");
                    
        $("#Server_Settings input[name='Server-hostname']:first").val(hostname);
        $("#Server_Settings input[name='Server-hostport']:first").val(hostport);
        $("#Server_Settings input[name='Server-includeDataInputsInResponse']:first").val(includeDataInputsInResponse);
        $("#Server_Settings input[name='Server-computationTimeoutMilliSeconds']:first").val(computationTimeoutMilliSeconds);
        $("#Server_Settings input[name='Server-cacheCapabilites']:first").val(cacheCapabilites);
        $("#Server_Settings input[name='Server-webappPath']:first").val(webappPath);
        $("#Server_Settings input[name='Server-repoReloadInterval']:first").val(repoReloadInterval);

        // display all algorithm repositories, parsers and generators
        for (itemType in itemListTypes ){					// "Generator" / "Parser" / "Repository"
            var listType = itemListTypes[itemType]
            $("#"+listType+"_List").empty();				// clear the old entries
            $(listType,xml).each(function(i) {
                nameEntry = $(this).attr("name");
                className = $(this).attr("className");
                activeString = $(this).attr("active");
                            
                var active = true;
                if(activeString == "false"){
                    active = false;
                }    
                            
                var itemID = addListItem(listType);
                if (nameEntry == "UploadedAlgorithmRepository"){
                    setUploadId(itemID);
                }

                // now that the list item exists, add name, class and active to the elements
                $("#" + listType + "-" + itemID + "_NameEntry").val(nameEntry);					// set the name entry 
                $("#" + listType + "-" + itemID + "_ClassEntry").val(className);				// set the class entry
                $("#" + listType + "-" + itemID + "_Activator").attr('checked', active);		// set the active state
                            
                $('Property',this).each(function(j) {
                    propertyName = $(this).attr("name");
                    propertyValue = $(this).text();
                    propActiveString = $(this).attr("active");

                    var propActive = true;
                    if(propActiveString == "false"){
                        propActive = false;
                    }   
                                
                    var propID = addPropItem(listType + "-" + itemID + '_Property');

                    // now that the property items exist, add name, value and active state
                    $("#" + listType + "-" + itemID + "_Property" + "-" + propID + "_Name").val(propertyName);
                    $("#" + listType + "-" + itemID + "_Property" + "-" + propID + "_Value").val(propertyValue);
                    $("#" + listType + "-" + itemID + "_Property" + "-" + propID + "_Activator").attr('checked', propActive);
                });
                            
                $('Format',this).each(function(j) {
                    formatMime = $(this).attr("mimetype");
                    formatEnc = $(this).attr("encoding");
                                
                    if(!formatEnc){
                        formatEnc = "default";
                    }
                                
                    formatSchem = $(this).attr("schema");
                                
                    var formatID = addFormatItem(listType + "-" + itemID + '_Format');

                    // now that the property items exist, add name, value and active state
                    $("#" + listType + "-" + itemID + "_Format" + "-" + formatID + "_Mime").val(formatMime);
                    $("#" + listType + "-" + itemID + "_Format" + "-" + formatID + "_Enc").val(formatEnc);
                    $("#" + listType + "-" + itemID + "_Format" + "-" + formatID + "_Schem").val(formatSchem);
                });
                            
                            
            });
        }
    });
}

function addListItem(itemType) {         
    var id = document.getElementById("id").value;
    if(itemType == itemListTypes[itemListTypeNr.RemoteRepository]){
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
            "</p>"
            );
    }else if((itemType == itemListTypes[itemListTypeNr.Parser]) || (itemType == itemListTypes[itemListTypeNr.Generator])){
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Class</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Class\" id=\"" + itemType + "-" + id + "_ClassEntry\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Formats <img id=\"minMax-"+ itemType + "-" + id + "_Format" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Format'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Format" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Format_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"formatMimeTypeLabel\" style=\"font-weight:bold;color:black;\">MimeType</label>" +
            "<label class=\"formatEncodingLabel\" style=\"font-weight:bold;color:black;\">Encoding</label>" +					                
            "<label class=\"formatSchemaLabel\" style=\"font-weight:bold;color:black;\">Schema</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewFormatItem('" + itemType + "-" + id + "_Format'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
			            
            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
			            
            "</p>"
            );
    }else{
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Class</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Class\" id=\"" + itemType + "-" + id + "_ClassEntry\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
            "</p>"
            );
    }
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}

function addNewListItem(itemType) {         
    var id = document.getElementById("id").value;
    if(itemType == itemListTypes[itemListTypeNr.RemoteRepository]){
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" style=\"border:1px solid black;background-color:#F5F8F9;\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" checked style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;cursor:pointer;\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
            "</p>"
            );
    }else if((itemType == itemListTypes[itemListTypeNr.Parser]) || (itemType == itemListTypes[itemListTypeNr.Generator])){
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" style=\"border:1px solid black;background-color:#F5F8F9;\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Class</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Class\" id=\"" + itemType + "-" + id + "_ClassEntry\" style=\"border:1px solid black;background-color:#F5F8F9;\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" checked style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Formats <img id=\"minMax-"+ itemType + "-" + id + "_Format" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Format'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Format" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Format_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"formatMimeTypeLabel\" style=\"font-weight:bold;color:black;\">MimeType</label>" +
            "<label class=\"formatEncodingLabel\" style=\"font-weight:bold;color:black;\">Encoding</label>" +					                
            "<label class=\"formatSchemaLabel\" style=\"font-weight:bold;color:black;\">Schema</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewFormatItem('" + itemType + "-" + id + "_Format'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
			            
            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;\" style=\"cursor:pointer\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
			            
            "</p>"
            );
    }else{                
        $("#"+itemType+"_List").append
        (
            "<p class=\"listItem\" id=\"" + itemType + "-" + id + "\">" +
            "<img src=\"images/del.png\" onClick=\"removeList('"+ itemType + "-" + id + "')\" />"+
            "<table class=\"nameClass\">"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Name</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Name\" id=\"" + itemType + "-" + id + "_NameEntry\" style=\"border:1px solid black;background-color:#F5F8F9;\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Class</td><td><input type=\"text\" name=\"" + itemType + "-" + id + "_Class\" id=\"" + itemType + "-" + id + "_ClassEntry\" style=\"border:1px solid black;background-color:#F5F8F9;\" /></td></tr>"+
            "<tr><td style=\"font-weight:bold; padding-right:15px\">Active</td><td><input type=\"checkbox\" name=\"" + itemType + "-" + id + "_Activator\" id=\""+ itemType + "-" + id + "_Activator\" checked style=\"width:0\" /></td></tr>"+							
            "</table>"+
	         
            "<br>" +

            "Properties <img id=\"minMax-"+ itemType + "-" + id + "_Property" + "\" src=\"images/maximize.gif\" onClick=\"maximize_minimize('" + itemType + "-" + id + "_Property'); return false;\" style=\"padding-left:3em;cursor:pointer;\" />"+ 
            "<div id=\"maximizer-"+ itemType + "-" + id + "_Property" + "\" style=\"display:none;\">"+
            "<div class=\"propList\" id=\""+ itemType + "-" + id +"_Property_List\">" +
            "<div class=\"propListHeader\">" +
            "<label class=\"propertyNameLabel\" style=\"font-weight:bold;color:black;\">Name</label>" +
            "<label class=\"propertyValueLabel\" style=\"font-weight:bold;color:black;\">Value</label>" +					                
            "</div>" +
            "</div>" +
            "<div class=\"propEnd\"><img onClick=\"addNewPropItem('" + itemType + "-" + id + "_Property'); return false;\" src=\"images/add.png\" alt=\"Add\" style=\"cursor:pointer\" /></div>"+
            "</div>"+
            "</p>"
            );
    }
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}

function removeList(id){
    $("p#" + id).remove();
    $("div#maximizer-" + id).remove();
}
            
function maximize_minimize(id){
    var div = $("div#maximizer-" + id);
    if(div.css("display") == "none"){
        div.show("fast");
        $("img#minMax-"+ id).attr("src","images/minimize.gif");
    } else {
        div.hide("fast");
        $("img#minMax-"+ id).attr("src","images/maximize.gif");
    }				
}

function addPropItem(itemType) {
    var id = document.getElementById("id").value;
    $("#" + itemType + "_List").append
    (
        "<div class=\"propItem\" id=\"" + itemType + "-" + id + "\">"+
        "<input type=\"text\" class=\"propertyName\" size=\"15\" name=\""+ itemType + "-" + id +"_Name\" id=\"" + itemType + "-" + id + "_Name\" readonly />"+
        "<input type=\"text\" class=\"propertyValue\" size=\"20\" name=\""+ itemType + "-" + id +"_Value\" id=\""+ itemType + "-" + id + "_Value\" readonly />"+
        "<input type=\"checkbox\" name=\"" + itemType + "-" + id +"_Activator\" id=\"" + itemType + "-" + id +"_Activator\" />" +            
        "<img onClick=\"removeItem('#"+ itemType + "-" + id + "'); return false;\" src=\"images/del.png\" width=\"16\" height=\"16\" alt=\"Remove\" style=\"cursor:pointer\" />"+
        "<img id=\"editImg\" onClick=\"edit('#"+ itemType + "-" + id + "'); return false;\" src=\"images/edit.png\" alt=\"Edit\" style=\"cursor:pointer\" />"+
        "</div>"
        );
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}

function addNewPropItem(itemType) {
    var id = document.getElementById("id").value;
    $("#" + itemType + "_List").append
    (
        "<div class=\"propItem\" id=\"" + itemType + "-" + id + "\">"+
        "<input type=\"text\" class=\"propertyName\" size=\"15\" name=\""+ itemType + "-" + id +"_Name\" id=\"" + itemType + "-" + id + "_Name\" style=\"border:1px solid black;background-color:#F5F8F9;\" />"+
        "<input type=\"text\" class=\"propertyValue\" size=\"20\" name=\""+ itemType + "-" + id +"_Value\" id=\""+ itemType + "-" + id + "_Value\" style=\"border:1px solid black;background-color:#F5F8F9;\" />"+
        "<input type=\"checkbox\" name=\"" + itemType + "-" + id +"_Activator\" id=\"" + itemType + "-" + id +"_Activator\" checked />" +            
        "<img onClick=\"removeItem('#"+ itemType + "-" + id + "'); return false;\" src=\"images/del.png\" alt=\"Remove\" style=\"cursor:pointer\" />"+
        "<img id=\"saveEditImg\" onClick=\"saveEdit('#"+ itemType + "-" + id + "'); return false;\" src=\"images/save.png\" alt=\"Save edit\" style=\"cursor:pointer\" />"+
        "</div>"
        );
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}      
            
function addFormatItem(itemType) {
    var id = document.getElementById("id").value;
    $("#" + itemType + "_List").append
    (
        "<div class=\"propItem\" id=\"" + itemType + "-" + id + "\">"+
        "<input type=\"text\" class=\"formatMimeType\" size=\"20\" name=\""+ itemType + "-" + id +"_Mime\" id=\"" + itemType + "-" + id + "_Mime\" readonly />"+
        "<input type=\"text\" class=\"formatEncoding\" size=\"20\" name=\""+ itemType + "-" + id +"_Enc\" id=\""+ itemType + "-" + id + "_Enc\" readonly />"+
        "<input type=\"text\" class=\"formatSchema\" size=\"20\" name=\""+ itemType + "-" + id +"_Schem\" id=\""+ itemType + "-" + id + "_Schem\" readonly />"+
        "<img onClick=\"removeItem('#"+ itemType + "-" + id + "'); return false;\" src=\"images/del.png\" width=\"16\" height=\"16\" alt=\"Remove\" style=\"cursor:pointer\" />"+
        "<img id=\"editImg\" onClick=\"edit('#"+ itemType + "-" + id + "'); return false;\" src=\"images/edit.png\" alt=\"Edit\" style=\"cursor:pointer\" />"+
        "</div>"
        );
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}

function addNewFormatItem(itemType) {
    var id = document.getElementById("id").value;
    $("#" + itemType + "_List").append
    (
        "<div class=\"propItem\" id=\"" + itemType + "-" + id + "\">"+
        "<input type=\"text\" class=\"formatMimeType\" size=\"20\" name=\""+ itemType + "-" + id +"_Mime\" id=\"" + itemType + "-" + id + "_Mime\" style=\"border:1px solid black;background-color:#F5F8F9;\" />"+
        "<input type=\"text\" class=\"formatEncoding\" size=\"20\" name=\""+ itemType + "-" + id +"_Enc\" id=\""+ itemType + "-" + id + "_Enc\" style=\"border:1px solid black;background-color:#F5F8F9;\" />"+
        "<input type=\"text\" class=\"formatSchema\" size=\"20\" name=\""+ itemType + "-" + id +"_Schem\" id=\""+ itemType + "-" + id + "_Schem\" style=\"border:1px solid black;background-color:#F5F8F9;\" />"+
        "<img onClick=\"removeItem('#"+ itemType + "-" + id + "'); return false;\" src=\"images/del.png\" alt=\"Remove\" style=\"cursor:pointer\" />"+
        "<img id=\"saveEditImg\" onClick=\"saveEdit('#"+ itemType + "-" + id + "'); return false;\" src=\"images/save.png\" alt=\"Save edit\" style=\"cursor:pointer\" />"+
        "</div>"
        );
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}         

function removeItemList(listType,id) {
    $("#" + listType + "-" + id).remove();
    $("#" + listType + "-" + id + "_Property_List").remove();
}

function removeItem(id) {
    $(id).remove();
}

function resetLisings(){
    if (confirm("Reset Form data?")) {
        for (itemListType in itemListTypes) {
            $("#"+ itemListTypes[itemListType] +"_List").empty();
        }
        return true;
    } else {
        return false;
    }
}
                
function setUploadId(itemID){
    uploadId = itemID;
}
                      
function appendProcessToList() {                            			
    itemType= "Repository-" + uploadId + "_Property";
    listName= "Repository-" + uploadId + "_Property_List";
    var id = document.getElementById("id").value;
    processNameId = document.getElementById("processNameId").value;
    algorithmName = "Algorithm";
	             
    $("#"+listName).append("<div class=\"propItem\" id=\"" + itemType + "-" + id + "\">"+
        "<input class=\"propertyName\" type=\"text\" size=\"15\" name=\""+ itemType + "-" + id +"_Name\" id=\"" + itemType + "-" + id + "_Name\" value=\"" + algorithmName +"\" />"+
        "<input class=\"propertyValue\" type=\"text\" size=\"15\" name=\""+ itemType + "-" + id +"_Value\" id=\""+ itemType + "-" + id + "_Value\" value=\"" + processNameId + "\" />"+
        "<img onClick=\"removeItem('#"+ itemType + "-" + id + "'); return false;\" src=\"images/min_icon.png\" width=\"14\" height=\"18\" alt=\"Remove\"/>"+
        "</div>");
	
	                
    var newId = (id - 1) + 2;
    document.getElementById("id").value = newId;
    return id;
}

function edit(id){
    // change the css
    $(id+"> input").css({
        "border":"0.1em solid #4297D7", 
        "background-color":"#F5F8F9"
    });
    // remove the readonly attribute
    $(id+"> input").removeAttr("readonly"); 
                 
    // append the save button
    $(id+" > img#editImg").remove();
    $(id).append($("<img id=\"saveEditImg\" onClick=\"saveEdit('"+ id + "'); return false;\" src=\"images/save.png\" alt=\"Save edit\" style=\"cursor:pointer\" />"));            	 
}

function saveEdit(id){
    $(id+"> input").css({
        "border":"none",
        "background-color":"#CDE2ED"
    }); 

    $(id+"> input").attr("readonly", "readonly"); 
                
    $(id+" > img#saveEditImg").remove();
    $(id).append($("<img id=\"editImg\" onClick=\"edit('"+ id + "'); return false;\" src=\"images/edit.png\" alt=\"Edit\" style=\"cursor:pointer\" />"));
}

function editServerSettings(){
    // display warnings
    $("div#editWarn").show();
                
    // change the css
    $("div#Server_Settings input").css({
        "border":"0.1em solid #4297D7", 
        "background-color":"#F5F8F9"
    });
    // remove the readonly attribute
    $("div#Server_Settings input").removeAttr("readonly"); 
	                
    // append the save button
    $("div#editSave img#editImg").remove();
    $("div#editSave").append($("<img id=\"editImg\" onClick=\"saveEditServerSettings(); return false;\" src=\"images/save.png\" alt=\"Save edit\" style=\"cursor:pointer\" />"));            	 				
}

function saveEditServerSettings(){
    // hide warnings
    $("div#editWarn").hide();

    // change the css
    $("div#Server_Settings input").css({
        "border":"none",
        "background-color":"#CDE2ED"
    });
    // remove the readonly attribute
    $("div#Server_Settings input").attr("readonly", "readonly"); 
	                
    // append the save button
    $("div#editSave img#editImg").remove();
    $("div#editSave").append($("<img id=\"editImg\" onClick=\"editServerSettings(); return false;\" src=\"images/edit.png\" alt=\"Save edit\" style=\"cursor:pointer\" />"));            	 								
}
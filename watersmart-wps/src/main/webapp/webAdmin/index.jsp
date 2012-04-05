<%@ page contentType="text/html" pageEncoding="UTF-8"%>
<%@ page import="org.n52.wps.webadmin.ConfigUploadBean"%>
<%@ page import="org.n52.wps.webadmin.ChangeConfigurationBean"%>
<!DOCTYPE PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<jsp:useBean id="fileUpload" class="org.n52.wps.webadmin.ConfigUploadBean" scope="session" />
<jsp:useBean id="changeConfiguration" class="org.n52.wps.webadmin.ChangeConfigurationBean" scope="session" />
<jsp:setProperty name="changeConfiguration" property="*" />

<% fileUpload.doUpload(request); %>

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>WPS Web Admin</title>

	<link type="text/css" rel="stylesheet" href="css/ui.all.css" media="screen">
	<link type="text/css" rel="stylesheet" href="css/lightbox-form.css">
	
	<script type="text/javascript"	src="resources/lightbox-form.js"></script>
	<script type="text/javascript"	src="resources/jquery.js"></script>
	<script type="text/javascript"	src="resources/jquery-ui.js"></script>
	<script type="text/javascript" 	src="resources/jquery.ajax_upload.js"></script>
	
	<script type="text/javascript" src="js/adminInline.js"></script>
</head>
<body>

	<div style="height: 75px">
		<img style="float: left" src="images/52northlogo_small.png" alt="52northlogo_small" />
		<h1	style="padding-left: 3em; color: #4297d7; font-family: Lucida Grande, Lucida Sans, Arial, sans-serif; font-size: 3em;">Web Admin Console</h1>
	</div>
	<div id="Tabs" class="ui-tabs ui-widget ui-widget-content ui-corner-all">
		<ul>
			<li><a href="#tab-1"><span>WPS Config Configuration</span></a></li>
			<li><a href="#tab-2"><span>WPS Test Client</span></a></li>
		</ul>
		<div id="tab-1">
			<form action="#" method="post" id="saveConfogurationForm">
				<input type="hidden" name="serializedWPSConfiguraton" />
			</form>
			<form action="#" method="get" id="form1" onreset="return resetLisings()">
				<table border="0" cellspacing="0">
					<tr>
						<td><input class="formButtons" id="saveConfBtn" type="button" value="Save and Activate Configuration" name="save" style="border:1px solid black;background:white;" /></td>
						<td><input class="formButtons" id="loadConfBtn" type="button" value="Load Active Configuration" name="load" style="border:1px solid black;background:white;" /></td>
						<td><input class="formButtons" id="upload_button" type="button" value="Upload Configuration File" name="upload" style="border:1px solid black;background:white;" /></td>
						<td><input class="formButtons" type="reset" value="Reset" name="Reset" style="border:1px solid black;background:white;" /></td>
						<td><input class="formButtons" id="upload_process" type="button" value="Upload Process" name="UploadProcess" style="border:1px solid black;background:white;" /></td>
						<!--td><input class="formButtons" id="manage_rem_repos" type="button" value="Update Remote Repositories" name="ManageRemoteRepositories" style="border:1px solid black;background:white;" /></td-->
						<td><input class="formButtons" id="upload_r_script" type="button" value="Upload R Script" name="UploadRScript" style="border:1px solid black;background:white;" /></td>
					</tr>
				</table>
				<div id="sections">
					<div class="section">
						<div class="accHeader" style="text-indent: 40px">Server Settings</div>
						
						<div class="sectionContent">
							<div id="Server_Settings">
								<div id="editSave" style="float:right;"><img id="editImg" src="images/edit.png" onClick="editServerSettings()" style="cursor:pointer;" /></div>
								<p>
									<label for="Server-hostname">Server Host Name:</label><div id="editWarn" style="float: left;display: none; padding-right: 10px;"><img src="images/warn.png" /> Changes only after restart</div>
									<input type="text" name="Server-hostname" value="testValue" readonly/>
									<br style="clear:left;" />
								</p>
								<p>
									<label for="Server-hostport">Server Host Port:</label><div id="editWarn" style="float: left;display: none; padding-right: 10px;"><img src="images/warn.png" /> Changes only after restart</div>
									<input type="text" name="Server-hostport" value="testValue" readonly/>
									<br style="clear:left;" />
								</p>
								<p>
									<label for="Server-includeDataInputsInResponse">Include Datainput:</label>
									<input type="text" name="Server-includeDataInputsInResponse" value="boolean" readonly/>
								</p>
								<p>
									<label for="Server-computationTimeoutMilliSeconds">Computation Timeout:</label>
									<input type="text" name="Server-computationTimeoutMilliSeconds" value="testValue" readonly/>
								</p>
								<p>
									<label for="Server-cacheCapabilites">Cache Capabilities:</label>
									<input type="text" name="Server-cacheCapabilites" value="boolean" readonly/>
								</p>
								<p>
									<label for="Server-webappPath">Web app Path:</label><div id="editWarn" style="float: left;display: none; padding-right: 10px;"><img src="images/warn.png" /> Changes only after restart</div>
									<input type="text" name="Server-webappPath" value="testValue" readonly/>
									<br style="clear:left;" />
								</p>
								<p>
									<label for="Server-repoReloadInterval">Repository Reload Interval: <br/> (In hours. 0 = No Auto Reload)</label><div id="editWarn" style="float: left;display: none; padding-right: 10px;"><img src="images/warn.png" /> Changes only after restart</div>
									<input type="text" name="Server-repoReloadInterval" value="0" readonly/>
									<br style="clear:left;" />
								</p>
								<p></p>
							</div>
						</div>
					</div>
					<div class="section">
						<div class="accHeader" style="text-indent: 40px">Algorithm Repositories</div>
						<div class="sectionContent">
							<input type="hidden" id="id" value="1">
							<div class="lists" id="Repository_List"></div>
							<p class="addListItem">
								<input type="button" value="Add Repository" name="addRepositoryButton" onClick="addNewListItem(itemListTypes[itemListTypeNr.Repository]); return false;" style="border:1px solid black;background:white;" />
							</p>
						</div>
					</div>
					<div class="section">
						<div class="accHeader" style="text-indent: 40px">Parsers</div>
						<div class="sectionContent">
							<div class="lists" id="Parser_List"></div>
							<p class="addListItem">
								<input type="button" value="Add Parser" name="addParserButton" onClick="addNewListItem(itemListTypes[itemListTypeNr.Parser]); return false;" style="border:1px solid black;background:white;" />
							</p>
						</div>
					</div>
					<div class="section">
						<div class="accHeader" style="text-indent: 40px">Generators</div>
						<div class="sectionContent">
							<div class="lists" id="Generator_List"></div>
							<p class="addListItem">
								<input type="button" value="Add Generator" name="addGeneratorButton" onClick="addNewListItem(itemListTypes[itemListTypeNr.Generator]); return false;"  style="border:1px solid black;background:white;" />
							</p>
						</div>
					</div>
					<div class="section">
						<div class="accHeader" style="text-indent: 40px">Remote Repositories</div>
						<div class="sectionContent">
							<div class="lists" id="RemoteRepository_List"></div>
							<p class="addListItem">
								<input type="button" value="Add Remote Repository" name="addRemoteRepositoryButton" onClick="addNewListItem(itemListTypes[itemListTypeNr.RemoteRepository]); return false;"  style="border:1px solid black;background:white;" />
							</p>
						</div>
					</div>
				</div>
			</form>
		</div>
		<div id="tab-2">
			<div style="height: 400px">
				Try the request examples: 
				<a target="_blank" href="../WebProcessingService?Request=GetCapabilities&Service=WPS">GetCapabilities request</a><br><br> 
				WPS TestClient: <br>
				<table>
					<tr>
						<td><b> Server: </b></td>
						<td>
							<form name="form1" method="post" action="">
								<div>
									<input name="url" value="../WebProcessingService" size="90"	type="text">
								</div>
							</form>
						</td>
					</tr>
					<tr>
						<td><b> Request: </b></td>
						<td>
							<form name="form2" method="post" action="" enctype="text/plain">
								<div>
									<textarea name="request" cols="88" rows="15"></textarea>
								</div>
								<input value="   Clear    " name="reset" type="reset"> 
								<input value="   Send    " onclick="form2.action = form1.url.value"	type="submit">
							</form>
						</td>
					</tr>
				</table>
			</div>
		</div>
	</div>
	
	<!-- upload form -->
	
	<div id="filter"></div>
	<div id="box">
		<span id="boxtitle"></span>
		<form method="post" action="index.jsp" enctype="multipart/form-data" onsubmit="return uploadFiles()">
			<input type="hidden" name="uploadProcess" />
			<p>
				Please enter the fuly qualified name of the java class implementing IAlgorithm:<br>
				<input type="text" name="processName" size="30" id="processNameId">
			</p>
			<p>
				Please specify the .java file for the process:<br>
				<input type="file" name="processFile" id="processFile" size="40">
			</p>
			<p>
				Please specify the associated ProcessDescription .xml file
				(optional):<br>
				<input type="file" name="processDescriptionFile" id="processDescriptionFile" size="40" accept="text/xml">
			</p>
			<p>
				<input type="submit" name="submit"> 
				<input type="reset" name="cancel" value="Cancel" onclick="closebox('box')">
			</p>
		</form>
	</div>
	
	<div id="filter"></div>
	<div id="box2">
		<span id="boxtitle"></span>
		<form method="post" action="index.jsp" enctype="multipart/form-data" onsubmit="return uploadRFiles()">
			<input type="hidden" name="uploadRscript" />
			<p>
				Please enter the process name:<br>
				(only if process name should be unlike filename)<br><br>
				<input type="text" name="rProcessName" size="30" id="rProcessNameId">
			</p>
			<p>
				Please enter the location of an annotated R script<br>
				<br>
				<input type="file" name="rProcessFile" id="rProcessFile" size="40">
			</p>
		
			<!--processDescriptionFile currently has no meaning, so it's just hidden-->
			<input type="hidden" name=""rProcessDescriptionFile" id="rProcessDescriptionFile" size="40" accept="text/xml">
			<!--<p>
				Please specify the associated ProcessDescription .xml file
				(optional, not yet implemented):<br>
				<br>
				<input type="file" name=""rProcessDescriptionFile" id="rProcessDescriptionFile" size="40" accept="text/xml">

			</p>-->
			<p>
				<input type="submit" name="submit"> 
				<input type="reset" name="cancel" value="Cancel" onclick="closebox('box2')">
				<br>
				<br>
				<I>Process id will be org.n52.wps.server.r.[filename]
					or org.n52.wps.server.r.[process name]</I>
			</p>
		</form>
	</div>

</body>
</html>
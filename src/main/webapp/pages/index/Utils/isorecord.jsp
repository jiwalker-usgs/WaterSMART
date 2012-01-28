<%@page contentType="text/xml" pageEncoding="UTF-8"%>
<%-- 
    Document   : isorecord
    Created on : Jan 27, 2012, 10:19:02 AM
    Author     : Jordan Walker <jiwalker@usgs.gov>
--%>

<%@page import="java.util.UUID"%>

<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@taglib prefix="joda" uri="http://www.joda.org/joda/time/tags" %>
<% pageContext.setAttribute("now", new org.joda.time.DateTime()); %>


<gmd:MD_Metadata xmlns:gmd="http://www.isotc211.org/2005/gmd"
                 xmlns:srv="http://www.isotc211.org/2005/srv"
                 xmlns:gmx="http://www.isotc211.org/2005/gmx"
                 xmlns:gsr="http://www.isotc211.org/2005/gsr"
                 xmlns:gss="http://www.isotc211.org/2005/gss"
                 xmlns:xs="http://www.w3.org/2001/XMLSchema"
                 xmlns:gts="http://www.isotc211.org/2005/gts"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:gml="http://www.opengis.net/gml/3.2"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 xmlns:gco="http://www.isotc211.org/2005/gco"
                 xmlns:gmi="http://www.isotc211.org/2005/gmi"
                 xmlns:geonet="http://www.fao.org/geonetwork"
                 xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://www.isotc211.org/2005/gmd/gmd.xsd http://www.isotc211.org/2005/srv http://schemas.opengis.net/iso/19139/20060504/srv/srv.xsd">
    <gmd:fileIdentifier>
        <gco:CharacterString><%= UUID.randomUUID().toString()%></gco:CharacterString>
    </gmd:fileIdentifier>
    <gmd:language>
        <gmd:LanguageCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:LanguageCode"
                          codeListValue="eng">eng</gmd:LanguageCode>
    </gmd:language>
    <gmd:characterSet>
        <gmd:MD_CharacterSetCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_CharacterSetCode"
                                 codeListValue="UTF8">UTF8</gmd:MD_CharacterSetCode>
    </gmd:characterSet>
    <gmd:hierarchyLevel>
        <gmd:MD_ScopeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_ScopeCode"
                          codeListValue="dataset">dataset</gmd:MD_ScopeCode>
    </gmd:hierarchyLevel>
    <gmd:hierarchyLevel>
        <gmd:MD_ScopeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_ScopeCode"
                          codeListValue="service">service</gmd:MD_ScopeCode>
    </gmd:hierarchyLevel>
    <gmd:contact>
        <gmd:CI_ResponsibleParty>
            <c:if test="${param['name'] ne null}">
                <gmd:individualName>
                    <gco:CharacterString>${param['name']}</gco:CharacterString>
                </gmd:individualName>
            </c:if>
            <c:if test="${param['orgName'] ne null}">
                <gmd:organisationName>
                    <gco:CharacterString>${param['orgName']}</gco:CharacterString>
                </gmd:organisationName>
            </c:if>
            <gmd:contactInfo>
                <gmd:CI_Contact>
                    <c:if test="${param['email'] ne null}">
                        <gmd:address>
                            <gmd:CI_Address>
                                <gmd:electronicMailAddress>
                                    <gco:CharacterString>${param['email']}</gco:CharacterString>
                                </gmd:electronicMailAddress>
                            </gmd:CI_Address>
                        </gmd:address>
                    </c:if>
                    <c:if test="${param['url'] ne null}">
                        <gmd:onlineResource>
                            <gmd:CI_OnlineResource>
                                <gmd:linkage>
                                    <gmd:URL>${param['url']}</gmd:URL>
                                </gmd:linkage>
                                <gmd:protocol>
                                    <gco:CharacterString>http</gco:CharacterString>
                                </gmd:protocol>
                                <gmd:applicationProfile>
                                    <gco:CharacterString>web browser</gco:CharacterString>
                                </gmd:applicationProfile>
                                <gmd:name>
                                    <gco:CharacterString/>
                                </gmd:name>
                                <gmd:description>
                                    <gco:CharacterString/>
                                </gmd:description>
                                <gmd:function>
                                    <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_OnLineFunctionCode"
                                                               codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                                </gmd:function>
                            </gmd:CI_OnlineResource>
                        </gmd:onlineResource>
                    </c:if>

                </gmd:CI_Contact>
            </gmd:contactInfo>
            <gmd:role>
                <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                 codeListValue="pointOfContact">pointOfContact</gmd:CI_RoleCode>
            </gmd:role>
        </gmd:CI_ResponsibleParty>
    </gmd:contact>
    <gmd:dateStamp>
        <gco:Date><joda:format value="${now}" style="FF" /></gco:Date>
    </gmd:dateStamp>
    <gmd:metadataStandardName>
        <gco:CharacterString>ISO 19115-2 Geographic Information - Metadata Part 2 Extensions for imagery and gridded data</gco:CharacterString>
    </gmd:metadataStandardName>
    <gmd:metadataStandardVersion>
        <gco:CharacterString>ISO 19115-2:2009(E)</gco:CharacterString>

    </gmd:metadataStandardVersion>
    <%--  <gmd:spatialRepresentationInfo>
          <gmd:MD_GridSpatialRepresentation>
             <gmd:numberOfDimensions>
                <gco:Integer>2</gco:Integer>
             </gmd:numberOfDimensions>
             <gmd:axisDimensionProperties>
                <gmd:MD_Dimension>
    
                   <gmd:dimensionName>
                      <gmd:MD_DimensionNameTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_DimensionNameTypeCode"
                                                    codeListValue="column">column</gmd:MD_DimensionNameTypeCode>
                   </gmd:dimensionName>
                   <gmd:dimensionSize>
                      <gco:Integer>462</gco:Integer>
                   </gmd:dimensionSize>
                   <gmd:resolution>
                      <gco:Measure uom="degrees_east">0.125</gco:Measure>
    
                   </gmd:resolution>
                </gmd:MD_Dimension>
             </gmd:axisDimensionProperties>
             <gmd:axisDimensionProperties>
                <gmd:MD_Dimension>
                   <gmd:dimensionName>
                      <gmd:MD_DimensionNameTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_DimensionNameTypeCode"
                                                    codeListValue="row">row</gmd:MD_DimensionNameTypeCode>
                   </gmd:dimensionName>
    
                   <gmd:dimensionSize>
                      <gco:Integer>222</gco:Integer>
                   </gmd:dimensionSize>
                   <gmd:resolution>
                      <gco:Measure uom="degrees_north">0.125</gco:Measure>
                   </gmd:resolution>
                </gmd:MD_Dimension>
             </gmd:axisDimensionProperties>
    
             <gmd:cellGeometry>
                <gmd:MD_CellGeometryCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_CellGeometryCode"
                                         codeListValue="area">area</gmd:MD_CellGeometryCode>
             </gmd:cellGeometry>
             <gmd:transformationParameterAvailability gco:nilReason="unknown"/>
          </gmd:MD_GridSpatialRepresentation>
      </gmd:spatialRepresentationInfo>--%>
    <gmd:identificationInfo>
        <gmd:MD_DataIdentification id="DataIdentification">

            <gmd:citation>
                <gmd:CI_Citation>
                    <c:if test="${param['title'] ne null}">
                        <gmd:title>
                            <gco:CharacterString>${param['title']}</gco:CharacterString>
                        </gmd:title>
                    </c:if>
                    <c:if test="${param['creationDate'] ne null}">
                        <gmd:date>
                            <gmd:CI_Date>
                                <gmd:date>
                                    <gco:DateTime>${param['creationDate']}</gco:DateTime>
                                </gmd:date>
                                <gmd:dateType>
                                    <gmd:CI_DateTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_DateTypeCode"
                                                         codeListValue="creation">creation</gmd:CI_DateTypeCode>
                                </gmd:dateType>
                            </gmd:CI_Date>
                        </gmd:date>
                    </c:if>
                    <gmd:identifier>

                        <gmd:MD_Identifier>
                            <gmd:authority>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>watersmart.usgs.gov</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date gco:nilReason="inapplicable"/>
                                </gmd:CI_Citation>

                            </gmd:authority>
                            <%--                     <gmd:code>
                                                    <gco:CharacterString>cida.usgs.gov/thredds/gmo/GMO</gco:CharacterString>
                                                 </gmd:code>--%>
                        </gmd:MD_Identifier>
                    </gmd:identifier>
                    <gmd:citedResponsibleParty>
                        <gmd:CI_ResponsibleParty>
                            <c:if test="${param['name'] ne null}">
                                <gmd:individualName>
                                    <gco:CharacterString>${param['name']}</gco:CharacterString>
                                </gmd:individualName>
                            </c:if>
                            <c:if test="${param['orgName'] ne null}">
                                <gmd:organisationName>
                                    <gco:CharacterString>${param['orgName']}</gco:CharacterString>
                                </gmd:organisationName>
                            </c:if>
                            <c:if test="${param['email'] ne null} or ${param['url'] ne null}">
                                <gmd:contactInfo>
                                    <gmd:CI_Contact>

                                        <c:if test="${param['email'] ne null}">
                                            <gmd:address>
                                                <gmd:CI_Address>
                                                    <gmd:electronicMailAddress>
                                                        <gco:CharacterString>${param['email']}</gco:CharacterString>
                                                    </gmd:electronicMailAddress>
                                                </gmd:CI_Address>
                                            </gmd:address>
                                        </c:if>
                                        <c:if test="${param['url'] ne null}">
                                            <gmd:onlineResource>

                                                <gmd:CI_OnlineResource>
                                                    <gmd:linkage>
                                                        <gmd:URL>${param['url']}</gmd:URL>
                                                    </gmd:linkage>
                                                    <gmd:protocol>
                                                        <gco:CharacterString>http</gco:CharacterString>
                                                    </gmd:protocol>
                                                    <gmd:applicationProfile>
                                                        <gco:CharacterString>web browser</gco:CharacterString>
                                                    </gmd:applicationProfile>
                                                    <gmd:name>
                                                        <gco:CharacterString/>
                                                    </gmd:name>
                                                    <gmd:description>
                                                        <gco:CharacterString/>
                                                    </gmd:description>
                                                    <gmd:function>
                                                        <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_OnLineFunctionCode"
                                                                                   codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                                                    </gmd:function>
                                                </gmd:CI_OnlineResource>
                                            </gmd:onlineResource>
                                        </c:if>
                                    </gmd:CI_Contact>
                                </gmd:contactInfo>
                            </c:if>
                            <gmd:role>
                                <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                                 codeListValue="originator">originator</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:citedResponsibleParty>
                </gmd:CI_Citation>
            </gmd:citation>
            <c:if test="${param['abstract'] ne null}">
                <gmd:abstract>
                    <gco:CharacterString>${param['abstract']}</gco:CharacterString>
                </gmd:abstract>
            </c:if>
            <c:if test="${param['credit'] ne null}">
                <gmd:credit>
                    <gco:CharacterString>${param['credit']}</gco:CharacterString>
                </gmd:credit>
            </c:if>
            <gmd:pointOfContact>
                <gmd:CI_ResponsibleParty>
                    <c:if test="${param['name'] ne null}">
                        <gmd:individualName>
                            <gco:CharacterString>${param['name']}</gco:CharacterString>
                        </gmd:individualName>
                    </c:if>
                    <c:if test="${param['orgName'] ne null}">
                        <gmd:organisationName>
                            <gco:CharacterString>${param['orgName']}</gco:CharacterString>
                        </gmd:organisationName>
                    </c:if>
                    <c:if test="${param['email'] ne null} or ${param['url'] ne null}">
                        <gmd:contactInfo>
                            <gmd:CI_Contact>

                                <c:if test="${param['email'] ne null}">
                                    <gmd:address>
                                        <gmd:CI_Address>
                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>${param['email']}</gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                </c:if>
                                <c:if test="${param['url'] ne null}">
                                    <gmd:onlineResource>

                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>
                                                <gmd:URL>${param['url']}</gmd:URL>
                                            </gmd:linkage>
                                            <gmd:protocol>
                                                <gco:CharacterString>http</gco:CharacterString>
                                            </gmd:protocol>
                                            <gmd:applicationProfile>
                                                <gco:CharacterString>web browser</gco:CharacterString>
                                            </gmd:applicationProfile>
                                            <gmd:name>
                                                <gco:CharacterString/>
                                            </gmd:name>
                                            <gmd:description>
                                                <gco:CharacterString/>
                                            </gmd:description>
                                            <gmd:function>
                                                <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_OnLineFunctionCode"
                                                                           codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                                            </gmd:function>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onlineResource>
                                </c:if>
                            </gmd:CI_Contact>
                        </gmd:contactInfo>
                    </c:if>
                    <gmd:role>
                        <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                         codeListValue="pointOfContact">pointOfContact</gmd:CI_RoleCode>
                    </gmd:role>
                </gmd:CI_ResponsibleParty>
            </gmd:pointOfContact>
            <gmd:descriptiveKeywords>
                <gmd:MD_Keywords>
                    <c:forEach items="${param['keywords']}" var="keyword">
                        <gmd:keyword>
                            <gco:CharacterString>${keyword}</gco:CharacterString>
                        </gmd:keyword>
                    </c:forEach>
                    <gmd:type>
                        <gmd:MD_KeywordTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_KeywordTypeCode"
                                                codeListValue="theme">theme</gmd:MD_KeywordTypeCode>
                    </gmd:type>
                    <%--                    <gmd:thesaurusName>
                                            <gmd:CI_Citation>
                                                <gmd:title>
                                                    <gco:CharacterString>GCMD Science Keywords</gco:CharacterString>
                                                </gmd:title>
                                                <gmd:date gco:nilReason="unknown"/>
                                            </gmd:CI_Citation>

                    </gmd:thesaurusName>--%>
                </gmd:MD_Keywords>
            </gmd:descriptiveKeywords>
            <gmd:descriptiveKeywords>
                <gmd:MD_Keywords>
                    <gmd:keyword>
                        <gmd:keyword>
                            <gco:CharacterString>WaterSMART</gco:CharacterString>
                        </gmd:keyword>
                    </gmd:keyword>
                    <gmd:type>

                        <gmd:MD_KeywordTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_KeywordTypeCode"
                                                codeListValue="project">project</gmd:MD_KeywordTypeCode>
                    </gmd:type>
                    <gmd:thesaurusName gco:nilReason="unknown"/>
                </gmd:MD_Keywords>
            </gmd:descriptiveKeywords>
            <gmd:resourceConstraints>
                <gmd:MD_LegalConstraints>
                    <gmd:useLimitation>
                        <gco:CharacterString>Freely available</gco:CharacterString>
                    </gmd:useLimitation>
                </gmd:MD_LegalConstraints>
            </gmd:resourceConstraints>
            <%--gmd:aggregationInfo>

                <gmd:MD_AggregateInformation>
                    <gmd:aggregateDataSetName>
                        <gmd:CI_Citation>
                            <gmd:title>
                                <gco:CharacterString/>
                            </gmd:title>
                            <gmd:date gco:nilReason="inapplicable"/>
                        </gmd:CI_Citation>
                    </gmd:aggregateDataSetName>

                    <gmd:associationType>
                        <gmd:DS_AssociationTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:DS_AssociationTypeCode"
                                                    codeListValue="largerWorkCitation">largerWorkCitation</gmd:DS_AssociationTypeCode>
                    </gmd:associationType>
                    <gmd:initiativeType>
                        <gmd:DS_InitiativeTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:DS_InitiativeTypeCode"
                                                   codeListValue="project">project</gmd:DS_InitiativeTypeCode>
                    </gmd:initiativeType>
                </gmd:MD_AggregateInformation>
            </gmd:aggregationInfo>

            <gmd:aggregationInfo>
                <gmd:MD_AggregateInformation>
                    <gmd:aggregateDataSetIdentifier>
                        <gmd:MD_Identifier>
                            <gmd:authority>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>Unidata Common Data Model</gco:CharacterString>

                                    </gmd:title>
                                    <gmd:date gco:nilReason="inapplicable"/>
                                </gmd:CI_Citation>
                            </gmd:authority>
                            <gmd:code>
                                <gco:CharacterString>Grid</gco:CharacterString>
                            </gmd:code>
                        </gmd:MD_Identifier>

                    </gmd:aggregateDataSetIdentifier>
                    <gmd:associationType>
                        <gmd:DS_AssociationTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:DS_AssociationTypeCode"
                                                    codeListValue="largerWorkCitation">largerWorkCitation</gmd:DS_AssociationTypeCode>
                    </gmd:associationType>
                    <gmd:initiativeType>
                        <gmd:DS_InitiativeTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:DS_InitiativeTypeCode"
                                                   codeListValue="project">project</gmd:DS_InitiativeTypeCode>
                    </gmd:initiativeType>
                </gmd:MD_AggregateInformation>

            </gmd:aggregationInfo--%>
            <gmd:language>
                <gco:CharacterString>eng</gco:CharacterString>
            </gmd:language>
            <gmd:topicCategory>
                <gmd:MD_TopicCategoryCode>inlandWaters</gmd:MD_TopicCategoryCode>
            </gmd:topicCategory>
            <gmd:extent>

                <gmd:EX_Extent id="boundingExtent">
                    <c:if test="${param['bboxw'] ne null} and ${param['bboxs'] ne null} and ${param['bboxe'] ne null} and ${param['bboxn'] ne null}">
                        <gmd:geographicElement>
                            <gmd:EX_GeographicBoundingBox id="boundingGeographicBoundingBox">
                                <gmd:extentTypeCode>
                                    <gco:Boolean>1</gco:Boolean>
                                </gmd:extentTypeCode>
                                <gmd:westBoundLongitude>
                                    <gco:Decimal>${param['bboxw']}</gco:Decimal>
                                </gmd:westBoundLongitude>
                                <gmd:eastBoundLongitude>
                                    <gco:Decimal>${param['bboxe']}</gco:Decimal>
                                </gmd:eastBoundLongitude>
                                <gmd:southBoundLatitude>
                                    <gco:Decimal>${param['bboxs']}</gco:Decimal>
                                </gmd:southBoundLatitude>
                                <gmd:northBoundLatitude>
                                    <gco:Decimal>${param['bboxn']}</gco:Decimal>
                                </gmd:northBoundLatitude>
                            </gmd:EX_GeographicBoundingBox>
                        </gmd:geographicElement>
                    </c:if>
                    <c:if test="${param['timeStart'] ne null} and ${param['timeEnd'] ne null}">
                        <gmd:temporalElement>
                            <gmd:EX_TemporalExtent id="boundingTemporalExtent">
                                <gmd:extent>
                                    <gml:TimePeriod gml:id="d3">
                                        <gml:description>seconds</gml:description>
                                        <gml:beginPosition>${param['timeStart']}</gml:beginPosition>
                                        <gml:endPosition>${param['timeEnd']}</gml:endPosition>
                                    </gml:TimePeriod>
                                </gmd:extent>
                            </gmd:EX_TemporalExtent>
                        </gmd:temporalElement>
                    </c:if>
                </gmd:EX_Extent>
            </gmd:extent>
        </gmd:MD_DataIdentification>
    </gmd:identificationInfo>
            <%--
    <gmd:identificationInfo>
        <srv:SV_ServiceIdentification id="OPeNDAP">
            <gmd:citation>
                <gmd:CI_Citation>
                    <gmd:title>

                        <gco:CharacterString>Gridded Observed Meteorological Data, 1950-1999</gco:CharacterString>
                    </gmd:title>
                    <gmd:date>
                        <gmd:CI_Date>
                            <gmd:date>
                                <gco:DateTime>2005-09-22T00:00</gco:DateTime>
                            </gmd:date>
                            <gmd:dateType>

                                <gmd:CI_DateTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_DateTypeCode"
                                                     codeListValue="creation">creation</gmd:CI_DateTypeCode>
                            </gmd:dateType>
                        </gmd:CI_Date>
                    </gmd:date>
                    <gmd:citedResponsibleParty>
                        <gmd:CI_ResponsibleParty>
                            <gmd:individualName>
                                <gco:CharacterString>E. Maurer</gco:CharacterString>

                            </gmd:individualName>
                            <gmd:organisationName>
                                <gco:CharacterString>Civil Engineering Department - Santa Clara University</gco:CharacterString>
                            </gmd:organisationName>
                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:address>
                                        <gmd:CI_Address>

                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>emaurer@engr.scu.edu</gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                    <gmd:onlineResource>
                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>

                                                <gmd:URL>http://www.engr.scu.edu/~emaurer/data.shtml</gmd:URL>
                                            </gmd:linkage>
                                            <gmd:protocol>
                                                <gco:CharacterString>http</gco:CharacterString>
                                            </gmd:protocol>
                                            <gmd:applicationProfile>
                                                <gco:CharacterString>web browser</gco:CharacterString>

                                            </gmd:applicationProfile>
                                            <gmd:name>
                                                <gco:CharacterString/>
                                            </gmd:name>
                                            <gmd:description>
                                                <gco:CharacterString/>
                                            </gmd:description>
                                            <gmd:function>
                                                <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_OnLineFunctionCode"
                                                                           codeListValue="information">information</gmd:CI_OnLineFunctionCode>

                                            </gmd:function>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onlineResource>
                                </gmd:CI_Contact>
                            </gmd:contactInfo>
                            <gmd:role>
                                <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                                 codeListValue="originator">originator</gmd:CI_RoleCode>
                            </gmd:role>

                        </gmd:CI_ResponsibleParty>
                    </gmd:citedResponsibleParty>
                </gmd:CI_Citation>
            </gmd:citation>
            <gmd:abstract>
                <gco:CharacterString/>
            </gmd:abstract>
            <srv:serviceType>
                <gco:LocalName>THREDDS OPeNDAP</gco:LocalName>

            </srv:serviceType>
            <srv:extent>
                <gmd:EX_Extent>
                    <gmd:geographicElement>
                        <gmd:EX_GeographicBoundingBox>
                            <gmd:extentTypeCode>
                                <gco:Boolean>1</gco:Boolean>
                            </gmd:extentTypeCode>

                            <gmd:westBoundLongitude>
                                <gco:Decimal>-124.6875</gco:Decimal>
                            </gmd:westBoundLongitude>
                            <gmd:eastBoundLongitude>
                                <gco:Decimal>-67.0625</gco:Decimal>
                            </gmd:eastBoundLongitude>
                            <gmd:southBoundLatitude>
                                <gco:Decimal>25.1875</gco:Decimal>

                            </gmd:southBoundLatitude>
                            <gmd:northBoundLatitude>
                                <gco:Decimal>52.8125</gco:Decimal>
                            </gmd:northBoundLatitude>
                        </gmd:EX_GeographicBoundingBox>
                    </gmd:geographicElement>
                    <gmd:temporalElement>
                        <gmd:EX_TemporalExtent>

                            <gmd:extent>
                                <gml:TimePeriod gml:id="d3e65">
                                    <gml:beginPosition>1950-01-01T00:00:00Z</gml:beginPosition>
                                    <gml:endPosition>1999-12-31T00:00:00Z</gml:endPosition>
                                </gml:TimePeriod>
                            </gmd:extent>
                        </gmd:EX_TemporalExtent>
                    </gmd:temporalElement>

                </gmd:EX_Extent>
            </srv:extent>
            <srv:couplingType>
                <srv:SV_CouplingType codeList="http://www.tc211.org/ISO19139/resources/codeList.xml#SV_CouplingType"
                                     codeListValue="tight">tight</srv:SV_CouplingType>
            </srv:couplingType>
            <srv:containsOperations>
                <srv:SV_OperationMetadata>
                    <srv:operationName>

                        <gco:CharacterString>OPeNDAPDatasetQueryAndAccess</gco:CharacterString>
                    </srv:operationName>
                    <srv:DCP gco:nilReason="unknown"/>
                    <srv:connectPoint>
                        <gmd:CI_OnlineResource>
                            <gmd:linkage>
                                <gmd:URL>dods://igsarm-cida-thredds1.er.usgs.gov:8080/thredds/dodsC/gmo/GMO_w_meta.ncml</gmd:URL>
                            </gmd:linkage>

                            <gmd:name>
                                <gco:CharacterString>OPeNDAP</gco:CharacterString>
                            </gmd:name>
                            <gmd:description>
                                <gco:CharacterString>THREDDS OPeNDAP</gco:CharacterString>
                            </gmd:description>
                            <gmd:function>
                                <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                           codeListValue="download">download</gmd:CI_OnLineFunctionCode>

                            </gmd:function>
                        </gmd:CI_OnlineResource>
                    </srv:connectPoint>
                </srv:SV_OperationMetadata>
            </srv:containsOperations>
            <srv:operatesOn xlink:href="#DataIdentification"/>
        </srv:SV_ServiceIdentification>
    </gmd:identificationInfo>
    <gmd:identificationInfo>

        <srv:SV_ServiceIdentification id="OGC-WMS">
            <gmd:citation>
                <gmd:CI_Citation>
                    <gmd:title>
                        <gco:CharacterString>Gridded Observed Meteorological Data, 1950-1999</gco:CharacterString>
                    </gmd:title>
                    <gmd:date>
                        <gmd:CI_Date>

                            <gmd:date>
                                <gco:DateTime>2005-09-22T00:00</gco:DateTime>
                            </gmd:date>
                            <gmd:dateType>
                                <gmd:CI_DateTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_DateTypeCode"
                                                     codeListValue="creation">creation</gmd:CI_DateTypeCode>
                            </gmd:dateType>
                        </gmd:CI_Date>
                    </gmd:date>

                    <gmd:citedResponsibleParty>
                        <gmd:CI_ResponsibleParty>
                            <gmd:individualName>
                                <gco:CharacterString>E. Maurer</gco:CharacterString>
                            </gmd:individualName>
                            <gmd:organisationName>
                                <gco:CharacterString>Civil Engineering Department - Santa Clara University</gco:CharacterString>
                            </gmd:organisationName>

                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:address>
                                        <gmd:CI_Address>
                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>emaurer@engr.scu.edu</gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>

                                    </gmd:address>
                                    <gmd:onlineResource>
                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>
                                                <gmd:URL>http://www.engr.scu.edu/~emaurer/data.shtml</gmd:URL>
                                            </gmd:linkage>
                                            <gmd:protocol>
                                                <gco:CharacterString>http</gco:CharacterString>

                                            </gmd:protocol>
                                            <gmd:applicationProfile>
                                                <gco:CharacterString>web browser</gco:CharacterString>
                                            </gmd:applicationProfile>
                                            <gmd:name>
                                                <gco:CharacterString/>
                                            </gmd:name>
                                            <gmd:description>

                                                <gco:CharacterString/>
                                            </gmd:description>
                                            <gmd:function>
                                                <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_OnLineFunctionCode"
                                                                           codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                                            </gmd:function>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onlineResource>
                                </gmd:CI_Contact>

                            </gmd:contactInfo>
                            <gmd:role>
                                <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                                 codeListValue="originator">originator</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:citedResponsibleParty>
                </gmd:CI_Citation>
            </gmd:citation>

            <gmd:abstract>
                <gco:CharacterString/>
            </gmd:abstract>
            <srv:serviceType>
                <gco:LocalName>Open Geospatial Consortium Web Map Service (WMS)</gco:LocalName>
            </srv:serviceType>
            <srv:extent>
                <gmd:EX_Extent>

                    <gmd:geographicElement>
                        <gmd:EX_GeographicBoundingBox>
                            <gmd:extentTypeCode>
                                <gco:Boolean>1</gco:Boolean>
                            </gmd:extentTypeCode>
                            <gmd:westBoundLongitude>
                                <gco:Decimal>-124.6875</gco:Decimal>
                            </gmd:westBoundLongitude>

                            <gmd:eastBoundLongitude>
                                <gco:Decimal>-67.0625</gco:Decimal>
                            </gmd:eastBoundLongitude>
                            <gmd:southBoundLatitude>
                                <gco:Decimal>25.1875</gco:Decimal>
                            </gmd:southBoundLatitude>
                            <gmd:northBoundLatitude>
                                <gco:Decimal>52.8125</gco:Decimal>

                            </gmd:northBoundLatitude>
                        </gmd:EX_GeographicBoundingBox>
                    </gmd:geographicElement>
                    <gmd:temporalElement>
                        <gmd:EX_TemporalExtent>
                            <gmd:extent>
                                <gml:TimePeriod gml:id="d3e66">
                                    <gml:beginPosition>1950-01-01T00:00:00Z</gml:beginPosition>

                                    <gml:endPosition>1999-12-31T00:00:00Z</gml:endPosition>
                                </gml:TimePeriod>
                            </gmd:extent>
                        </gmd:EX_TemporalExtent>
                    </gmd:temporalElement>
                </gmd:EX_Extent>
            </srv:extent>
            <srv:couplingType>

                <srv:SV_CouplingType codeList="http://www.tc211.org/ISO19139/resources/codeList.xml#SV_CouplingType"
                                     codeListValue="tight">tight</srv:SV_CouplingType>
            </srv:couplingType>
            <srv:containsOperations>
                <srv:SV_OperationMetadata>
                    <srv:operationName>
                        <gco:CharacterString>GetCapabilities</gco:CharacterString>
                    </srv:operationName>
                    <srv:DCP gco:nilReason="unknown"/>

                    <srv:connectPoint>
                        <gmd:CI_OnlineResource>
                            <gmd:linkage>
                                <gmd:URL>http://cida.usgs.gov/ArcGIS/services/Eighth_Degree_Grid/MapServer/WMSServer</gmd:URL>
                            </gmd:linkage>
                            <gmd:name>
                                <gco:CharacterString>OGC-WMS</gco:CharacterString>
                            </gmd:name>

                            <gmd:description>
                                <gco:CharacterString>Open Geospatial Consortium Web Map Service (WMS)</gco:CharacterString>
                            </gmd:description>
                            <gmd:function>
                                <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                           codeListValue="download">download</gmd:CI_OnLineFunctionCode>
                            </gmd:function>
                        </gmd:CI_OnlineResource>
                    </srv:connectPoint>

                </srv:SV_OperationMetadata>
            </srv:containsOperations>
            <srv:operatesOn xlink:href="#DataIdentification"/>
        </srv:SV_ServiceIdentification>
    </gmd:identificationInfo>
            --%>
            <%--
    <gmd:contentInfo>
        <gmd:MD_CoverageDescription>
            <gmd:attributeDescription gco:nilReason="unknown"/>
            <gmd:contentType>

                <gmd:MD_CoverageContentTypeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_CoverageContentTypeCode"
                                                codeListValue="physicalMeasurement">physicalMeasurement</gmd:MD_CoverageContentTypeCode>
            </gmd:contentType>
            <gmd:dimension>
                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>
                                <gco:CharacterString>bounds_latitude</gco:CharacterString>

                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>
                                    <gco:aName>
                                        <gco:CharacterString>double</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>
                            </gco:attributeType>

                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>
                        <gco:CharacterString/>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#"/>
                </gmd:MD_Band>
            </gmd:dimension>
            <gmd:dimension>

                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>
                                <gco:CharacterString>bounds_longitude</gco:CharacterString>
                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>

                                    <gco:aName>
                                        <gco:CharacterString>double</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>
                            </gco:attributeType>
                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>

                        <gco:CharacterString/>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#"/>
                </gmd:MD_Band>
            </gmd:dimension>
            <gmd:dimension>
                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>

                            <gco:aName>
                                <gco:CharacterString>Prcp</gco:CharacterString>
                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>
                                    <gco:aName>
                                        <gco:CharacterString>float</gco:CharacterString>
                                    </gco:aName>

                                </gco:TypeName>
                            </gco:attributeType>
                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>
                        <gco:CharacterString>daily_avg_precipitation</gco:CharacterString>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#mm/d"/>

                </gmd:MD_Band>
            </gmd:dimension>
            <gmd:dimension>
                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>
                                <gco:CharacterString>Tavg</gco:CharacterString>

                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>
                                    <gco:aName>
                                        <gco:CharacterString>float</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>
                            </gco:attributeType>

                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>
                        <gco:CharacterString>daily_avg_air_temp</gco:CharacterString>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#C"/>
                </gmd:MD_Band>
            </gmd:dimension>

            <gmd:dimension>
                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>
                                <gco:CharacterString>Tmax</gco:CharacterString>
                            </gco:aName>
                            <gco:attributeType>

                                <gco:TypeName>
                                    <gco:aName>
                                        <gco:CharacterString>float</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>
                            </gco:attributeType>
                        </gco:MemberName>
                    </gmd:sequenceIdentifier>

                    <gmd:descriptor>
                        <gco:CharacterString>daily_max_air_temp</gco:CharacterString>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#C"/>
                </gmd:MD_Band>
            </gmd:dimension>
            <gmd:dimension>
                <gmd:MD_Band>

                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>
                                <gco:CharacterString>Tmin</gco:CharacterString>
                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>
                                    <gco:aName>

                                        <gco:CharacterString>float</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>
                            </gco:attributeType>
                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>
                        <gco:CharacterString>daily_min_air_temp</gco:CharacterString>

                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#C"/>
                </gmd:MD_Band>
            </gmd:dimension>
            <gmd:dimension>
                <gmd:MD_Band>
                    <gmd:sequenceIdentifier>
                        <gco:MemberName>
                            <gco:aName>

                                <gco:CharacterString>Wind</gco:CharacterString>
                            </gco:aName>
                            <gco:attributeType>
                                <gco:TypeName>
                                    <gco:aName>
                                        <gco:CharacterString>float</gco:CharacterString>
                                    </gco:aName>
                                </gco:TypeName>

                            </gco:attributeType>
                        </gco:MemberName>
                    </gmd:sequenceIdentifier>
                    <gmd:descriptor>
                        <gco:CharacterString>daily_avg_wind_speed</gco:CharacterString>
                    </gmd:descriptor>
                    <gmd:units xlink:href="http://someUnitsDictionary.xml#m/s"/>
                </gmd:MD_Band>

            </gmd:dimension>
        </gmd:MD_CoverageDescription>
    </gmd:contentInfo>
            --%>
            <%--
    <gmd:distributionInfo>
        <gmd:MD_Distribution>
            <gmd:distributor>
                <gmd:MD_Distributor>
                    <gmd:distributorContact>
                        <gmd:CI_ResponsibleParty>
                            <gmd:individualName gco:nilReason="missing"/>
                            <gmd:organisationName>
                                <gco:CharacterString>CIDA</gco:CharacterString>
                            </gmd:organisationName>
                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:address>
                                        <gmd:CI_Address>

                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>dblodgett@usgs.gov</gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                </gmd:CI_Contact>
                            </gmd:contactInfo>
                            <gmd:role>

                                <gmd:CI_RoleCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:CI_RoleCode"
                                                 codeListValue="publisher">publisher</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:distributorContact>
                    <gmd:distributorFormat>
                        <gmd:MD_Format>
                            <gmd:name>
                                <gco:CharacterString>OPeNDAP</gco:CharacterString>

                            </gmd:name>
                            <gmd:version gco:nilReason="unknown"/>
                        </gmd:MD_Format>
                    </gmd:distributorFormat>
                    <gmd:distributorTransferOptions>
                        <gmd:MD_DigitalTransferOptions>
                            <gmd:onLine>
                                <gmd:CI_OnlineResource>
                                    <gmd:linkage>

                                        <gmd:URL>http://internal.cida.usgs.gov/thredds/dodsC/gmo/GMO_w_meta.ncml.html</gmd:URL>
                                    </gmd:linkage>
                                    <gmd:name>
                                        <gco:CharacterString>File Information</gco:CharacterString>
                                    </gmd:name>
                                    <gmd:description>
                                        <gco:CharacterString>This URL provides a standard OPeNDAP html interface
                                            for selecting data from this dataset. Change the extension to .info
                                            for a description of the dataset.</gco:CharacterString>

                                    </gmd:description>
                                    <gmd:function>
                                        <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                                   codeListValue="download">download</gmd:CI_OnLineFunctionCode>
                                    </gmd:function>
                                </gmd:CI_OnlineResource>
                            </gmd:onLine>
                        </gmd:MD_DigitalTransferOptions>
                    </gmd:distributorTransferOptions>

                    <gmd:distributorTransferOptions>
                        <gmd:MD_DigitalTransferOptions>
                            <gmd:onLine>
                                <gmd:CI_OnlineResource>
                                    <gmd:linkage>
                                        <gmd:URL>http://www.ncdc.noaa.gov/oa/wct/wct-jnlp-beta.php?singlefile=http://internal.cida.usgs.gov/thredds/dodsC/gmo/GMO_w_meta.ncml</gmd:URL>
                                    </gmd:linkage>
                                    <gmd:name>

                                        <gco:CharacterString>Viewer Information</gco:CharacterString>
                                    </gmd:name>
                                    <gmd:description>
                                        <gco:CharacterString>This URL provides an NCDC climate and weather toolkit view of an OPeNDAP
                                            resource.</gco:CharacterString>
                                    </gmd:description>
                                    <gmd:function>
                                        <gmd:CI_OnLineFunctionCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#CI_PresentationFormCode"
                                                                   codeListValue="mapDigital">mapDigital</gmd:CI_OnLineFunctionCode>

                                    </gmd:function>
                                </gmd:CI_OnlineResource>
                            </gmd:onLine>
                        </gmd:MD_DigitalTransferOptions>
                    </gmd:distributorTransferOptions>
                </gmd:MD_Distributor>
            </gmd:distributor>
        </gmd:MD_Distribution>
    </gmd:distributionInfo>

    <gmd:dataQualityInfo>
        <gmd:DQ_DataQuality>
            <gmd:scope>
                <gmd:DQ_Scope>
                    <gmd:level>
                        <gmd:MD_ScopeCode codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#gmd:MD_ScopeCode"
                                          codeListValue="dataset">dataset</gmd:MD_ScopeCode>
                    </gmd:level>
                </gmd:DQ_Scope>

            </gmd:scope>
            <gmd:lineage>
                <gmd:LI_Lineage>
                    <gmd:statement>
                        <gco:CharacterString>2002 - created by E Maurer et. al. 2007 - converted to netCDF by E Maurer      2010-04-23 - D Blodgett added attributes for dataset discovery</gco:CharacterString>
                    </gmd:statement>
                </gmd:LI_Lineage>
            </gmd:lineage>

        </gmd:DQ_DataQuality>
    </gmd:dataQualityInfo>
    <gmd:metadataMaintenance>
        <gmd:MD_MaintenanceInformation>
            <gmd:maintenanceAndUpdateFrequency gco:nilReason="unknown"/>
            <gmd:maintenanceNote>
                <gco:CharacterString>This record was translated from NcML using UnidataDD2MI.xsl Version 2.2</gco:CharacterString>
            </gmd:maintenanceNote>

        </gmd:MD_MaintenanceInformation>
    </gmd:metadataMaintenance>
            --%>
</gmd:MD_Metadata>
# wps.des: id=nwc_swe_csv_stats, title = Daily Flow Statistics for SWE CSV Sources, abstract = Calculates a suite of daily flow statistics;
# wps.in: sites, string, SOS Site Identifiers, A comma seperated list of the SOS site identifiers to be called;
# wps.in: startdate, string, Start Date, The start date for analysis;
# wps.in: enddate, string, End Date, The end date for analysis;
# wps.in: stats, string, Statistic Groups, A list of statistic groups chosen from magnifSeven magStat flowStat durStat timStat rateStat otherStat;
# wps.in: sos, string, SOS URL, The URL for the CWE CSV SOS;
# wps.in: observedProperty, string, ObservedProperty, The observed property identifier for daily streamflow from the SOS;
# wps.in: wfsUrl, string, wfsUrl, The WFS base url where drainage area can be found;
# wps.in: wfsTypename, string, wfsTypename, The WFS type or layer name where drainage area can be found;
# wps.in: wfsFilterProperty, string, wfsFilterProperty, The WFS property to be filtered by site to find drainage area for the given site;
# wps.in: wfsAreaPropertyname, string, wfsAreaPropertyname, The WFS property to be queried for the given site to find drainage area;

library(NWCCompare)

##Inputs: uncomment for non Rserve execuation.##
# Note that this: http://cida-wiwsc-wsqa.er.usgs.gov:8081/thredds/sos/watersmart/HUC12_data/HUC12_Q.nc?request=GetObservation&service=SOS&version=1.0.0&observedProperty=MEAN_streamflow&offering=030601010101&eventTime=2008-10-01T00:00:00Z/2010-09-30T00:00:00Z should work, but doesn't actually filter time.
# sites<-"031401020800,031401020800"
# startdate <- "2008-10-01"
# enddate <- "2010-09-29"
# stats<-"magnifSeven,magStat,flowStat,durStat,timStat,rateStat,otherStat"
# sos<-"http://cida-wiwsc-wsqa.er.usgs.gov:8081/thredds/sos/watersmart/HUC12_data/HUC12_Q.nc"
# observedProperty="MEAN_streamflow"
# wfsUrl<-'http://cida.usgs.gov/nwc/geoserver/NHDPlusHUCs/ows'
# wfsTypename='NHDPlusHUCs:huc12_SE_Basins_v2'
# wfsFilterProperty='NHDPlusHUCs:HUC12'
# wfsAreaPropertyname='NHDPlusHUCs:mi2'
##End Inputs##

sites<-read.csv(header=F,colClasses=c("character"),text=sites)
statsout <- calculateStatsGroupsSWE(stats, sites, sos, startdate, enddate, observedProperty, wfsUrl, wfsTypename, wfsFilterProperty,wfsAreaPropertyname)
output = "output.txt"
write.table(statsout, file = output, col.names = TRUE, row.names = FALSE, quote = FALSE, sep = "\t")

# wps.out: output, text, Output File, A text file containing the table of statistics as well as monthly stats and graphs for each site;
# wps.des: id=test_stats, title = test stats, abstract = Finds the mean daily flow median daily flow and skewness of daily flow in the input dataset;
# wps.in: model_url, string, SOS Endpoint, A fully formed SOS GetObservations request that will return a SWE common CSV block holding date and flow;
# wps.in: stats, string, list, a list of the requested statistic groups to return;

library(EflowStats)
library(NWCCompare)

## Inputs: uncomment for non Rserve execution. ##
#stats<-"rateStat,magnifSeven,magStat,flowStat,durStat,timStat"
#model_url="http://cida.usgs.gov/nwc/thredds/sos/watersmart/stats/stats-SE-DENSE2-2.03.nc?request=GetObservation&service=SOS&version=1.0.0&offering"
## end inputs ##

nwisDvUrl <- "http://waterservices.usgs.gov/nwis/dv/?format=waterml,1.1&sites="
offering <- "00003"
property <- "00060"
drainage_url <- "http://waterservices.usgs.gov/nwis/site/?siteOutput=Expanded&site="
scenario_url <- paste(substr(model_url,1,regexpr("Get",model_url)-1),"GetCapabilities&service=SOS&version=1.0.0",sep="")

getcap<-getScenarioSites(scenario_url)
modprop<-getcap$modprop
sites<-getcap$scenario_sites
sites <- paste(sites,collapse=",")

sites<-read.csv(header=F,colClasses=c("character"),text=sites)
dates <- getScenarioDates(scenario_url)
startdate <- dates[1]
enddate <- dates[2]

x_urls<-paste(nwisDvUrl, sites, "&startDT=", startdate, "&endDT=", enddate, "&statCd=", offering, "&parameterCd=", property, sep = "")
d_urls<-paste(drainage_url, sites, sep = "")
m_urls<-paste(model_url,'=',sites,'&observedProperty=',modprop,sep='',collapse=NULL)
statsout <- calculateStatsDiffs(sites, startdate, enddate, getXMLWML1.1Data, x_urls, getDrainageArea, d_urls, SWE_CSV_IHA, m_urls)
cat("statsout created and named \n")
output="output.zip"
if (nrow(statsout)==length(sites)) {
  write.table(statsout,file="output.txt",col.names=TRUE, row.names=FALSE, quote=FALSE, sep="\t")
  system("rm output.zip")
  system("zip -r output output*")
} else { 
  output="output.zip" 
  message<-"One or more web service calls resulted in failure. Please try again."
  write.table(message,file="output.txt",col.names=FALSE,row.names=FALSE,quote=FALSE)
}

# wps.out: output, zip, output_file, A file containing the table of statistics as well as monthly stats and graphs for each site;

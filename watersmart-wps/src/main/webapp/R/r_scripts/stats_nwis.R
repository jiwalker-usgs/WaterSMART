# wps.des: id=nwc_stats_observed, title = Observed Daily Flow Statistics, abstract = Calculates a suite of daily flow statistics;
# wps.in: sites, string, NWIS Sites, A comma seperated list of NWIS site ids;
# wps.in: startdate, string, Start Date, The start date for analysis;
# wps.in: enddate, string, End Date, The end date for analysis;
# wps.in: stats, string, Statistic Groups, A list of statistic groups chosen from GOF GOFMonth magnifSeven magStat flowStat durStat timStat rateStat otherStat;

library(NWCCompare)

## Inputs: uncomment for non Rserve execuation. ##
# sites <- '02177000,02178400'
# startdate <- "2008-10-01"
# enddate <- "2013-09-29"
# stats<-"magnifSeven,magStat,flowStat,durStat,timStat,rateStat,otherStat"
## end inputs ##

sites<-read.csv(header=F,colClasses=c("character"),text=sites)
statsout <- calculateStatsGroupsNWIS(stats, sites, startdate, enddate)
output = "output.txt"
write.table(statsout, file = output, col.names = TRUE, row.names = FALSE, quote = FALSE, sep = "\t")

# wps.out: output, text, Output File, A text file containing the table of statistics as well as monthly stats and graphs for each site;
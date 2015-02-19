# wps.des: id=simple_monthly_stats, title = Simple Monthly Flow Statistics, abstract = Finds the mean and median annual and monthly statistics for a monthly flow record as well as the deciles;
# wps.in: model_url, string, SOS Endpoint, A fully formed SOS GetObservations request that will return a SWE common CSV block holding date and flow;

# model_url = 'http://cida.usgs.gov/glri/afinch/thredds/out.nc?service=SOS&request=GetObservation&Version=1.0.0&offering=12006839&observedProperty=QAccCon'

library(EflowStats)
library(NWCCompare)

deciles <- function(x) {
  isolateq <- x$discharge
  sortq <- sort(isolateq)
  deciles<-matrix(nrow=9,ncol=2)
  deciles[1:9,1] <- seq(0.1,0.9,by=.1)
  deciles[1,2] <- sortq[floor(findrank(length(sortq),0.9))]
  deciles[2,2] <- sortq[floor(findrank(length(sortq),0.8))]
  deciles[3,2] <- sortq[floor(findrank(length(sortq),0.7))]
  deciles[4,2] <- sortq[floor(findrank(length(sortq),0.6))]
  deciles[5,2] <- sortq[floor(findrank(length(sortq),0.5))]
  deciles[6,2] <- sortq[floor(findrank(length(sortq),0.4))]
  deciles[7,2] <- sortq[floor(findrank(length(sortq),0.3))]
  deciles[8,2] <- sortq[floor(findrank(length(sortq),0.2))]
  deciles[9,2] <- sortq[floor(findrank(length(sortq),0.1))]
  return(deciles)
}

x_obs <- SWE_CSV_IHA(model_url)
x_obs$date <- as.Date(x_obs$date,format="%Y-%m-%d")
x_obs$month_val <- substr(x_obs$date,6,7)
x_obs$year_val <- substr(x_obs$date,1,4)
x_obs$day_val <- substr(x_obs$date,9,10)
x_obs$jul_val <- strptime(x_obs$date,"%Y-%m-%d")$yday+1
x_obs$wy_val <- ifelse(as.numeric(x_obs$month_val)>=10,as.character(as.numeric(x_obs$year_val)+1),x_obs$year_val) 
temp <- aggregate(discharge ~ wy_val,data=x_obs,length)
temp <- temp[which(temp$discharge>=12),]
obs_data<-x_obs[x_obs$wy_val %in% temp$wy_val,]

#This is now calculating meanflowby calendar year:
correctedData <- obs_data
correctedData$wy_val <- correctedData$year_val
meanflowy<-meanflowbyyear(correctedData)

medflowy<-medflowbyyear(obs_data)
colnames(medflowy) <- c("Year","medq")
meanmonthly<-ma12.23(obs_data)
medmonthly<-ma12.23(obs_data, pref='median')
decile_list <- deciles(obs_data)
colnames(meanflowy)<-c("Year","meanq")
colnames(medflowy)<-c("Year","medianq")
meanmonthly$Month <- seq(1:12)
medmonthly$Month <- seq(1:12)
meanmonthly <- meanmonthly[,c("Month","x")]
medmonthly <- medmonthly[,c("Month","x")]
colnames(meanmonthly)<-c("Month","meanq")
colnames(medmonthly)<-c("Month","medianq")
colnames(decile_list)<-c("decile","q")
output='outfile.txt'
write('mean_annual_flow', output)
write.table(meanflowy, output,sep=',', append=TRUE, row.names=FALSE)
write('median_annual_flow', output,  append=TRUE)
write.table(medflowy, output,sep=',', append=TRUE, row.names=FALSE)
write('mean_monthly_flow', output,  append=TRUE)
write.table(meanmonthly, output,sep=',', append=TRUE, row.names=FALSE)
write('median_monthly_flow', output,  append=TRUE)
write.table(medmonthly, output,sep=',', append=TRUE, row.names=FALSE)
write('deciles', output,sep=',', append=TRUE)
write.table(decile_list, output,sep=',', append=TRUE, row.names=FALSE)

# wps.out: output, text, output_file, A file containing the calculated statistics;
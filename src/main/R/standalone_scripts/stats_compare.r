# this script reads in the output from the observed and modelled flow data and runs comparison statistics

library("XML")
library(zoo)
library(chron)
library(doBy)
library(dataRetrieval)

setwd('/Users/jlthomps/Documents/R/')
mod<-read.table("allstats.out",header=T,colClasses=c("character"))
obs<-read.table("allstats_obs.out",header=T,colClasses=c("character"))


# Build the package:
library(devtools)
setwd("/users/jlthomps/WaterSMART/src/main/R/RProjects/")
load_all("HITHATStats/",reset = TRUE)
setwd("/users/jlthomps/WaterSMART/src/main/R/RProjects/HITHATStats")
document()
check()  
run_examples()
# test()   #Assumes testthat type tests in GLRI/inst/tests
setwd("/users/jlthomps/WaterSMART/src/main/R/RProjects/")
build("HITHATStats")
install("HITHATStats")
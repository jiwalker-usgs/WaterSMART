# wps.des: id=text_png, title = test png, abstract = Test png;
# wps.in: numbers, string, write to png;

data <- c(1,2,3,4,5)
data2 <- c(9,8,7,6,5)

output = 'out.png'
plot = 'plot.png'
png(output)
plot(data)
dev.off()

png(plot)
plot(data2)
dev.off()

# wps.out: output, png, file containing image;
# wps.out: plot, png, another image;

# wps.des: id=text_zip, title = test zip, abstract = Test zip;
# wps.in: text, string, write to file;


write(text, file="zipme.txt")
output="out.zip"
zip(output, c('zipme.txt'))

# wps.out: output, zip, file containing text;

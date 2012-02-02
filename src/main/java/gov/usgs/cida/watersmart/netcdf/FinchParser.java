package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.Station;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.Instant;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class FinchParser {
    
    //public static final Pattern headerPattern = Pattern.compile("^\"date\" \"estq\" \"obsq\"$");
    public static final Pattern dataPattern = Pattern.compile("^\"\\d+\" \"(\\d+/\\d+/\\d{4})\" ([^ ]+) ([^ ]+)$");
    
    private Instant baseDate;
    
    public FinchParser() {
        this.baseDate = null;
    }
    
    public Observation[] parseObservations(File infile, int stationIndex) throws IOException {
        // go through the file and make a list of Observation elements
        // Observation requires station index, so be wary of that
        List<Observation> obs = new LinkedList<Observation>();
        BufferedReader buf = new BufferedReader(new FileReader(infile));
        String line = null;
        while (null != (line = buf.readLine())) {
            Matcher matcher = dataPattern.matcher(line);
            if (matcher.matches()) {
                String date = matcher.group(1);
                if (baseDate == null) {
                    baseDate = Instant.parse(date);
                }
                float estValue = Float.parseFloat(matcher.group(2));
                float obsValue = Float.parseFloat(matcher.group(3));
                //Observation ob = new Observation(stationIndex, stationIndex,values);
            }
        }
        return null;
    }
    
    public static Station[] parseStations(File infile) {
        
        return null;
    }
}

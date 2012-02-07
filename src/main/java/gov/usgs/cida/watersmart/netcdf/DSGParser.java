package gov.usgs.cida.watersmart.netcdf;

import gov.usgs.cida.netcdf.dsg.Observation;
import gov.usgs.cida.netcdf.dsg.RecordType;
import java.io.*;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public abstract class DSGParser implements Iterator<Observation> {

    private static Logger LOG = LoggerFactory.getLogger(DSGParser.class);
    public static final int READ_AHEAD_LIMIT = 4096;
    
    protected Pattern headerVariablePattern;
    protected BufferedReader reader;
    
    public DSGParser(File infile) throws FileNotFoundException {
        reader = new BufferedReader(new FileReader(infile));
    }
    
    @Override
    public boolean hasNext() {
        try {
            reader.mark(READ_AHEAD_LIMIT);
            String line = reader.readLine();
            reader.reset();
            return (line != null);
        }
        catch (IOException ex) {
            LOG.debug("Failure reading file", ex);
            return false;
        }
    }

    @Override
    public abstract Observation next();

    @Override
    public void remove() {
        // since this is a parser, remove doesn't make sense
    }
    
    public abstract RecordType parseMetadata();
    
    /**
     * Pass in a pattern that captures the variable names and gives null for
     * non-variable column headers
     * @param pattern Pattern which matches the headerLine and captures variables
     * @param headerLine Line to parse which has been identified as a header
     * @return String array of variable names
     */
    protected String[] headerVariables(String headerLine) {
        if (headerVariablePattern == null) {
            LOG.debug("Implementing class must define headerVariablePattern to use this function");
            throw new IllegalStateException();
        }
        LinkedList<String> list = new LinkedList<String>();
        Matcher matcher = headerVariablePattern.matcher(headerLine);
        while (matcher.find()) {
            String match = matcher.group(1);
            if (null != match) {
                list.add(match);
            }
        }
        String[] returnArr = new String[list.size()];
        return list.toArray(returnArr);
    }
}

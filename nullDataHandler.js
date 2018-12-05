// In several countries, the indices data is missing
// This function interpolates any indicies data that is missing between two years for the same country
// Eg: indices are missing for years 2009-2014 for the same country.
function interpolateIndices(data) {
    var a;
    var a_index;
    var missing_block = false

    // Note, we assume that the first row of the table has full data
    for (var i = 1; i < data.length; i++) {
        var b = data[i];

        // If missing data, begin search for missing block of data 
        if (missing_block == false && b["1st_pillar_Institutions"] == "") {
            a_index = i-1;
            var a = data[a_index];

            // If previous data point is of the same country and has data,
            // It is assigned as the first interpolation datapoint in this block           
            if (a.Country == b.Country && a["1st_pillar_Institutions"] != "") {
                missing_block = true;
            }  
            continue
        }

        // Second data point required for data interpolation not found. Continue on to next country.
        if (missing_block == true && a.Country != b.Country) {
            missing_block = false
            continue
        }

        // If second interpolation data point found..
        if (missing_block == true && b["1st_pillar_Institutions"] != "") {
            missing_block = false

            var diff = b.Year - a.Year;

            // Generate intermediary values
            var iVals = d3.range(0, 1, 1/diff).map(function(d) {
                return d3.interpolateObject(a, b)(d)
            });

            iVals = iVals.slice(1) // Remove duplicate of object a
            
            // Fill in missing data values into existing objects
            var j = 0
            for( var k = (a_index + 1); k < i; k++) {
                data[k].Year = iVals[j].Year
                data[k]["Global_Competitiveness_Index"] = iVals[j]["Global_Competitiveness_Index"]

                for (var col in columnNames ) {
                    data[k][col] = String(iVals[j][col])
                }
                j++;
            }
        }
    }
    return data;
}

// Adds any missing years to data
function ensure_allYears(data) {

    var min_year = 2008;
    var max_year = 2017;

    var country = data[0].Country;
    var forum = data[0]["Forum classification"];
    var income = data[0]["Income group"];
    var region = data[0]["Region"];

    var country_years = [];

    var new_objects = [];

    function addMissingYears() {
        // For each year 2008-2017, search for missing year
        for (var i = min_year; i <= max_year; i++) {
            var year_present = false;
            for (var j = 0; j < country_years.length; j++ ) {
                if ( i == country_years[j]) {
                    year_present = true;
                    break;
                }
            }
            // If year is missing, push object with missing data to dataset.
            if (!year_present) {
                var new_object = {
                    "Country": country,
                    "Year": String(i),
                    "1st_pillar_Institutions": "",
                    "2nd_pillar_Infrastructure": "",
                    "3rd_pillar_Macroeconomic_environment": "",
                    "4th_pillar_Health_and_primary_education": "",
                    "5th_pillar_Higher_education_and_training": "",
                    "6th_pillar_Goods_market_efficiency": "",
                    "7th_pillar_Labor_market_efficiency": "",
                    "8th_pillar_Financial_market_development": "",
                    "9th_pillar_Technological_readiness": "",
                    "10th_pillar_Market_size": "",
                    "11th_pillar_Business_sophistication_": "",
                    "12th_pillar_Innovation": "",
                    "Global_Competitiveness_Index": "",
                    "Population": "",
                    "GDP": "",
                    "Income group": income,
                    "Region": region,
                    "Forum classification": forum,
                };
                new_objects.push(new_object);
            }
        }
    }

    // Iterate through all countries in the dataset
    for (var i = 0; i < data.length; i++) {

        // If we've reached a new country, make sure that previous country has all years.
        if (data[i].Country != country) {

            addMissingYears();

            // Update country variable to new country, empty list of country years.
            country = data[i].Country;
            forum = data[i]["Forum classification"];
            income = data[i]["Income group"];
            region = data[i]["Region"];

            country_years = [];
        }

        // If it's still the same country, record new year in list of this country's years.
        country_years.push(data[i].Year);
    }

    // Add final countries missing years.
    addMissingYears();

    data = data.concat(new_objects)

    return data.sort(function (a, b) {return d3.ascending( a.Country, b.Country);})
}

// Assumes data has objects for all 10 years.
// Takes data = [{..}, {..}, {..}], and columnNames = the (numeric) columns to be predicted
function extrapolate(data, columnNames) {

    var yearOffset = 2006;
    var max_year = 2017;

    function predictColumn(columnName) {
        //var xSeries = [];
        var ySeries = [];
        var no_data = [];

        // Generate lists of years that have data and years that don't
        for (var i = 0; i < 11; i++ ) {
            if (data[i][columnName] != "" ) {
                ySeries.push(+data[i][columnName]);
            } else {
                no_data.push(data[i]["Year"])
            }
        }

        // Use model coefficients to predict for years that don't have data
        if (no_data.length > 0) {
            for (var i = 0; i < no_data.length; i++) {
                for (var j = 0; j < data.length; j++) {
                    // If there is no data for this year...
                    if (no_data[i] == data[j]["Year"]) {
                        if (ySeries.length == 1) {
                            // If there is only one value, no further prediction can be made
                            // than that value itself.
                            data[j][columnName] = String(ySeries[0])
                        } else {
                            var sum = ySeries.reduce(function(a, b) { return a + b; });
                            data[j][columnName] = String(sum/ySeries.length);
                        }
                    }
                }
            }
        }
        return data;
    }

    for (var i = 0; i < columnNames.length; i++) {
        predictColumn(columnNames[i]);
    }
    return data;
}

// For each column, extrapolate data if required.
function extrapolateColumns(data) {

    var new_data = []
    var yearOffset = 2007;

    var columns = ["1st_pillar_Institutions", "2nd_pillar_Infrastructure", "3rd_pillar_Macroeconomic_environment", 
    "4th_pillar_Health_and_primary_education", "5th_pillar_Higher_education_and_training", 
    "6th_pillar_Goods_market_efficiency", "7th_pillar_Labor_market_efficiency", 
    "8th_pillar_Financial_market_development", "9th_pillar_Technological_readiness", 
    "10th_pillar_Market_size", "11th_pillar_Business_sophistication_", "12th_pillar_Innovation", 
    "GDP", "Global_Competitiveness_Index", "Population"];

    var country = data[0].Country;
    var countryData = [];

    for (var i = 0; i < data.length; i++ ) {
        if (data[i].Country != country) {   
            new_data.push(extrapolate(countryData, columns))

            // Update country variable to new country.
            country = data[i].Country;

            // Empty list of data
            countryData = []
        }
        countryData.push(data[i]);
    }

    new_data.push(extrapolate(countryData, columns));

    // Stackover flow trick for flattening 2d arrays:
    // https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascript
    var output = [].concat.apply([], new_data);

    return output;
}
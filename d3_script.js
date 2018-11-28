
/******** BUBBLE GRAPH ************/

// Define margins
var marginBubble = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 40
};

// Width and height
var outerWidthBubble = 800;
var outerHeightBubble = 600;
var svgWidthBubble = outerWidthBubble - marginBubble.left - marginBubble.right;
var svgHeightBubble = outerHeightBubble - marginBubble.top - marginBubble.bottom;

// Create SVG element
var svgBubble = d3.select("main")
    .append("svg")
    .attr("width", outerWidthBubble)
    .attr("height", outerHeightBubble)
    .append("g")
    .attr("transform", "translate(" + marginBubble.left + "," + marginBubble.top + ")");

// Create scale functions
// Define domain inside the generateVis function below
var xScaleBubble = d3.scaleLog()
    .range([0, svgWidthBubble]);

var yScaleBubble = d3.scaleLinear()
    .range([svgHeightBubble, 0]);

// Scale radius
var rScaleBubble = d3.scaleLinear()
    .range([0, 3000]);

// Define axes
var xAxisBubble = d3.axisBottom()
    .scale(xScaleBubble)

var yAxisBubble = d3.axisLeft()
    .scale(yScaleBubble)
    .ticks(5);

/******** BAR GRAPH ************/

// Define margins
var marginBar = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 50
};

// Width and height
var outerWidthBar = 400;
var outerHeightBar = 600;
var svgWidthBar = outerWidthBar - marginBar.left - marginBar.right;
var svgHeightBar = outerHeightBar - marginBar.top - marginBar.bottom;

// Create SVG element
var svgBar = d3.select("aside")
    .append("svg")
    .attr("width", outerWidthBar)
    .attr("height", outerHeightBar)
    .append("g")
    .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");

// Create scale functions
// Define domain inside the generateVis function below
var xScaleBar = d3.scaleLinear()
    .range([0, svgWidthBar])
    .domain([1, 7]);    // Domain of all indices is 1-7
                        // Source: http://reports.weforum.org/global-competitiveness-index-2017-2018/competitiveness-rankings/

var yScaleBar = d3.scaleBand()
    .range([svgHeightBar, 0])
        // Working with hard-coded country selection for now
                                                            // TODO access checkedCountries                    
// Define axes
var xAxisBar = d3.axisBottom()
    .scale(xScaleBar);

var yAxisBar = d3.axisLeft()
    .scale(yScaleBar)
    .ticks();

// Color map for countries based on their region. Field name in data: 'Forum classification'
var colour = {
    "Europe and North America": "darkblue",
    "Middle East and North Africa": "saddlebrown",
    "Sub-Saharan Africa": "green",
    "Latin America and the Caribbean": "aqua",
    "Eurasia": "red",
    "East Asia and Pacific": "deeppink",
    "South Asia": "yellow"
};

/******** GLOBAL VARIABLES ************/

// The year to display
displayYear = 2008;

// Countries which are selected in the search list stored in array
checkedCountries = [];

/******** FUNCTIONS ************/

// Filters data by year
// Exclude countries where any of the features is missing a value    // TODO: Add interpolation
function yearFilter(value) {
    return (value.Year == displayYear 
        && value.GDP != 0 && value.Global_Competitiveness_Index != 0 
        && value.Population != 0);
}

// Filters data by selected countries
function countryFilter(value) {                                 // TODO access all entries in checkedCountries
    return (value.Country == checkedCountries[0]
        || value.Country == checkedCountries[1]);
}

// Draw chart
function generateVis() {

    // Filter the data to only include the current year
    var filteredDatasetBubble = dataset.filter(yearFilter);

    // Filter the data to only include the current country selection
    var filteredDatasetBar = filteredDatasetBubble.filter(countryFilter);
    
    /******** PERFORM DATA JOIN ************/
    var circles = svgBubble.selectAll("circle")
        .data(filteredDatasetBubble, function key(d) {
            return d.Country;
        });

    var bars = svgBar.selectAll("rect")
        .data(filteredDatasetBar, function key(d) {
            return d.Country;
        })

    // Create an empty div which will hold the country label
    var countryLabel = d3.select("main")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .attr("id", "countryLabel");

    /******** HANDLE UPDATE SELECTION ************/
    // Update the display of existing elements to match new data
    circles
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("cx", function(d) {
            return xScaleBubble(d.GDP);
        })
        .attr("cy", function(d) {
            return yScaleBubble(d.Global_Competitiveness_Index);
        })
        .attr("r", function(d) {
            return Math.sqrt(rScaleBubble(+d.Population)/Math.PI);
        })
        .style("fill", function(d) { 
            return colour[d['Forum classification']];
        });

    bars
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("x", 0)
        .attr("y", function(d) {
            return yScaleBar(d.Country);
        })
        .attr("height", yScaleBar.bandwidth() - 5)
        .attr("width", function(d) {
            return xScaleBar(d['1st_pillar_Institutions']);    // Column names that start with a digit can be accessed with this syntax
        })
        .style("fill", function(d) { 
            return colour[d['Forum classification']];
        })

    /******** HANDLE ENTER SELECTION ************/
    // Create new elements in the dataset
    circles.enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScaleBubble(d.GDP);
        })
        .attr("cy", function(d) {
            return yScaleBubble(d.Global_Competitiveness_Index);
        })
        .attr("r", function(d) {
            return Math.sqrt(rScaleBubble(+d.Population)/Math.PI);
        })
        .style("fill", function(d) { 
            return colour[d['Forum classification']];
        })

        // Responsive circle labels
        .on("mouseover", function(d) {
            return countryLabel.style("visibility", "visible").text(d.Country);
        })
        .on("mousemove", function() {
            return countryLabel.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return countryLabel.style("visibility", "hidden");
        });

    bars.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d) {
            return yScaleBar(d.Country);
        })
        .attr("height", yScaleBar.bandwidth() - 5)
        .attr("width", function(d) {
            return xScaleBar(d['1st_pillar_Institutions']);
        })
        .style("fill", function(d) { 
            return colour[d['Forum classification']];
        })

    /******** HANDLE EXIT SELECTION ************/
    // Remove circles that no longer have a matching data element
    // TODO: setting visibility to null might not be needed
    circles.exit()
        .on("mouseover", function(d) {
            return countryLabel.style("visibility", "hidden");
        })
        .on("mousemove", function(d) {
            return countryLabel.style("visibility", "hidden");
        })
        .on("mouseout", function(d) {
            return countryLabel.style("visibility", "hidden");
        })
        .remove();

    bars.exit().remove();
}

/******** HANDLE SLIDER UPDATE ************/
// Get necessary DOM objects
var slider = document.getElementById("yearRange");
var sliderControlBtn = document.getElementById("yearRangeBtn");
var yearDisplay = document.getElementById("year_header");

// Shows whether the animation is currently running or not
var running = true;

// Updates the year and moves the slider to appropriate position
function updateYearAndSlider() {
    if (running) {

        displayYear = displayYear + 1;
        if (displayYear > 2017) {
            displayYear = 2008;
        }
        slider.value = displayYear;
        yearDisplay.innerText = displayYear;
    }
}

/******** SLIDER ************/
// Controls slider actions 
slider.oninput = function() {
    displayYear = parseInt(this.value);
    yearDisplay.innerText = displayYear;
    running = false;
    sliderControlBtn.innerText = "Start";
    generateVis();
}

// Controls stop/start action of slider control button
sliderControlBtn.onclick = function() {
    running = !running;
    sliderControlBtn.innerText = running ? "Stop" : "Start";
}

/******** SEARCH LIST ************/
// Populate the search list with all countries found in the data
function populateSearchList(data){
    var countryNames = d3.map(data, function(d){return d.Country;}).keys();
    var countrySearchList = $("#countrySearchList");

    for (var i=0; i<countryNames.length; i++){
        countrySearchList.append(`
            <input type="checkbox" name="${countryNames[i]}" value="${countryNames[i]}"><span>${countryNames[i]}<br></span>`);
    }
}

// Displays elements in search list which are relevant to the input query and hides others
function countrySearch(){
    var countries = $("#countrySearchList").children("input");
    var countriesText = $("#countrySearchList").children("span");

    query = $("#countrySearchInput").val().toUpperCase();

    for (var i = 0; i < countries.length; i++) {
        if (countries[i].value.toUpperCase().indexOf(query) > -1) {
            countries[i].style.display = "";
            countriesText[i].style.display = "";

        }
        else {
            countries[i].style.display = "none";
            countriesText[i].style.display = "none";
        }
    }
}

//  Add/remove checked/unchecked countries to the gloabl checkedCountries array
function updateCheckedCountries(){
    var countries = $("#countrySearchList").children("input");

    // Clear old selection
    checkedCountries = [];

    for (var i = 0; i < countries.length; i++) {
        if (countries[i].checked) {
            checkedCountries.push(countries[i].value);
        }
    }
}

// Load the data.csv and generate visualisation
d3.csv("./data/GCI_CompleteData4.csv").then(function(data) {

    // Add countries to search list
    populateSearchList(data);

    dataset = data;

    /******** BUBBLE GRAPH ************/
    // Get maximums and minimums where necessary
    var max_GDP = d3.max(dataset, function(d) { return +d.GDP;} );
    var max_GCI = d3.max(dataset, function(d) { return +d.Global_Competitiveness_Index;} );
    var max_pop = d3.max(dataset, function(d) { return +d.Population;} );
    var min_GDP = d3.min(dataset, function(d) { return +d.GDP;} );
    
    // Specify axis domains
    xScaleBubble.domain([min_GDP-1, max_GDP]);    // -1 hack to include tick for 1B
    yScaleBubble.domain([2, max_GCI]);    // 2 to spread circlces in graph, min GCI value = 2.7
    rScaleBubble.domain([0, max_pop]);

    // Format x-axis ticks
    xAxisBubble.tickFormat(function (d) { 
        return xScaleBubble.tickFormat(5, d3.format(".0s"))(d * 10000000).replace(/G/,"B") 
    });

    // Create and call the x-axis
    svgBubble.append("g")
        .attr("class", "xAxisBubble")
        .attr("id", "xAxisBubble")
        .attr("transform", "translate(0," + svgHeightBubble + ")")
        .call(xAxisBubble);

    // Create and call the y-axis
    svgBubble.append("g")
        .attr("class", "yAxisBubble")
        .attr("id", "yAxisBubble")
        .call(yAxisBubble);

    // Lable code source: view-source:https://bost.ocks.org/mike/nations/
    // x-axis label
    svgBubble.append("text")
        .attr("class", "xlabel")
        .attr("x", svgWidthBubble)
        .attr("y", svgHeightBubble - 6)
        .attr("text-anchor", "end")
        .text("GDP");

    // y-axis label
    svgBubble.append("text")
        .attr("class", "ylabel")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Global Competitiveness Index");

    /******** BAR GRAPH ************/
    // Get maximums and minimums where necessary

    // Specify axis domains         
    yScaleBar.domain(checkedCountries);

    // Format x-axis ticks

    // Create and call the x-axis
    svgBar.append("g")
        .attr("class", "xAxisBar")
        .attr("id", "xAxisBar")
        .attr("transform", "translate(0," + svgHeightBar + ")")
        .call(xAxisBar);

    // Create and call the y-axis
    svgBar.append("g")
        .attr("class", "yAxisBar")
        .attr("id", "yAxisBar")
        .call(yAxisBar);

    // Initiate graph
    generateVis();

    // Set up a callback so we iterate through the years
    setInterval(function() {
        updateCheckedCountries();
        updateYearAndSlider();
        console.log("Year: " + displayYear + "\nChecked Countries: ", checkedCountries);
        generateVis();
    }, 1000);
});
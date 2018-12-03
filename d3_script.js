
/******** GLOBAL VARIABLES ************/

// The year to display
displayYear = 2008;

// Countries which are selected in the search list stored in array
checkedCountries = [];

// Stores visualisation class
var v;

// Trace checked countries?
var trace = true;

/******** BUBBLE GRAPH ************/

// Create an empty div which will hold the country label
var countryLabel = d3.select("main")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .attr("id", "countryLabel");

// Define margins
var marginBubble = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 40
};

// Width and height
var outerWidthBubble = 800;
var outerHeightBubble = 500;
var svgWidthBubble = outerWidthBubble - marginBubble.left - marginBubble.right;
var svgHeightBubble = outerHeightBubble - marginBubble.top - marginBubble.bottom;

// Create SVG element
var svgBubble = d3.select("#mainChart")
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

/******** BAR GRAPH ************/

// Define margins
var marginBar = {
    top: 20,
    right: 10,
    bottom: 20,
    left: 150
};

// Width and height
var outerWidthBar = 300;
var outerHeightBar = 400;
var svgWidthBar = outerWidthBar - marginBar.left - marginBar.right;
var svgHeightBar = outerHeightBar - marginBar.top - marginBar.bottom;

// Create SVG element
var svgBar = d3.select("#secondaryChart")
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

// Between groups scale
var yScaleBar_outer = d3.scaleBand()
    .range([svgHeightBar, 0])
    .paddingInner(0.1);

// Within group scale
var yScaleBar_inner = d3.scaleBand()
    .padding(0.06);
                            
// Define axes
var xAxisBar = d3.axisBottom()
    .scale(xScaleBar)
    .ticks(5);

var yAxisBar = d3.axisLeft()
    .scale(yScaleBar_outer)
    .tickFormat(function (d) {
        return columnNames[d] 
    });

// Mapping of column names and strings for tick label for bar graph
var columnNames = {
    '1st_pillar_Institutions': 'Institutions', 
    '2nd_pillar_Infrastructure': 'Infrastructure', 
    '3rd_pillar_Macroeconomic_environment': 'Macroeconomic Env',
    '4th_pillar_Health_and_primary_education': 'Health & Primary Edu.', 
    '5th_pillar_Higher_education_and_training': 'Higher Edu. & Training', 
    '6th_pillar_Goods_market_efficiency': 'Goods Market Efficiency',
    '7th_pillar_Labor_market_efficiency': 'Labor Market Efficiency', 
    '8th_pillar_Financial_market_development': 'Financial Market Develop.', 
    '9th_pillar_Technological_readiness': 'Technological Readiness',
    '10th_pillar_Market_size': 'Market Size', 
    '11th_pillar_Business_sophistication_': 'Business Sophistication', 
    '12th_pillar_Innovation': 'Innovation',
}

/******** FUNCTIONS ************/

// Filters data by year
// Exclude countries where any of the features is missing a value    // TODO: Add interpolation
function yearFilter(value) {
    return (value.Year == displayYear 
        && value.GDP != 0 && value.Global_Competitiveness_Index != 0 
        && value.Population != 0);
}

// Filters data by selected countries (limited to 3)
function countryFilter(value) {                  
    return (value.Country == checkedCountries[0]
        || value.Country == checkedCountries[1]
    || value.Country == checkedCountries[2]);
}
 
// Function for assigning bar graph colours
var barColor = ["#d9d9d9", "#969696", "#ffffff"]
var assignedColor = {} // dict. which stores country: color pairs
function assignColor() {
    for (var i = 0; i < checkedCountries.length; i++) {
        assignedColor[checkedCountries[i]] = barColor[i];
    }
}

function updateBarLegend(){
    var legend = $("#barLegend");
    legend.empty();
    for (var i = 0; i < checkedCountries.length; i++)
        legend.append(`<li><span style="background-color: ${assignedColor[checkedCountries[i]]}"></span>${checkedCountries[i]}</li>`);
}

// Used in group bar chart when getting country colour
// returns an item in dataset x which contains the country specified.
function get_item(x, Country) {
    for (var i = 0; i < x.length; i++) {
        if (x[i]["Country"] == Country) {
            return x[i]
        }
    }
}

// Visualisation class with methods for each chart and year filtering
class Visualisation {
    constructor(data) {
        this.dataset = data;
        this.yearData;
    }

    filterByYear() {
        this.yearData = this.dataset.filter(yearFilter);
    }

    circleChart() {

        /******** PERFORM DATA JOIN ************/
        var circles = svgBubble.selectAll("circle")
            .data(this.yearData, function key(d) { return d.Country; });

        /******** HANDLE UPDATE SELECTION ************/
        // Update the display of existing elements to match new data
        circles
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr("cx", function(d) { return xScaleBubble(d.GDP); })
        .attr("cy", function(d) { return yScaleBubble(d.Global_Competitiveness_Index); })
        .attr("r", function(d) { return Math.sqrt(rScaleBubble(+d.Population)/Math.PI); })
        .style("fill", function(d) { return colour[d['Forum classification']]; });
        // .filter(function(d) {
        //     return d.Country != "China"
        // }).append("circle");

        /******** HANDLE ENTER SELECTION ************/
        // Create new elements in the dataset
        circles.enter()
        .append("circle")
        .attr("cx", function(d) { return xScaleBubble(d.GDP); })
        .attr("cy", function(d) { return yScaleBubble(d.Global_Competitiveness_Index); })
        .attr("r", function(d) { return Math.sqrt(rScaleBubble(+d.Population)/Math.PI); })
        .style("fill", function(d) { return colour[d['Forum classification']]; })
        .on("mouseover", function(d) { return countryLabel.style("visibility", "visible").text(d.Country);})
        .on("mousemove", function() {
            return countryLabel.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() { return countryLabel.style("visibility", "hidden"); });

        /******** HANDLE EXIT SELECTION ************/
        // Remove dom elements that no longer have a matching data element
        circles.exit().remove()
    }

    barChart() {

        // Assign a color to each group of bars in the chart
        assignColor();

        // Update bar chart's legend
        updateBarLegend();

        // Filter the data to only include the current country selection
        var filteredDatasetBar = this.yearData.filter(countryFilter);

        // Data must be transposed to create the bar chart
        var transposedData = [];        
        for (var key in columnNames) {
            var IndexObj = {"Index": key};
            for (var j = 0; j < filteredDatasetBar.length; j++) {
                IndexObj[filteredDatasetBar[j]["Country"]] = filteredDatasetBar[j][key];
            }
            transposedData.push(IndexObj);
        }

        // Keys of the data objects
        var keys = Object.keys(transposedData[1]);

        // Specify axis scale of each group
        yScaleBar_inner.domain(keys)
            .range([yScaleBar_outer.bandwidth(), 0]);
  
        /******** PERFORM DATA JOIN ************/
        // Assign data to bar groups
        var barGroups = svgBar.selectAll("g.barGroup")
                            .data(transposedData);

        // Assign data to individual bars 
        var bars = svgBar
        .selectAll("g.barGroup")
        .selectAll("rect")
        .data(function(d) {
            var array = []
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] != "Index") {
                    array.push({key: keys[i], value: d[keys[i]]})
                }
            }
            return array;
        });

        // Assign data to legend
        var legend = svgBar.selectAll(".legend")
            .data(checkedCountries);

        /******** HANDLE UPDATE SELECTION ************/
        // Individual bars update
        bars
            .attr("y", function(d) { return yScaleBar_inner(d.key); })
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("width", function(d) { return xScaleBar(+d.value); })
            .style("fill", function(d) { return assignedColor[d.key]; });

        /******** HANDLE ENTER SELECTION ************/
        // Bar group enter
        barGroups
        .enter().append("g")
            .classed('barGroup', true)
            .attr("transform", function(d) { return "translate(0, " + yScaleBar_outer(d.Index) + ")"; });

        // Legend enter
        legend
        .enter().append("g");

        // Individual bars enter
        bars
        .enter().append("rect")
            .attr("x", 0)
            .attr("y", function(d) { return yScaleBar_inner(d.key); })
            .attr("height", yScaleBar_inner.bandwidth())
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr("width", function(d) { return xScaleBar(+d.value); })
            .style("fill", function(d) { return assignedColor[d.key]; });

        
        /******** HANDLE EXIT SELECTION ************/
        // Bar group exit
        barGroups.exit().remove();

        // Handle bars exit
        bars.exit().remove();
    }    
} 

/******** HANDLE SLIDER UPDATE ************/

// Get necessary DOM objects
var slider = document.getElementById("yearRange");
var sliderControlBtn = document.getElementById("yearRangeBtn");
var yearDisplay = document.getElementById("year_header");

// Shows whether the animation is currently running or not
var running = true;

// Updates the year and moves the slider to appropriate position
function filterByYearAndSlider() {
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
    v.filterByYear();
    v.circleChart();
    v.barChart();
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

    for (var i = 0; i < countries.length; i++) {    // Loop through countries
        var index = checkedCountries.indexOf(countries[i].value);    // Get index of country in checkedCountries
        if (countries[i].checked) {
            if (index == -1) {    // Add country if it's not in the checkedCountry array already
                checkedCountries.push(countries[i].value);
            }
        } else {
            if (index != -1) {    // Otherwise remove it 
                checkedCountries.splice(index,1);
            }
        }
    }

    // Update barChart when checkedCountries is changed
    v.barChart();
}


// Load the data.csv and generate visualisation
d3.csv("./data/GCI_CompleteData4.csv").then(function(data) {

    dataset = data;

    // Add countries to search list
    populateSearchList(dataset);

    /******** BUBBLE GRAPH ************/

    // Get maximums and minimums where necessary
    var max_GDP = d3.max(dataset, function(d) { return +d.GDP;} );
    var max_pop = d3.max(dataset, function(d) { return +d.Population;} );
    
    // Specify axis domains
    xScaleBubble.domain([100, max_GDP]);
    yScaleBubble.domain([2, 6]);
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
        .text("GDP (in billions)");

    // y-axis label
    svgBubble.append("text")
        .attr("class", "ylabel")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Global Competitiveness Index");

    /******** BAR GRAPH ************/

    // Specify y-axis domain for bar graph         
    yScaleBar_outer.domain(Object.keys(columnNames));

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

    // Initiate visualisation object
    v = new Visualisation(dataset);

    // Filter the data by year
    v.filterByYear();

    // Initiate circle graph
    v.circleChart();

    //Set up a callback so we iterate through the years
    setInterval(function() {
        if (running) {
            updateCheckedCountries();
            filterByYearAndSlider();
            v.filterByYear();
            v.circleChart();
        }
        // When not running, still update checkedCountries for bar chart
        updateCheckedCountries();

    }, 1000);
});
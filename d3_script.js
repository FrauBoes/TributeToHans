// Define margins
var margin = {
    top: 50,
    right: 20,
    bottom: 25,
    left: 40
};

// Width and height
var outer_width = 700;
var outer_height = 550;
var svg_width = outer_width - margin.left - margin.right;
var svg_height = outer_height - margin.top - margin.bottom;

// Create SVG element
var svg = d3.select("main")
    .append("svg")
    .attr("width", outer_width)
    .attr("height", outer_height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Create scale functions
var xScale = d3.scaleLog()
    .range([0, svg_width]);

var yScale = d3.scaleLinear()
    .range([svg_height, 0]);

// Scale radius
var rScale = d3.scaleLinear()
    .range([0, 50]);


// Define axes
var xAxis = d3.axisBottom()
    .scale(xScale)

var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(5);



// The year to display
display_year = 2008;

// Define a function that filters data by year
function yearFilter(value) {
    return (value.Year == display_year)
}


// Define a function to draw a simple bar chart
function generateVis() {

    // Filter the data to only include the current year
    var filtered_datset = dataset.filter(yearFilter);


    /******** PERFORM DATA JOIN ************/
    var circles = svg.selectAll("circle")
        .data(filtered_datset, function key(d) {
            return d.Country;
        });

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
        .attr("cx", function(d) {
            return xScale(d.GDP);
        })
        .attr("cy", function(d) {
            return yScale(d.Global_Competitiveness_Index);
        })
        .attr("r", function(d) {
            return rScale(d.Population);
        })
        .style("opacity", "0.2")
        .style("fill", "green");


    /******** HANDLE ENTER SELECTION ************/
    // Create new elements in the dataset
    circles.enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.GDP);
        })
        .attr("cy", function(d) {
            return yScale(d.Global_Competitiveness_Index);
        })
        .attr("r", function(d) {
            return rScale(d.Population);
        })
        .style("opacity", "0.2")
        .style("fill", "blue")
        .on("mouseover", function(d) {
            return countryLabel.style("visibility", "visible").text(d.Country);
        })
        .on("mousemove", function() {
            return countryLabel.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return countryLabel.style("visibility", "hidden");
        });

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
}


/******** HANDLE SLIDER UPDATE ************/
// Get necessary dom objects
var slider = document.getElementById("yearRange");
var sliderControlBtn = document.getElementById("yearRangeBtn");
var yearDisplay = document.getElementById("year_header");

// shows whether the animation is currently running or not
var running = true;

// updates the year and moves the slider to appropriate position
function updateYearAndSlider() {
    if (running) {

        display_year = display_year + 1;
        if (display_year > 2017) {
            display_year = 2008;
        }
        slider.value = display_year;
        yearDisplay.innerText = display_year;
    }
}

// controls slider actions 
slider.oninput = function() {
    display_year = parseInt(this.value);
    yearDisplay.innerText = display_year;
    running = false;
    sliderControlBtn.innerText = "Start";
    generateVis();
}

// controls stop/start action of slider control button
sliderControlBtn.onclick = function() {
    running = !running;
    sliderControlBtn.innerText = running ? "Stop" : "Start";
}

// Load the file data.csv and generate a visualisation based on it
// Can use smaller selection of data in GCI_TestData.csv if needed
d3.csv("./data/GCI_TestData.csv").then(function(data) {

    dataset = data;

    // Get minimums and maximums
    var max_GDP = d3.max(dataset, function(d) { return +d.GDP;} );
    var max_GCI = d3.max(dataset, function(d) { return +d.Global_Competitiveness_Index;} );
    var max_pop = d3.max(dataset, function(d) { return +d.Population;} );

    // Specify axis domains
    xScale.domain([1, max_GDP]);
    yScale.domain([0, max_GCI]);
    rScale.domain([0, max_pop]);

    // Format x axis ticks
    xAxis.tickFormat(function (d) { 
        return xScale.tickFormat(5, d3.format(".0s"))(d * 1000000000).replace(/G/,"B") 
    });

    // Create and call the X-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + svg_height + ")")
        .call(xAxis);

    // Create and call the Y-axis;
    svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yAxis")
        .call(yAxis);

    // Lable code source: view-source:https://bost.ocks.org/mike/nations/
    // X axis label
    svg.append("text")
        .attr("class", "xlabel")
        .attr("x", svg_width)
        .attr("y", svg_height - 6)
        .attr("text-anchor", "end")
        .text("GDP");

    // Y axis label
    svg.append("text")
        .attr("class", "ylabel")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Global Competitiveness Index");

    // Initiate graph
    generateVis();

    // Set up a callback so we iterate through the years
    setInterval(function() {
        updateYearAndSlider();
        generateVis();
    }, 1000);
});
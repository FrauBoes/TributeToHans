# Channeling: A data visualisation in tribute to Hans Rosling

## How to run
In root directory run
```
python -m http.server
```
In the browser, go to 
```
http://localhost:8000/1-scatterplot.html
```

## Data
World Economic Forum: [Global Competitiveness Report 2017-2018](http://reports.weforum.org/global-competitiveness-index-2017-2018/)

Missing data values were interpolated using linear interpolation where possible.
Where not possible (when data was missing at the start or end of a country's data), the average 
for that country's data was provided instead, in order to maintain a smooth visualisation.
Initially, we tried using a simple linear model to predict these values. However, the dataset
was not large, and the shape of the data not necessarily linear, leading to large outliers. 
Missing years were also added to the dataset as required.


## Visualisation Elements

- Bubble chart representing the countries of the world
	- Y-axis: Global competitive index (linear)
	- X-axis: GDP (logarithmic)
	- Circle diameter: population size (linear)
	- Labels for circles on-hover showing the country name and population size value
	- Circles color-encoded based on region
	- Ability to view data for a particular year 
	- Ability to animate the change from year to year
	- Ability to trace the changes of a selected country from year to year

- Grouped bar chart representing the detailed indices for selected countries
	- Y-axis: Index labels
	- X-axis: Index scale (linear)
	- Up to three countries can be selected at a time
	- Legend with country names and color encoding
	- Ability to view data for a particular year 
	- Ability to animate the change from year to year

## Functionality

- Scroll bar at the bottom can be used both to control the year displayed and to stop and start the animation through the years.
- Search field with checkboxes can be used to select countries to be displayed in the bar chart.
- Separate "Trail" checkbox can be used to turn on/off the trailing feature of the bubble chart.

## Design Choices

- Clean design
	- Low number of ticks
	- Reduced use of colors
	- Small number of interactive elements
	- Color opacity to handle overlap of circles

- Features to improve readability
	- Horizontal grid lines
	- Ticks for the x-axis to facilitate interpretation of the log scale
	- Labels for circles on-hover only 

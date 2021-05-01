function makeResponsive() {
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
// var svgWidth = 960;
// var svgHeight = 500;
var svgWidth = window.innerWidth;
var svgHeight = window.innerHeight;

var margin = {
  top: 20,
  right: 100,
  bottom: 120,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(data, chosenXAxis) {
    
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
      .range([0, width]);
  
    return xLinearScale;
  }

function yScale(data, chosenYAxis) {
    
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8, 
      d3.max(data, d => d[chosenYAxis]) * 1.1
    ])
      .range([height, 0]);
  
    return yLinearScale;
  }

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale); 
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale); 
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }


function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

// function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
//     circlesGroup.transition()
//       .duration(1000)
//       .attr("cy", dy => newYScale(dy[chosenYAxis]));
//     return circlesGroup;
//   }

  function renderText(tGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    tGroup.transition()
        .duration(1000)
        .attr("x", dt => newXScale(dt[chosenXAxis]))
        .attr("y", dt => newYScale(dt[chosenYAxis])+5);
    return tGroup;
  }

  function updateToolTip(chosenXAxis, chosenYAxis, tGroup) {
    // circlesGroup) {
    var label; 
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }

    else if (chosenXAxis === "age"){
        label = "Age:";
    }
    else if (chosenXAxis === "income"){
        label = "Household Income:";
    }

  
    var labely; 
    if (chosenYAxis === "healthcare") {
        labely = "Healthcare:";
    }

    else if (chosenYAxis === "smokes"){
        labely = "Smokes:";
    }
    else if (chosenYAxis === "obesity"){
        labely = "Obese:";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
      });
  
    // circlesGroup.call(toolTip);
    tGroup.call(toolTip);

  //   circlesGroup.on("mouseover", function(d) {
  //     toolTip.show(d);
  //   })
  //     // onmouseout event
  //     .on("mouseout", function(d, index) {
  //       toolTip.hide(d);
  //     });  
  //   return circlesGroup;
  // }  
 tGroup
    .on("mouseover", function(d) {
    toolTip.show(d);
    })

    .on("mouseout", function(d, index) {
      toolTip.hide(d);
    });  
  return tGroup;
} 

d3.csv("data.csv").then(function(data, err) {
    if (err) throw err;

  data.forEach(function(da) {
    da.poverty = +da.poverty;
    da.healthcare = +da.healthcare;
    da.age = +da.age;
    da.smokes = +da.smokes;
    da.income = +da.income;
    da.obesity = +da.obesity;
    da.abbr = da.abbr;
    da.state = da.state;
  });

//   console.log(chosenXAxis)
//   console.log(chosenYAxis)
//   console.log(data.map(e => e[chosenXAxis]))
//   console.log(data.map(e => e[chosenYAxis]))
//   console.log(d3.min(data, e => e[chosenXAxis]) * 0.8)
//   console.log(d3.max(data, e => e[chosenYAxis]) * 1.2)
  // console.log(data)
  // console.log(data.map(e => e.abbr))

  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("stateCircle")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 10);
  //.attr("fill", "lightblue")
  //.attr("opacity", "1");

  var tGroup = chartGroup.selectAll("stateText")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "stateText")
  .attr("text-anchor", "middle")
  .text(function(dt) {return dt.abbr;})
  .attr("x", dt => xLinearScale(dt[chosenXAxis]))
  .attr("y", dt => yLinearScale(dt[chosenYAxis])+5)
  .attr("fill", "white")
  .attr("font-size", 11)
  .attr("font-family","Arial, Helvetica, sans-serif");


var labelsGroup = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + 20})`);

var labelsGroupy = chartGroup.append("g")
//    .attr("transform", `translate(${0}, ${height/2})`);
   .attr("transform", `translate(${0}, ${height - (height/2)})`);

 var povertyLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 20)
   .attr("value", "poverty") 
   .classed("active", true)
   .text("In Poverty (%)");

 var ageLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 45)
   .attr("value", "age")
   .classed("inactive", true)
   .text("Age (years, Median)");   

var incomeLabel = labelsGroup.append("text")
   .attr("x", 0)
   .attr("y", 70)
   .attr("value", "income") 
   .classed("inactive", true)
   .text("Household Income ($, Median)");   

var hcLabel = labelsGroupy.append("text")
   .attr("x", 10)
   .attr("y", -30)
   .attr("transform","rotate(-90)")
   .attr("value", "healthcare") 
   .classed("active", true)
   .text("Lacks Healthcare (%)");

 var smLabel = labelsGroupy.append("text")
   .attr("x", 10)
   .attr("y", -55)
   .attr("transform","rotate(-90)")
   .attr("value", "smokes") 
   .classed("inactive", true)
   .text("Smokes (%)");   

var obLabel = labelsGroupy.append("text")
   .attr("x", 10)
   .attr("y", -80)
   .attr("transform","rotate(-90)")
   .attr("value", "obesity") 
   .classed("inactive", true)
   .text("Obese (%)");   

  // var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  var tGroup = updateToolTip(chosenXAxis, chosenYAxis, tGroup);
  labelsGroup.selectAll("text")
  .on("click", function() {
    var valueX = d3.select(this).attr("value");

    if (valueX !== chosenXAxis) {
      chosenXAxis = valueX;

      xLinearScale = xScale(data, chosenXAxis);
      xAxis = renderXAxes(xLinearScale, xAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      tGroup = renderText(tGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      //circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      tGroup = updateToolTip(chosenXAxis, chosenYAxis, tGroup);

    //   console.log(chosenXAxis)
    //   console.log(chosenYAxis)
    //   console.log(data.map(e => e[chosenXAxis]))
    //   console.log(data.map(e => e[chosenYAxis]))
    //   console.log(d3.min(data, e => e[chosenXAxis]) * 0.8)
    //   console.log(d3.max(data, e => e[chosenYAxis]) * 1.2)

      if (chosenXAxis === "poverty") {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
       incomeLabel
          .classed("active", false)
          .classed("inactive", true);           
      }

      else  if (chosenXAxis === "age") {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
       incomeLabel
          .classed("active", false)
          .classed("inactive", true);   
      }
    
      else if (chosenXAxis === "income")  {
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }

  });


//var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
labelsGroupy.selectAll("text")
    .on("click", function() {
        var valueY = d3.select(this).attr("value");
        if (valueY !== chosenYAxis) {
            chosenYAxis = valueY;

        // console.log(chosenXAxis)
        // console.log(chosenYAxis)
        // console.log(data.map(e => e[chosenXAxis]))
        // console.log(data.map(e => e[chosenYAxis]))
        // console.log(d3.min(data, e => e[chosenXAxis]) * 0.8)
        // console.log(d3.max(data, e => e[chosenYAxis]) * 1.2)

            yLinearScale = yScale(data, chosenYAxis);
            yAxis = renderYAxes(yLinearScale, yAxis);
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            tGroup = renderCircles(tGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            tGroup = renderText(tGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            tGroup = updateToolTip(chosenXAxis, chosenYAxis, tGroup);
            // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
            if (chosenYAxis === "healthcare") {
            hcLabel
                .classed("active", true)
                .classed("inactive", false);
            smLabel
                .classed("active", false)
                .classed("inactive", true);
            obLabel
                .classed("active", false)
                .classed("inactive", true);           
            }
 
            else if (chosenYAxis === "smokes") {
            hcLabel
                .classed("active", false)
                .classed("inactive", true);
            smLabel
                .classed("active", true)
                .classed("inactive", false);
            obLabel
                .classed("active", false)
                .classed("inactive", true);   
            }
          
            else if (chosenYAxis === "obesity")  {
              hcLabel
                  .classed("active", false)
                  .classed("inactive", true);
              smLabel
                  .classed("active", false)
                  .classed("inactive", true);
              obLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
        }
    });   


}).catch(function(error) {
 console.log(error);
});

} 
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive);

import React, { Component } from "react";
import "./ColumnList.css"
import * as d3 from "d3";

class ColumnList extends Component {
  componentDidMount() {
    this.renderColumnList();
  }

  renderColumnList = () => {
    // get data
    const data = this.props.csv_data;

    // get the column list
    const cols = Object.keys(data[0])

    // set up size
    const height = 25
    const width = 1475
    const ColList = d3.select(".ColList")
      .attr('height', height)
      .attr('width', width)

    // Add tooltip
    var tooltip = d3.select("body").selectAll(".tooltip").data([0]).join('div').attr('class', "tooltip").style("opacity", [0])

    // Set up number of rows and cols
    const nrow = 1
    const ncol = 14
    
    // Add the colum texts
    ColList.selectAll(".column").data(cols).join('text')
        .attr('class', 'column')
        .attr('text-anchor', 'start')
        .attr('font-size', 11)
        .attr('x', (d, i) => width/ncol*(i%ncol))
        .attr('y', (d, i) => 20 + (height-20)/nrow*(Math.floor(i/ncol)))
        .text(d => d)
        .on("mousemove", (event, d) => {
            const smallWidth = 400
            const smallHeight = 225
            const smallMargin = {left: 50, top: 20, right: 20, bottom: 30}
            const column = d
            tooltip.style("opacity", 1)
              .style("left", (event.pageX) - smallWidth/2 + "px")
              .style("top", (event.pageY) + "px")
              .style("height", smallHeight + smallMargin.top + smallMargin.bottom + "px")
              .style("width", smallMargin.left + smallWidth + smallMargin.right + "px")
            var toolsvg = tooltip.selectAll("svg").data([0]).join('svg')
              .attr("height", smallMargin.top + smallHeight + smallMargin.bottom)
              .attr("width", smallMargin.left + smallWidth + smallMargin.right)
            var toolContainer = toolsvg.selectAll(".small_container").data([0]).join('g').attr('class', 'small_container')
              .attr('height', smallHeight)
              .attr('width', smallWidth)
              .attr('transform', `translate(${smallMargin.left}, ${smallMargin.top})`)

            // Add in white background
            // toolContainer.selectAll('.toolBackground').data([0]).join('rect').attr('class', 'toolBackground')
            //   .attr('x', 0)
            //   .attr('y', 0)
            //   .attr('width', smallWidth)
            //   .attr('height', smallHeight)
            //   .attr('stroke', 'none')
            //   .style('fill', 'white')

            // Get the column data and configure scales
            var coldat = data.map(d => d[column])
            var histogram = d3.bin().domain([d3.min(coldat), d3.max(coldat)])
            var bins = histogram(coldat);
            var smallX = d3.scaleLinear().domain([d3.min(coldat), d3.max(coldat)]).range([0, smallWidth])
            var smallY = d3.scaleLinear().domain([0, d3.max(bins, function(d) { return d.length; })]).range([smallHeight, 0])

    
            // Make colors consistent with stream graph
            const pollutants = ["CO(GT)", "PT08.S1(CO)", "NMHC(GT)", "C6H6(GT)", "PT08.S2(NMHC)", 
              "NOx(GT)", "PT08.S3(NOx)", "NO2(GT)", "PT08.S4(NO2)", "PT08.S5(O3)"];
            const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300", 
                          "#33FFF5", "#8E44AD", "#E67E22", "#1ABC9C", "#34495E"];
  
            // Add the rectangles
            toolContainer.selectAll('.histBar').data(bins).join('rect').attr('class', 'histBar')
                .attr("x", d => smallX(d.x0))
                .attr("y", d => smallY(d.length))
                .attr("width", d => smallX(d.x1) - smallX(d.x0))
                .attr("height", d => smallHeight - smallY(d.length))
                .style("fill", colors[pollutants.indexOf(column)])
                .attr('stroke', 'white')

            // Add the axes
            toolsvg.selectAll(".smallx-axis").data([0]).join('g').attr('class', 'smallx-axis')
              .attr("transform", `translate(${smallMargin.left},${smallMargin.top + smallHeight})`)
              .call(d3.axisBottom(smallX))
              .selectAll('text').attr('font-weight', 'bold')
  
            toolsvg.selectAll(".smally-axis").data([0]).join('g').attr('class', 'smally-axis')
              .call(d3.axisLeft(smallY))
              .attr("transform", `translate(${smallMargin.left}, ${smallMargin.top})`)
              .selectAll('text').attr('font-weight', 'bold')

            // Add title
            toolsvg.selectAll(".toolTitle").data([0]).join('text').attr('class', 'toolTitle')
              .attr('x', smallMargin.left + smallWidth/2)
              .attr('y', smallMargin.top/2 + 5)
              .attr('text-anchor', 'middle')
              .attr('font-size', 14)
              .attr('font-weight', 'bold')
              .text(column)

          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0)})
  }

  render() {
    return (
      <div className="column-list-container" style={{ marginBottom: "0px" }}>
        <h3 style={{ marginTop: 5, marginBottom: 5 }}>Columns:</h3>
        <svg className="ColList"><g></g></svg>
      </div>
    );
  }
}

export default ColumnList;
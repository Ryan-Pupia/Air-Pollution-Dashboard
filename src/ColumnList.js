import React, { Component } from "react";
import "./ColumnList.css"
import * as d3 from "d3";

class ColumnList extends Component {
    componentDidUpdate() {
        this.renderColumnList();
    }

    renderColumnList = () => {
        // get data
        const data = this.props.csv_data;

        // get the column list
        const cols = Object.keys(data[0])

        // set up size
        const height = 100
        const width = 1000
        const ColList = d3.select(".ColList")
            .attr('height', height)
            .attr('width', width)

        // Add tooltip
        var tooltip = d3.select("body").selectAll(".tooltip").data([0]).join('div').attr('class', "tooltip").style("opacity", [0])

        // Set up number of rows and cols
        const nrow = 2
        const ncol = 7
        
        // Add the colum texts
        ColList.selectAll(".column").data(cols).join('text')
            .attr('class', 'column')
            .attr('text-anchor', 'start')
            .attr('x', (d, i) => width/ncol*(i%ncol))
            .attr('y', (d, i) => 20 + (height-20)/nrow*(Math.floor(i/ncol)))
            .text(d => d)
            .on("mousemove", (event, d) => {
                const smallWidth = 275
                const smallHeight = 150
                const smallMargin = {left: 35, top: 20, right: 20, bottom: 30}
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

                // Do histogram stuff
                var histogram = d3.bin()

                // And apply this function to data to get the bins
                var coldat = data.map(d => d[column])
                var bins = histogram(coldat);
                console.log(bins)
                var smallX = d3.scaleLinear().domain([d3.min(coldat), d3.max(coldat)]).range([0, smallWidth])
                var smallY = d3.scaleLinear().domain([0, d3.max(bins, function(d) { return d.length; })]).range([smallHeight, 0])
      
                // Add the rectangles
                toolContainer.selectAll('rect').data(bins).join('rect')
                    .attr("x", d => smallX(d.x0))
                    .attr("y", d => smallY(d.length))
                    .attr("width", d => smallX(d.x1) - smallX(d.x0))
                    .attr("height", d => smallHeight - smallY(d.length))
                    .style("fill", "blue")
                
                // Add the axes
                toolsvg.selectAll(".smallx-axis").data([0]).join('g').attr('class', 'smallx-axis')
                  .attr("transform", `translate(${smallMargin.left},${smallMargin.top + smallHeight})`)
                  .call(d3.axisBottom(smallX))
      
                toolsvg.selectAll(".smally-axis").data([0]).join('g').attr('class', 'smally-axis')
                  .call(d3.axisLeft(smallY))
                  .attr("transform", `translate(${smallMargin.left}, ${smallMargin.top})`)
              })
              .on('mouseout', () => {
                tooltip.style('opacity', 0)})


    }

    render() {
        return (
            <div>
                <h3>Columns:</h3>
                <svg className="ColList"><g></g></svg>
            </div>
        );
    }
}

export default ColumnList;
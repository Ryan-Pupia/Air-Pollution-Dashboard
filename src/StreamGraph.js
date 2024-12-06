import React, { Component } from "react";
import * as d3 from "d3";

class StreamGraph extends Component {
    componentDidUpdate() {
      this.renderStreamGraph();
    }
  
    renderStreamGraph = () => {
      // get data
      const data = this.props.csv_data;
      const pollutants = ["CO(GT)", "PT08.S1(CO)", "NMHC(GT)", "C6H6(GT)", "PT08.S2(NMHC)", "NOx(GT)", "PT08.S3(NOx)", "NO2(GT)", "PT08.S4(NO2)", "PT08.S5(O3)"];
      const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300", "#33FFF5", "#8E44AD", "#E67E22", "#1ABC9C", "#34495E"];

      // set dimensions and margins
      const margin = { top: 40, right: 180, bottom: 40, left: 20 };
      const width = 600;
      const height = 300;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
    
      // get max sum for y axis
      const maxSum = d3.sum(pollutants.map(p => d3.max(data, d => d[p])));
      const minSum = d3.sum(pollutants.map(p => d3.min(data, d => d[p])));
    
      // create svg container
      const svg = d3.select('.streamGraph')
        .attr('width', width)
        .attr('height', height)
        .select('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
      // create area stacks
      const stack = d3.stack().keys(pollutants).offset(d3.stackOffsetWiggle);
      const stackedData = stack(data);
    
      // create x and y scales
      const xScale = d3.scaleTime().domain(d3.extent(data, d => d.Date)).range([0, innerWidth]);
      const yScale = d3.scaleLinear().domain([minSum - 8000, maxSum]).range([innerHeight, 0]);
      // console.log("MinSum:", minSum)
      
      // create area generation
      const areaGenerator = d3.area()
        .x(d => xScale(d.data.Date))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveCardinal);
    
      // display streamgraph
      svg.selectAll('path').data(stackedData).join('path')
        .style('fill', (d, i) => colors[i])
        .attr('d', d => areaGenerator(d));
    
      // add x-axis
      svg.selectAll('.x.axis').data([null]).join('g').attr('class', 'x axis')
        .attr('transform', `translate(0,${innerHeight + 10})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"))); // fix ticks
        
      // add legend
      const legend = d3.select('.streamGraph').append("g")
        .attr("transform", `translate(${width - margin.right + 40}, ${margin.top})`);
      
      pollutants.forEach((pollutant, index) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${index * 20})`);
    
        legendRow.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colors[index]);
    
        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .text(pollutant)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
      });
    }
  
    render() {
      return (
        <div>
          <svg className="streamGraph"><g></g></svg>
        </div>
      );
    }
  }
  
  export default StreamGraph;
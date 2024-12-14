import React, { Component } from "react";
import * as d3 from "d3";

class StreamGraph extends Component {
  componentDidMount() {
    this.createLegend();
    this.renderStreamGraph();
  }

  componentDidUpdate() {
    this.renderStreamGraph();
  }

  createLegend = () => {
    const margin = { top: 40, right: 180, bottom: 40, left: 20 };
    const width = 900;
    const pollutants = ["CO(GT)", "PT08.S1(CO)", "NMHC(GT)", "C6H6(GT)", "PT08.S2(NMHC)", 
                       "NOx(GT)", "PT08.S3(NOx)", "NO2(GT)", "PT08.S4(NO2)", "PT08.S5(O3)"];
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300", 
                   "#33FFF5", "#8E44AD", "#E67E22", "#1ABC9C", "#34495E"];

    // clear existing legend
    d3.select('.streamGraph').select('.legend').remove();

    // create legend
    const legend = d3.select('.streamGraph')
      .append("g")
      .attr("class", "legend")
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

  renderStreamGraph = () => {
    // get data
    const data = this.props.csv_data;
    const pollutants = ["CO(GT)", "PT08.S1(CO)", "NMHC(GT)", "C6H6(GT)", "PT08.S2(NMHC)", 
                       "NOx(GT)", "PT08.S3(NOx)", "NO2(GT)", "PT08.S4(NO2)", "PT08.S5(O3)"];
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300", 
                   "#33FFF5", "#8E44AD", "#E67E22", "#1ABC9C", "#34495E"];

    // set dimensions and margins
    const margin = { top: 40, right: 180, bottom: 40, left: 20 };
    const width = 900;
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // clear previous graph elements but keep legend
    d3.select('.streamGraph').select('g').selectAll('*').remove();

    // create svg container
    const svg = d3.select('.streamGraph')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // create area stacks
    const stack = d3.stack().keys(pollutants).offset(d3.stackOffsetWiggle);
    const stackedData = stack(data);
    console.log(stackedData)
    // Array of 10 arrays, each describing 

    // create x and y scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Date))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(stackedData.flat(2)))
      .range([innerHeight, 0]);

    // create area generation
    const areaGenerator = d3.area()
      .x(d => xScale(d.data.Date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveCardinal);

    // display streamgraph
    svg.selectAll('path')
      .data(stackedData)
      .join('path')
      .style('fill', (d, i) => colors[i])
      .attr('d', d => areaGenerator(d));

    // add x-axis
    svg.selectAll('.x.axis')
      .data([null])
      .join('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${innerHeight + 10})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));
  }

  render() {
    return (
      <svg className="streamGraph"><g></g></svg>
    );
  }
}

export default StreamGraph;
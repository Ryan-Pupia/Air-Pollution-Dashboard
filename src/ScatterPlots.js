import React, { Component } from "react";
import * as d3 from "d3";

class ScatterPlots extends Component{
  componentDidMount(){
    this.graphPlots();
  }

  componentDidUpdate(prevProps){
    if (
      prevProps.choicePollutant!== this.props.choicePollutant || 
      prevProps.csv_data!== this.props.csv_data
    ) {
      this.graphPlots();
    }
  }

  graphPlots =() =>{
    const { csv_data, choicePollutant }= this.props;
    if (!csv_data || csv_data.length === 0 || !choicePollutant) return;

//clearing plots
    d3.select(".scatterPlots").selectAll("*").remove();

    const width =350;
    const height =350;
    const margin ={ top: 20, right: 50, bottom: 60, left: 70 };
    const iWidth =width - margin.left - margin.right;
    const iHeight =height - margin.top - margin.bottom;

    const dim = [
      { x: "T", label:"Temperature" },
      { x: "RH", label: "Relative Humidity" },
      { x: "AH", label:"Absolute Humidity" },
    ];

    const box =d3.select(".scatterPlots")
      .selectAll("svg")
      .data(dim)
      .join("svg")
      .attr("width", width)
      .attr("height", height);

    dim.forEach((dim, index) =>{
      const svg =box.filter((d, i) => i === index)
        .selectAll("g.plot-group")
        .data([null])
        .join("g")
        .attr("class", "plot-group")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale =d3.scaleLinear()
        .domain(d3.extent(csv_data, d => d[dim.x]))
        .range([0, iWidth]);

      const yScale =d3.scaleLinear()
        .domain(d3.extent(csv_data, d => d[choicePollutant]))
        .range([iHeight, 0]);

      svg.selectAll("g.x-axis")
        .data([null])
        .join("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${iHeight})`)
        .call(d3.axisBottom(xScale));

      svg.selectAll("g.y-axis")
        .data([null])
        .join("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

      svg.selectAll("circle")
        .data(csv_data)
        .join("circle")
        .attr("cx", d => xScale(d[dim.x]))
        .attr("cy", d => yScale(d[choicePollutant]))
        .attr("r", 3)
        .style("fill", "steelblue");

      svg.selectAll("text.x-label")
        .data([null])
        .join("text")
        .attr("class", "x-label")
        .attr("x", iWidth / 2)
        .attr("y", iHeight + 40)
        .attr("text-anchor", "middle")
        .text(dim.label);

      svg.selectAll("text.y-label")
        .data([null])
        .join("text")
        .attr("class", "y-label")
        .attr("x", -iHeight / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text(choicePollutant);
    });
  };

  render() {
    return <div className="scatterPlots"></div>;
  }
}

export default ScatterPlots;
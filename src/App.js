import React, { Component } from "react";
import FileUpload from "./FileUpload";
import StreamGraph from "./StreamGraph";
import ColumnList from "./ColumnList";
import Dropdown from "./Dropdown";
import ScatterPlots from "./ScatterPlots";
import SinglePollutants from "./SinglePollutants"; 
import * as d3 from "d3";
import { sliderBottom } from 'd3-simple-slider';
import "./DropdownSP.css";
import "./App.css"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalData: [],
      filteredData: [],
      pollutants: [],
      //Adding separate states for ScatterPlot and LineChart:
      ScatterPollutant: [],
      LineChartPollutant: [],
      timeRange: [0, 100],
    };
  }

  set_data = (csv_data) => {
    const pollutantsList = Object.keys(csv_data[0]).filter(
      (key)=>
        key!== "Date" && key!== "Time" && key!== "T" && key!== "RH" && key!== "AH"
    );
    // console.log("Pollutants:", pollutantsList);

    this.setState({
      originalData: csv_data,
      filteredData: csv_data,
      pollutants: pollutantsList,
      ScatterPollutant: pollutantsList[0],
      LineChartPollutant: pollutantsList[0],
    });

    console.log(csv_data);
  };

  // polSel = (pollutant) => {
  //   this.setState({ choicePollutant: pollutant });
  // };

  //Separate change handlers for Scatter and Line:
  handleScatterPollutantChange = (pollutant) => {
    this.setState({ ScatterPollutant: pollutant });   
  }

  handleLineChartChange = (pollutant) => {
    this.setState({LineChartPollutant: pollutant});
  }

  handleSliderChange = (event) => {
    const value = event.target.value;
    this.setState({ timeRange: [0, value] });
  }

  componentDidUpdate() {
    this.timeSlider();
  }

  timeSlider = () => {
    // get data
    const data = this.state.filteredData;
    // console.log("Data in createSlider():", data)

    // create slider
    const sliderRange = sliderBottom()
      .min(d3.min(data, d => d.Date))
      .max(d3.max(data, d => d.Date))
      .width(300)
      .tickFormat(d3.timeFormat('%Y-%m-%d'))
      .ticks(5)
      .default([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
      .fill('#85bb65')
      .on('onchange', val => {
          const f_data = this.state.originalData.filter(d => d.Date >= val[0] && d.Date <= val[1]);
          this.setState({ filteredData: f_data });
      });

    // add slider to page
    const gRange = d3.select('.slider-range')
        .attr('width', 500)
        .attr('height', 100)
        .selectAll('.slider-g')
        .data([null])
        .join('g')
        .attr('class', 'slider-g')
        .attr('transform', 'translate(90,30)');

    gRange.call(sliderRange);
  }

  render() {
    const { originalData, filteredData, pollutants, ScatterPollutant, LineChartPollutant, timeRange } = this.state;

    return(
      <div className="App">
        {/* File Upload */}
        <FileUpload set_data={this.set_data} />

        {/* Dropdown component
        {pollutants.length > 0 && (
          <div className="dropdown-container">
            <Dropdown
              columns={pollutants}
              onSelect={this.polSel}
            />
          </div>
        )} */}

        {/* Dropdown for ScatterPlots */}
        {pollutants.length > 0 && (
          <div className="dropdown-container-scatter">
            <Dropdown
              columns={pollutants}
              header = "Select Pollutant for Scatter Plot:"
              onSelect={this.handleScatterPollutantChange}
            />
          </div>
        )}

        {/* Dropdown for LineChart */}
        {pollutants.length > 0 && (
          <div className="dropdown-container-line">
            <Dropdown
              columns={pollutants}
              header="Select Pollutant for Line Chart:"
              onSelect={this.handleLineChartChange}
            />
          </div>
        )}
        
        {/* Date Slider */}
        <div className="mySlider">
          <svg className="slider-range"></svg>
        </div>

        {/* Column List */}
        {/* <div className="column-list-container">
          <ColumnList csv_data={originalData} />
        </div> */}

        {/* Stream Graph and Single Pollutants Visualization */}
        <div className="streamAndLine">
          <div className="item">
            <StreamGraph csv_data={filteredData} />
          </div>
          <div className="item">
            {LineChartPollutant && (
              <SinglePollutants 
                csv_data={filteredData} 
                columns={pollutants} 
                choicePollutant={LineChartPollutant} 
                timeRange={timeRange}
              />
            )}
          </div>
        </div>

        {/* Scatter Plots */}
        {ScatterPollutant && (
            <ScatterPlots
              csv_data={originalData}
              choicePollutant={ScatterPollutant}
            />
        )}
      </div>
    );
  }
}

export default App;
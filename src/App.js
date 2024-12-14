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
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalData: [],
      filteredData: [],
      pollutants: [],
      ScatterPollutant: [],
      LineChartPollutant: [],
      currentDateRange: null,
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

    //console.log(csv_data);
  };

  // polSel = (pollutant) => {
  //   this.setState({ choicePollutant: pollutant });
  // };

  //Separate change handlers for Scatter and Line:
  handleScatterPollutantChange = (pollutant) => {
    this.setState({ ScatterPollutant: pollutant });   
  }
  currentDateRangeFilter = (data, dateRange) => {
    if (!dateRange) return data;
    return data.filter(
      d => new Date(d.Date) >= dateRange[0] && new Date(d.Date) <= dateRange[1]
    );
  }

  // handleLineChartChange = (pollutant) => {
  //   this.setState({LineChartPollutant: pollutant});
  // }
  handleLineChartChange = (pollutant) => {
    // line chart needs to be updated while keeping current date range
    const filteredData = this.currentDateRangeFilter(
      this.state.originalData, 
      this.state.currentDateRange
    );

    this.setState({ 
      LineChartPollutant: pollutant,
      filteredData: filteredData
    });
  }

  // handle slider to not update each time a dropdown is selected
  handleSliderChange = (event) => {
    const filteredData = this.currentDateRangeFilter(
      this.state.originalData, 
      this.state.currentDateRange
    );
    const value = event.target.value;
    this.setState({ timeRange: [0, value],
      filteredData: filteredData
     });
  }

  componentDidUpdate() {
    this.timeSlider();
  }

  timeSlider = () => {
    const data = this.state.filteredData;
    const allDates = data.map(d => new Date(d.Date));
    const minDate = d3.min(allDates);
    const maxDate = d3.max(allDates);
    const weekmili = 7 * 24 * 60 * 60 * 1000;
  
    const sliderRange = sliderBottom()
      .min(minDate)
      .max(maxDate)
      .width(300)
      .tickFormat(d3.timeFormat('%Y-%m-%d'))
      .ticks(5)
      .default([minDate, maxDate])
      .fill('#85bb65')
      .on('onchange', val => {
        // 7 day range to debug
        if (val[1] - val[0] < weekmili) {
          val[1] = new Date(val[0].getTime() + weekmili);
        }

        // state stores date range currently
        this.setState({ 
          currentDateRange: val,
          filteredData: this.state.originalData.filter(
            d => new Date(d.Date) >= val[0] && new Date(d.Date) <= val[1]
          )
        });
      });

    const gRange = d3.select('.slider-range')
      .attr('width', 500)
      .attr('height', 80)
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

        {/* Show dashboard only when data is loaded */}
        {originalData.length > 0 && (
          <>
            {/* Column List */}
            <div className="column-list-container">
              <ColumnList csv_data={originalData} />
            </div>
            
            {/* Date Slider */}
            <div className="mySlider">
              <svg className="slider-range"></svg>
            </div>

            {/* Stream Graph and Single Pollutants w/ Dropdown Visualization */}
            <div className="streamAndLine">
              <div className="item">
                <h3>StreamGraph:</h3>
                <StreamGraph csv_data={filteredData} />
              </div>
              <div className="item">
                {/* Dropdown for LineChart */}
                {pollutants.length > 0 && (
                  <Dropdown
                    columns={pollutants}
                    onSelect={this.handleLineChartChange}
                  />
                )}
                <h3>LineChart:</h3>
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

            {/* Scatter Plot Dropdown */}
            <div className="scatterPlotDropdown">
              {/* Dropdown for ScatterPlots */}
              {pollutants.length > 0 && (
                <Dropdown
                  columns={pollutants}
                  onSelect={this.handleScatterPollutantChange}
                />
              )}
            </div>

            {/* Scatter Plots */}
            <h3>ScatterPlots:</h3>
            {ScatterPollutant && (
                <ScatterPlots
                  csv_data={originalData}
                  choicePollutant={ScatterPollutant}
                />
            )}
          </>
        )}
      </div>  
    );
  }
}

export default App;
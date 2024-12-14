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
      sliderInitialized: false
    };
  }

  set_data = (csv_data) => {
    const pollutantsList = Object.keys(csv_data[0]).filter(
      (key)=>
        key!== "Date" && key!== "Time" && key!== "T" && key!== "RH" && key!== "AH"
    );

    this.setState({
      originalData: csv_data,
      filteredData: csv_data,
      pollutants: pollutantsList,
      ScatterPollutant: pollutantsList[0],
      LineChartPollutant: pollutantsList[0],
    }, () => {
      // Initialize slider after data is set
      if (!this.state.sliderInitialized) {
        this.initializeTimeSlider();
      }
    });
  };

  handleScatterPollutantChange = (pollutant) => {
    this.setState({ ScatterPollutant: pollutant });   
  }

  currentDateRangeFilter = (data, dateRange) => {
    if (!dateRange) return data;
    return data.filter(
      d => new Date(d.Date) >= dateRange[0] && new Date(d.Date) <= dateRange[1]
    );
  }

  handleLineChartChange = (pollutant) => {
    const filteredData = this.currentDateRangeFilter(
      this.state.originalData, 
      this.state.currentDateRange
    );

    this.setState({ 
      LineChartPollutant: pollutant,
      filteredData: filteredData
    });
  }

  handleSliderChange = (event) => {
    const filteredData = this.currentDateRangeFilter(
      this.state.originalData, 
      this.state.currentDateRange
    );
    const value = event.target.value;
    this.setState({ 
      timeRange: [0, value],
      filteredData: filteredData
    });
  }

  initializeTimeSlider = () => {
    const data = this.state.originalData;
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
        if (val[1] - val[0] < weekmili) {
          val[1] = new Date(val[0].getTime() + weekmili);
        }

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
    
    this.setState({ sliderInitialized: true });
  }

  componentDidMount() {
    // if data is already loaded when component mounts, initialize slider
    if (this.state.originalData.length > 0 && !this.state.sliderInitialized) {
      this.initializeTimeSlider();
    }
  }

  render() {
    const { originalData, filteredData, pollutants, ScatterPollutant, LineChartPollutant, timeRange } = this.state;

    return(
      <div className="App">
        <FileUpload set_data={this.set_data} />

        {originalData.length > 0 && (
          <>
            <ColumnList csv_data={originalData} />
            <div className="Component-1">
              <div className="mySlider">
                <svg className="slider-range"></svg>
              </div>

              <div className="streamAndLine">
                <div className="item">
                  <h3 style={{ marginTop: 5, marginBottom: 5 }}>StreamGraph:</h3>
                  <StreamGraph csv_data={filteredData} />
                </div>
                <div className="item">
                  {pollutants.length > 0 && (
                    <Dropdown
                      columns={pollutants}
                      onSelect={this.handleLineChartChange}
                    />
                  )}
                  <h3 style={{ marginTop: 5, marginBottom: 5 }}>LineChart:</h3>
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
            </div>

            <div className="Component-2">
              <div className="scatterPlotLabelAndDropdown">
                <div className="item">
                  <h3 style={{ marginTop: 5, marginBottom: 5 }}>ScatterPlots:</h3>
                </div>
                <div className="item">
                  {pollutants.length > 0 && (
                    <Dropdown
                      columns={pollutants}
                      onSelect={this.handleScatterPollutantChange}
                    />
                  )}
                </div>
              </div>

              {ScatterPollutant && (
                  <ScatterPlots
                    csv_data={originalData}
                    choicePollutant={ScatterPollutant}
                  />
              )}
            </div>
          </>
        )}
      </div>  
    );
  }
}

export default App;
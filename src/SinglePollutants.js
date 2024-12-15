import React, { Component } from "react";
import * as d3 from 'd3';

class SinglePollutants extends Component {
    componentDidMount() {
        this.pollutantGraph();
    }

    // Calls the pollutantGraph when any of the props is changed:
    componentDidUpdate(previousProps) {
        if (previousProps.csv_data !== this.props.csv_data || 
            previousProps.choicePollutant !== this.props.choicePollutant || 
            previousProps.timeRange !== this.props.timeRange) {
            this.pollutantGraph();
        }
    }

    // Choosing the relevant columns: If a pollutant has both GT and PT08 features, the graph will plot both features for the pollutant:
    pollutantGraph = () => {
        const { csv_data, choicePollutant, timeRange } = this.props;
        // console.log("In SP, pG:", this.props);

        // In case of an irrelevant pollutant:
        if (!choicePollutant) {
            return;
        }

        const columnMapping = { 
            "CO(GT)": "PT08.S1(CO)",
            "NMHC(GT)": "PT08.S2(NMHC)", 
            "NOx(GT)": "PT08.S3(NOx)", 
            "NO2(GT)": "PT08.S4(NO2)", 
            "C6H6(GT)": null, // C6H6 has no PT08 column
            "PT08.S5(O3)": "PT08.S5(O3)" // O3 has no GT column
        };

        // To check if the column is a PT08 column or GT Column:
        let baseColumn = null; 
        let sensorColumn = null; 
        if (choicePollutant.includes("PT08")) {
            baseColumn = null; 
            sensorColumn = choicePollutant; 
        } else{ 
            baseColumn = choicePollutant; 
            sensorColumn = columnMapping[choicePollutant]; 
        }

        const filteredData = csv_data.filter(entry => entry[baseColumn] !== null || entry[sensorColumn] !== null);

        // Time range selection:
        const startDate = new Date(filteredData[0].Date);
        const endDate = new Date(filteredData[filteredData.length - 1].Date);
        const totalDuration = endDate - startDate;

        // Filtering data based on selected time range:
        const narrowedData = filteredData.filter(entry => {
            const entryDate = new Date(entry.Date);
            const timeElapsed = entryDate - startDate;
            const percentElapsed = (timeElapsed / totalDuration) * 100;
            return percentElapsed >= timeRange[0] && percentElapsed <= timeRange[1];
        });

        // Making margins and dimensions
        const margin = {top: 50, right: 50, bottom: 10, left: 50}
        const h = 140
        const w = 700

        // D3 scales:
        const xScale = d3.scaleTime()
            .domain([new Date(narrowedData[0].Date), new Date(narrowedData[narrowedData.length - 1].Date)])
            .range([0, w]);

        const yScale = d3.scaleLinear()
            .domain([
                0,
                d3.max(narrowedData, d => Math.max(d[baseColumn] || 0, sensorColumn ? d[sensorColumn] : 0))
            ])
            .range([h, 0]);

        // Clearing any previous SVG elements:
        d3.select(".pollutantGraph").selectAll("*").remove();

        const svgElement = d3.select(".pollutantGraph")
            .attr("width", margin.left + w + margin.right)
            .attr("height", margin.top + h + margin.bottom)
            
        const container = svgElement.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .attr('height', h)
            .attr('width', w);

        // Scales:
        svgElement.append("g")
            .attr('class', 'x-axis')
            .attr("transform", `translate(${margin.left}, ${margin.top + h})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

        svgElement.append("g")
            .attr('class', 'y-axis')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisLeft(yScale));

        if (baseColumn) {
            container.append("path")
                .datum(narrowedData)
                .attr("fill", "none")
                .attr("stroke", "blue") 
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(entry => xScale(new Date(entry.Date)))
                    .y(entry => yScale(entry[baseColumn]))
                );
        }
            
        if (sensorColumn) {
            container.append("path")
                .datum(narrowedData)
                .attr("fill", "none")
                .attr("stroke", "red") 
                .attr("stroke-width", 2)
                .attr("d", d3.line()
                    .x(entry => xScale(new Date(entry.Date)))
                    .y(entry => yScale(entry[sensorColumn]))
                );
        }

        // LEGEND:
        const legend = svgElement.append("g")
            .attr("class", "legend")

        if (baseColumn) {
            legend.append("rect")
                .attr("x", margin.left + w + margin.right/4)
                .attr("y", margin.top + h/4)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "blue");

            legend.append("text")
                .attr("x", margin.left + w + margin.right/4+ 20)
                .attr("y", margin.top + h/4 + 10)
                .attr("dy", "-0.25em")
                .style("text-anchor", "start")
                .text("GT");
        }

        if (sensorColumn) {
            legend.append("rect")
                .attr("x", margin.left + w + margin.right/4)
                .attr("y", margin.top + h/4 + (baseColumn ? 20 : 0))
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "red"); 

            legend.append("text")
                .attr("x", margin.left + w + margin.right/4+ 20)
                .attr("y", margin.top + h/4 + (baseColumn ? 30 : 10))
                .attr("dy", "-0.25em")
                .style("text-anchor", "start")
                .text("Sens");
        }
    }

    render() {
        return (
            <svg className="pollutantGraph"></svg>
        );
    }
}

export default SinglePollutants;
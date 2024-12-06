import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  // New state to store the parsed JSON data
    };
  }
  
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  // Set JSON to state
        this.props.set_data(json)
      };
      reader.readAsText(file);
    }
  };

  csvToJson = (csv) => {
    const lines = csv.split(/\r?\n/)
                   .filter(line => {
                     const nonEmptyLine = line.replace(/,/g, '').trim();
                     return nonEmptyLine.length > 0;
                   });
    // console.log("Lines:", lines)
    const headers = lines[0].split(","); // Split first row to get headers
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(","); // Split each line by comma
      const obj = {};

      // Map each column value to the corresponding header
      headers.forEach((header, index) => {
        obj[header.trim()] = currentLine[index]?.trim(); // Trim to remove spaces
      });

      // Add object to result if it's not an empty row
      if (Object.keys(obj).length && lines[i].trim()) {
        const parsedObj = {
          Date:new Date(obj.Date + " " + obj.Time),
          "CO(GT)": parseFloat(obj["CO(GT)"]),
          "PT08.S1(CO)": parseFloat(obj["PT08.S1(CO)"]),
          "NMHC(GT)": parseFloat(obj["NMHC(GT)"]),
          "C6H6(GT)": parseFloat(obj["C6H6(GT)"]),
          "PT08.S2(NMHC)": parseFloat(obj["PT08.S2(NMHC)"]),
          "NOx(GT)": parseFloat(obj["NOx(GT)"]),
          "PT08.S3(NOx)": parseFloat(obj["PT08.S3(NOx)"]),
          "NO2(GT)": parseFloat(obj["NO2(GT)"]),
          "PT08.S4(NO2)": parseFloat(obj["PT08.S4(NO2)"]),
          "PT08.S5(O3)": parseFloat(obj["PT08.S5(O3)"]),
          "T": parseFloat(obj["T"]),
          "RH": parseFloat(obj["RH"]),
          "AH": parseFloat(obj["AH"]),
        };
        result.push(parsedObj);
      }
    }

    return result;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;

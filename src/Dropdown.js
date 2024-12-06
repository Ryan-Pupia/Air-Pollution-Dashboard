import React, { Component } from "react";

class Dropdown extends Component {
  constructor(props){
    super(props);
    this.state ={ selectedPollutant: props.columns[0] };
  }

  changes = (event) =>{
    const selectedPollutant =event.target.value;
    this.setState({ selectedPollutant});
    this.props.onSelect(selectedPollutant);
  };

  render() {
    const { columns } =this.props;
    return (
      <div>
        <h3>Select Pollutant:</h3>
        <select value={this.state.selectedPollutant} onChange={this.changes}>
          {columns.map((column, index)=>(
            <option key={index} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
export default Dropdown;

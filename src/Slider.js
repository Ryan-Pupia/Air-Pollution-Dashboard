import React, { useState } from "react";

const Slider = ({ onSliderChange }) => {
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState("2024-12-31");

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    setStart(newStart);
    onSliderChange({ start: newStart, end });
  };

  const handleEndChange = (e) => {
    const newEnd = e.target.value;
    setEnd(newEnd);
    onSliderChange({ start, end: newEnd });
  };

  return (
    <div>
      <h3>Date Range Selector</h3>
      <label>
        Start Date:
        <input type="date" value={start} onChange={handleStartChange} />
      </label>
      <label>
        End Date:
        <input type="date" value={end} onChange={handleEndChange} />
      </label>
    </div>
  );
};

export default Slider;

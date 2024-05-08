import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [inputURL, setInputURL] = useState('');
  const [summary, setSummary] = useState('');
  const [sliderValue, setSliderValue] = useState(50);

  const handleSummarize = async () => {
    try {
      const ratio = sliderValue / 100;
      const response = await axios.post("http://18.216.227.131:5000/summarize", {
        text: inputText || null,
        url: inputURL || null,
        ratio: ratio,
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error summarizing text:', error);
    }
  };

  return (
    <div className="App">
      <div className="background-image"></div>
      <header className="App-header">
        <h1>CMSC421 Final Project: Text Summarization</h1>
        <p className="group-names">
          Group Members: Krish Patel, Fei Yuan, Kevin Fan, Aahil Sudhin, Pragadeshwar Kalatheeswaran
        </p>
      </header>
      <main className="App-main">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text here..."
          rows="10"
          cols="50"
          className="text-input"
        />
        <input
          type="url"
          value={inputURL}
          onChange={(e) => setInputURL(e.target.value)}
          placeholder="Enter a URL..."
          className="url-input"
        />
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          step="1"
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="slider-input"
        />
        <span className="slider-label">{`${sliderValue}%`}</span>
        <button onClick={handleSummarize} className="summarize-button">
          Summarize
        </button>
        <h2>Summary</h2>
        <p className="summary">{summary}</p>
      </main>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [inputURL, setInputURL] = useState('');
  const [summary, setSummary] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [sentenceRanking, setSentenceRanking] = useState([]);
  const [wordCloudUrl, setWordCloudUrl] = useState("");


  const makecloud = async (summaryText) => {
    fetch("https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud", {
      method: "POST",
      headers: {
        "x-rapidapi-host": "textvis-word-cloud-v1.p.rapidapi.com",
        "x-rapidapi-key": "53f2caf8e1msh31d325de77c144ap1b2e81jsn6aa549374d90",
        "content-type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify({
        text: summaryText,
        scale: 1,
        width: 800,
        height: 800,
        colors: ["#375E97", "#FB6542", "#FFBB00", "#3F681C"],
        font: "Tahoma",
        use_stopwords: true,
        language: "en",
        uppercase: false
      })
    })
      .then(response => {
        return response.text();
      })
      .then(wordCloud => {
        var img = document.getElementById("wordCloud");
        img.src = wordCloud;
        img.height = 800;
        img.width = 800;
      })
      .catch(err => {
        console.log(err);
      });

  }

  const handleSummarize = async () => {
    try {
      const ratio = sliderValue / 100;
      const response = await axios.post("http://18.216.227.131:5000/summarize", {
        text: inputText || null,
        url: inputURL || null,
        ratio: ratio,
      });
      const summaryText = response.data.original_text;
      setSummary(response.data.summary);
      setSentenceRanking(response.data.sentence_ranking);
      makecloud(summaryText)
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
        <h3>Top 10 Sentences</h3>
        <ol className="sentence-ranking">
          {sentenceRanking.slice(0, 10).map((sentence, index) => (
            <li key={index}>{sentence}</li>
          ))}
        </ol>
        <h2>Word Cloud</h2>
        <p>Below we created a word cloud, which visualizes the most important words that appear within the text.</p>
        <img id="wordCloud" />
      </main>
    </div>
  );
}

export default App;

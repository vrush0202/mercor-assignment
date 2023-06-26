import React, { useState, useEffect } from "react";
import { createChatMessage } from "./chatUtils"; // Helper function to create chat messages
import { OpenAIAPIKey } from "./config"; // Replace with your OpenAI API key

const App = () => {
  const [response, setResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      setSpeechRecognition(recognition);
    } else {
      console.log("Speech recognition not supported.");
    }
  }, []);
  const generateChatMessage = async (inputText) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OpenAIAPIKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: inputText }],
        }),
      });
  
      const data = await response.json();
      const chatResponse = data.choices[0].message.content;
      return chatResponse;
    } catch (error) {
      console.error("Error:", error);
      return "An error occurred while generating the response.";
    }
  };
  
  const handleGenerateAudio = async () => {
    const chatResponse = await generateChatMessage(response);
    setResponse(chatResponse);
    speakResponse(chatResponse);
  };

  const speakResponse = (text) => {
    try {
      const synthesis = window.speechSynthesis;
      if ("speechSynthesis" in window) {
        const voice = synthesis.getVoices().find((voice) => voice.lang === "en");
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.volume = 1;
        synthesis.speak(utterance);
      } else {
        console.log("Text-to-speech not supported.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleListen = () => {
    if (speechRecognition) {
      setListening(true);
      speechRecognition.start();
    } else {
      console.log("Speech recognition not supported.");
    }
  };

  const handleStopListening = () => {
    if (speechRecognition) {
      setListening(false);
      speechRecognition.stop();
    } else {
      console.log("Speech recognition not supported.");
    }
  };

  if (speechRecognition) {
    speechRecognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setResponse(speechToText);
      handleGenerateAudio(); // Generate audio immediately when speech is recognized
    };
  }

  return (
    <div>
      <h1>GPT Audio Web App</h1>
      <div style={{ display: "flex" }}>
        <button onClick={handleGenerateAudio}>Generate Audio</button>
        <button onClick={listening ? handleStopListening : handleListen}>
          {listening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>
      {response && <p>Response: {response}</p>}
    </div>
  );
};

export default App;

import "./App.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useState } from "react";
import Sentiment from 'sentiment';
import { translate } from '@vitalets/google-translate-api';

const response = await fetch(`https://cors-anywhere.herokuapp.com/https://translate.google.com/translate_a/single?...`, { /* options */ });
const App = () => {
    const [textToCopy, setTextToCopy] = useState('');
    const [language, setLanguage] = useState('en');
    const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const sentiment = new Sentiment();

    // Translate text to English if language is not English
    const translateToEnglish = async (text, targetLanguage) => {
        if (targetLanguage === 'en') return text;
    
        try {
            const response = await fetch('http://localhost:5000/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, from: targetLanguage, to: 'en' })
            });
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error("Error translating text:", error);
            alert("Translation failed.");
            return text;
        }
    };    

    const analyzeSentiment = async () => {
        let sampleText = textToCopy || transcript;
        if (language !== 'en') sampleText = await translateToEnglish(sampleText, language);
        console.log(sampleText);
        const result = sentiment.analyze(sampleText);
        alert(`Sentiment Score: ${result.score}`);
    };

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true, language: language });
    };

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser does not support speech recognition.</p>;
    }

    return (
        <div className="container">
            <h2>Speech to Text Converter</h2>

            <textarea
                className="main-content"
                value={textToCopy || transcript}
                onChange={(e) => setTextToCopy(e.target.value)}
                placeholder="Click 'Start Listening' and speak something..."
                rows="10"
                cols="50"
            />

            <div className="btn-style">
                <button onClick={startListening}>Start Listening</button>
                <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
                <button onClick={() => { resetTranscript(); setTextToCopy(''); }}>Clear</button>
                <button onClick={analyzeSentiment}>Get Sentiment Analysis</button>
            </div>

            <div>
                <label htmlFor="language-select">Select Language: </label>
                <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="en">English (US)</option>
                    <option value="te">Telugu</option>
                    {/* Add more language options as needed */}
                </select>
            </div>
        </div>
    );
};

export default App;
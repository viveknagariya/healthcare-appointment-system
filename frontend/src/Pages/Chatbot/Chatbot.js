import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, Send, Mic, Bot, User } from "lucide-react";
import "../Chatbot/Chatbot.css";

const removeEmojis = (text) =>
  String(text || "").replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,
    "",
  );

const formatText = (text) => {
  return removeEmojis(text)
    .split("\n")
    .map((str, index) => {
      const formattedStr = str
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
      return (
        <span key={index}>
          <span dangerouslySetInnerHTML={{ __html: formattedStr }} />
          <br />
        </span>
      );
    });
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am **MediQ AI**, your personal health consultant. \n\nPlease tell me what symptoms you are experiencing today (e.g., Fever, Cold, Acidity).",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition)
      return alert("Browser does not support Voice Recognition.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setInput(speechText);
      handleSend(speechText);
    };
    recognition.start();
  };

  const handleSend = async (eOrVoiceText) => {
    if (eOrVoiceText && typeof eOrVoiceText.preventDefault === "function") {
      eOrVoiceText.preventDefault();
    }

    const finalInput = typeof eOrVoiceText === "string" ? eOrVoiceText : input;
    if (!finalInput.trim() || loading) return;

    setMessages((prev) => [...prev, { text: finalInput, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/medicines/chat/ai-chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: finalInput }),
        },
      );
      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Server Error!", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page-wrapper">
      <div className="chat-container">
        <header className="chat-header">
          <div className="header-info">
            <div className="bot-avatar-header">
              <Bot size={28} color="#fff" />
            </div>
            <div>
              <h3>MediQ AI Support</h3>
              <p className="online-status">
                <span className="online-dot"></span> Online - Ready to help
              </p>
            </div>
          </div>
          <Link to="/" className="home-btn">
            <Home size={22} />
          </Link>
        </header>

        <div className="chat-box">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrapper ${m.sender}`}>
              {m.sender === "bot" && (
                <div className="avatar bot-avatar">
                  <Bot size={20} />
                </div>
              )}
              <div className={`msg ${m.sender}`}>
                <div className="msg-content">{formatText(m.text)}</div>
              </div>
              {m.sender === "user" && (
                <div className="avatar user-avatar">
                  <User size={20} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="msg-wrapper bot">
              <div className="avatar bot-avatar">
                <Bot size={20} />
              </div>
              <div className="msg bot typing-indicator">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <button
            className={`mic-btn ${isListening ? "active" : ""}`}
            onClick={startListening}
          >
            <Mic size={26} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type symptoms here..."
          />
          <button onClick={handleSend} className="send-btn">
            <Send size={26} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

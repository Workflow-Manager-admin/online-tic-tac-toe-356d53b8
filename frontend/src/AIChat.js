import React, { useState } from "react";

// PUBLIC_INTERFACE
function AIChat({ board, status }) {
  /**
   * AI Chat component that connects to OpenAI and provides
   * real-time commentary and hints on Tic Tac Toe gameplay.
   * 
   * Props:
   *   - board: current array of 9 elements representing the Tic Tac Toe board
   *   - status: current game status string
   */
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm the Tic Tac Toe AI Assistant. Ask for a hint or chat about your moves!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper function to serialize board state
  function boardToString(boardArr) {
    // 'X O X\nO X O\n      '
    let out = "";
    for (let i = 0; i < 9; i += 3) {
      out += boardArr.slice(i, i + 3)
        .map(cell => cell ? cell : " ")
        .join(" ");
      out += "\n";
    }
    return out.trim();
  }

  // Generate prompt for OpenAI
  function makePrompt(userMessage) {
    return (
`You are an expert Tic Tac Toe commentator and strategy assistant.

Current board:
${boardToString(board)}

Current status: ${status}

Respond in a friendly and concise way.
1. If the user asks for a hint or help, provide one useful move suggestion or brief strategic advice, based on the board. 
2. If not, provide fun, insightful commentary about the current game, moves, or situation.
Short responses (max 2 sentences).

User: ${userMessage}`
    );
  }

  // PUBLIC_INTERFACE
  async function sendMessage(e) {
    e && e.preventDefault && e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(msgs => [...msgs, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // Use OpenAI Chat API via fetch (API key must NOT be checked in; we use env var)
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a Tic Tac Toe AI who adds live commentary and provides helpful hints. Responses: max 2 sentences." },
            { role: "user", content: makePrompt(userMsg) }
          ],
          max_tokens: 90,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error("AI request failed");

      const data = await response.json();
      const aiMsg = data.choices?.[0]?.message?.content?.trim() || "I'm not sure what to say. Try again!";
      setMessages(msgs => [...msgs, { sender: "ai", text: aiMsg }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: "ai", text: "Sorry, I had trouble connecting to OpenAI for now. Try again later!" }]);
    }

    setLoading(false);
  }

  // UI rendering for messages
  function renderMessages() {
    return (
      <div className="ai-chat-history" style={{
        maxHeight: 180, overflowY: 'auto',
        background: '#f8fafc', borderRadius: 9, padding: 12, marginBottom: 7, fontSize: '1rem'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 6, textAlign: msg.sender === "user" ? 'right' : 'left' }}>
            <span
              style={{
                display: 'inline-block',
                color: msg.sender === "user" ? "#2196f3" : "#ff9800",
                fontWeight: msg.sender === "ai" ? 500 : 600,
                background: msg.sender === "ai" ? "rgba(255, 152, 0, 0.07)" : "rgba(33, 150, 243, 0.07)",
                borderRadius: 7,
                padding: "5px 10px",
                maxWidth: 295,
                overflowWrap: "anywhere"
              }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function handleInput(e) {
    setInput(e.target.value);
  }

  return (
    <div className="ai-chat-box"
      style={{
        margin: "22px auto 0 auto",
        maxWidth: 330,
        background: "#fff",
        border: "1.3px solid #e9ecef",
        borderRadius: 11,
        padding: "10px 16px"
      }}>
      <div style={{ fontWeight: 600, color: "#2196f3", fontSize: "1.15rem", marginBottom: 4 }}>
        🎙️ AI Game Chat & Hints
      </div>
      {renderMessages()}
      <form style={{ display: "flex", gap: 7 }} onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={handleInput}
          style={{
            flex: 1,
            padding: "7px 10px",
            borderRadius: 7,
            border: "1px solid #b8b8b8",
            fontSize: "1rem"
          }}
          placeholder="Ask for a hint, or chat about a move..."
          aria-label="Type a message for the AI"
        />
        <button type="submit" style={{
          background: "#ff9800",
          border: "none",
          borderRadius: 7,
          padding: "0 15px",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.55 : 1
        }} disabled={loading || !input.trim()}>
          {loading ? "..." : "Send"}
        </button>
      </form>
      <div style={{ fontSize: "0.93em", color: "#888", marginTop: 2 }}>
        <span>Try: "Give me a hint" or "What do you think of my last move?"</span>
      </div>
      <div style={{ fontSize: "0.89em", color: "#acacac", marginTop: 5 }}>
        Powered by OpenAI · Never share personal info
      </div>
    </div>
  );
}

export default AIChat;

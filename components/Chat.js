

import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
 const chatKey = `chatConversation_${user.phone}`;

  // Reynir að hlaða samtal úr localStorage við upphaf
  useEffect(() => {
    const storedChat = localStorage.getItem(chatKey);
    if (storedChat) {
      setMessages(JSON.parse(storedChat));
    }
  }, []);

  // Auto-scroll og vista samtal í localStorage
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem(chatKey, JSON.stringify(messages));
  }, [messages, chatKey]);


  // Vista samtal á bakenda
  useEffect(() => {
    async function saveChat() {
      try {
        await fetch("/api/saveChat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, messages }),
        });
      } catch (error) {
        console.error("Villa við að vista samtal:", error);
      }
    }
    // Kalla á saveChat ef samtalið er ekki tómt
    if (messages.length > 0) {
      saveChat();
    }
  }, [messages, user]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        
      });
const rawData = await response.text();
console.log("Raw API response:", rawData);
      
     const data = JSON.parse(rawData);
      const aiResponse =
        data.response ||
        (data.choices && data.choices[0]?.message?.content) ||
        "Villa: ekkert svar frá AI.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("Villa við að senda skilaboð:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    {/* Fixed logout button */}
    <button
      onClick={onLogout}
      className="fixed top-4 right-4 bg-red bg-opacity-75 text-black px-8 py-4 text-xl font-bold rounded border-2 border-white shadow-2xl z-50 drop-shadow-xl"
  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
    >
      Útskrá
    </button>
    <h1 className="text-2xl font-bold mb-4">Hæhæ, {user.name}!</h1>
    {/* Chat container sem inniheldur mynd, skilaboð o.s.frv. */}
    <div className="w-full max-w-lg bg-white p-6 rounded shadow-md overflow-y-auto h-96">
      <img
        src="/logo.png"
        alt="Spurðu logo"
        className="w-90 h-auto opacity-80 mx-auto mb-4"
      />
      {Array.isArray(messages) &&
        messages.map((msg, index) => {
          let detectedCompany = "Óþekkt fyrirtæki";
          if (typeof msg.content !== "string") {
            console.warn("⚠️ msg.content er ekki strengur!");
            return null;
          }
          const hasAskedEnoughQuestions = messages.filter(m => m.role === "assistant").length > 1;
          const matchAnyCompany = msg.content.match(
            /(Húðlæknastöðin|Heilsugæslan við Höfða|Sameind|Heyrn|HP Þjálfun ehf|Tannlæknastofan brostu|Sjónlag|Hjartamiðstöðin|Gigtarmiðstöð Íslands)/i
          );
          if (matchAnyCompany && hasAskedEnoughQuestions) {
            detectedCompany = matchAnyCompany[1];
          }
          if (detectedCompany === "Óþekkt fyrirtæki") {
            console.warn("🚨 Engin fyrirtæki fundust í AI svarinu!");
          }
          const isLastMessage = index === messages.length - 1;
          return (
            <div
              key={index}
              className={`p-2 my-1 rounded ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
            >
              <strong>{msg.role === "user" ? "Þú" : "Ráðgjafi"}:</strong>
              <p style={{ whiteSpace: "pre-line" }}>{msg.content}</p>
              {isLastMessage &&
                msg.role === "assistant" &&
                detectedCompany &&
                detectedCompany !== "Óþekkt fyrirtæki" && (
                  <a
                    href={`/booking?company=${encodeURIComponent(detectedCompany)}`}
                    className="bg-green-500 text-white p-2 rounded mt-2 block text-center"
                  >
                    📅 Bóka tíma hjá {detectedCompany}
                  </a>
                )}
            </div>
          );
        })}
      {loading && (
        <div className="p-2 my-1 rounded bg-gray-200 text-black self-start">
          <strong>Ráðgjafi:</strong>
          <p className="animate-pulse">Ég er að hugsa...</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
    
    {/* Input-form */}
    <form onSubmit={sendMessage} className="w-full max-w-lg mt-4 flex">
      <TextareaAutosize
        minRows={1}
        maxRows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Sláðu inn einkenni eða spurningu..."
        className="border p-2 flex-1 rounded-l"
        style={{ resize: "none" }}
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
        Senda
      </button>
    </form>
  </div>
);
}


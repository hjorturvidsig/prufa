import { useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function Symptoms() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

const messagesEndRef = useRef(null);

 useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return; 

  const newMessages = [...messages, { role: "user", content: input }];
  setMessages(newMessages);
  setInput("");
  setLoading(true); // 👉 Bætum við loading state
  console.log("📤 Sendi gögn til API:", newMessages);

  try {
    const response = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await response.json();
    console.log("📥 Svar frá API:", data);

	const aiResponse = data.response || (data.choices && data.choices[0]?.message?.content) || "Villa: ekkert svar frá AI.";
	setMessages((prevMessages) => {
	const updatedMessages = [...prevMessages, { role: "assistant", content: aiResponse }];
  	console.log("✅ Uppfært messages fylki:", updatedMessages);
	return updatedMessages  
});
    

  } catch (error) {
    console.error("❌ Villa við að senda skilaboð:", error);
  } finally {
  setLoading(false); // 👉 Slökkvum á loading state hvort sem svar kom eða ekki
}
};


  const handleKeyDown = (e) => {
    // Ef Enter er ýtt án þess að Shift sé haldið niðri, sendum við skilaboðin
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Hindra að ný lína bætist við
      sendMessage(e);
    }
  };


console.log("AI svar sem birtist í spjallinu:", messages);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Spurðu</h1>
      <div className="w-full max-w-lg bg-white p-6 rounded shadow-md overflow-y-auto h-96">
	<img src="/logo.png" alt="Spurðu logo" className="w-38 h-38 opacity-80 mx-auto" />    
    {Array.isArray(messages) && messages.map((msg, index) => {

	      	//Reynum að finna fyrirtækið í mismunandi uppsetningum frá AI
		let detectedCompany = "Óþekkt fyrirtæki";
		if (typeof msg.content !== "string") {
  			console.warn("⚠️ msg.content er ekki strengur! Það gæti verið JSON eða eitthvað annað.");  	
		return null;
	}

	const hasAskedEnoughQuestions = messages.filter(m => m.role === "assistant").length > 1; 
	const matchAnyCompany = msg.content.match(/(Sálfræðistofan Höfðabakka|Húðlæknastöðin|Heilsugæslan við Höfða|Sameind|Heyrn|HP Þjálfun ehf|Tannlæknastofan brostu|Sjónlag|Hjartamiðstöðin|Gigtarmiðstöð Íslands)/i); // Bætum við fleiri nöfnum
	

	// Ef við finnum fyrirtæki, uppfærum detectedCompany
	if (matchAnyCompany && hasAskedEnoughQuestions) {
 	 detectedCompany = matchAnyCompany[1];
	}


	if (detectedCompany === "Óþekkt fyrirtæki") {
  	console.warn("🚨 Engin fyrirtæki fundust í AI svarinu!");
	}

	 // Athugum hvort þetta sé nýjasta skilaboðið
	const isLastMessage = index === messages.length - 1;
	
  
  return (
    <div key={index} className={`p-2 my-1 rounded ${msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>

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
      
 {/* Svar input með auto-expanding textarea */}
      <form onSubmit={sendMessage} className="w-full max-w-lg mt-4 flex">
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
  	   onKeyDown={handleKeyDown}  // Við bætum þessu við hér
        placeholder="Sláðu inn einkenni eða spurningu..."
          className="border p-2 flex-1 rounded-l"
          style={{ resize: "none" }} // Hindra handvirka breytingu á stærð
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-r">
          Senda
        </button>
      </form>
    </div>
  );
}

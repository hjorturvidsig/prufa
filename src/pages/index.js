import { useState, useEffect } from "react";
import Login from "../../components/Login";
import Chat from "../../components/Chat";

export default function App() {


  const [user, setUser] = useState(null);

  // Reynum að hlaða notenda­upplýsingar úr localStorage ef þær eru til
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

   // Útskráningarfall
  const handleLogout = () => {
    localStorage.removeItem("user");
    const chatKey = `chatConversation_${user.phone}`;
    localStorage.removeItem(chatKey);
   // Þú getur einnig hreinsað samtal ef þú vilt:
    // localStorage.removeItem("chatConversation");
    setUser(null);
  };





 return (
<div
 className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}
>
      <div className="flex flex-col items-center justify-center min-h-screen bg-opacity-50 bg-gray-900">
        <h1 className="text-4xl text-white font-bold">Velkomin!</h1>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        // Við sendum bæði notandann og útskráningarfallið til Chat componentins
        <Chat user={user} onLogout={handleLogout} />
      )}
  </div>
    </div>
    
  );
}



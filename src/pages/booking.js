import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Booking() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");
	const router = useRouter();

useEffect(() => {
  if (router.query.company) {
    setCompany(decodeURIComponent(router.query.company));
  }
}, [router.query.company]);

 useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setName(userObj.name);
      setPhone(userObj.phone);
    }
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const bookingData = { name, email, phone, company, date, time };

  const response = await fetch("/api/saveBooking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();
  alert(data.message);
};
 

    const handleBackToHome = () => {
    // Eyða notenda­upplýsingum
    localStorage.removeItem("user");
    // Eyða samtalinu sem er vistað undir lykli "chatConversation_{user.phone}"
    const chatKey = `chatConversation_${phone.trim()}`; // Ef þú vilt nota phone frá state, tryggðu að það sé rétt
    localStorage.removeItem(chatKey);
    // Færir notandann á upphafsíðuna
    router.push("/");
  };

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">

 <button
        onClick={handleBackToHome}
        className="bg-red-600 text-white px-6 py-3 text-xl font-bold rounded shadow-md mb-4"
      >
        Útskrá
      </button>
 
     <div className="w-full max-w-md bg-white shadow-md rounded-lg p-4">
        <h1 className="text-xl font-bold mb-2">Bóka tíma</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input type="text" placeholder="Nafn" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded mb-2" required />
       	  <input type="text" placeholder="Tölvupóstur" value={email} onChange={(e) => setEmail(e.target.value)} className="p-2 border rounded mb-2" required />
          <input type="tel" placeholder="Símanúmer" value={phone} onChange={(e) => setPhone(e.target.value)} className="p-2 border rounded mb-2" required />
          <input type="text" placeholder="Fyrirtæki (t.d. Sjónlag)" value={company} onChange={(e) => setCompany(e.target.value)} className="p-2 border rounded mb-2" required />
          <button type="submit" className="bg-green-500 text-white p-2 rounded">Senda bókun</button>
        </form>
      </div>
    </div>

  );
}


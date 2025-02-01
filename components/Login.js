// components/Login.js
import { useState } from "react";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const user = { name, phone };
    onLogin(user);
    // Vistar notendaupplýsingar í localStorage til að halda sessinu (einfalt dæmi)
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Skráðu þig inn</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <input
          type="text"
          placeholder="Nafn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
          required
        />
        <input
          type="tel"
          placeholder="Símanúmer"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 rounded mb-4 w-full"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Skrá inn
        </button>
      </form>
    </div>
  );
}


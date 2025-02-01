// pages/api/saveChat.js
import clientPromise from "../../../lib/mongodb";

// Hér myndir þú í fullri lausn einnig hafa middleware til að athuga auðkenningu
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const client = await clientPromise;
    const db = client.db("chatdb");

    const { user, messages } = req.body;
    if (!user || !messages) {
      return res.status(400).json({ message: "Skortir user eða messages gögn" });
    }

    // Geymum samtalið – hér gæti þú einnig keyrt pseudónýmingu (t.d. geymt userId í stað persónuupplýsinga)
    const result = await db.collection("conversations").insertOne({
      user, // Inniheldur t.d. { name, phone }
      messages,
      createdAt: new Date(),
    });

    res.status(200).json({ message: "Samtal vistuð", id: result.insertedId });
  } catch (error) {
    console.error("Villa við að vista samtal:", error);
    res.status(500).json({ message: "Innri villa" });
  }
}


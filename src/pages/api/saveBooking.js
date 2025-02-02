
import clientPromise from "../../../lib/mongodb";
import nodemailer from "nodemailer";


const companyEmailMap = {
  "sálfræðistofan sól": "hjorturvidsigurdarson@gmail.com",
  "heilsugæslan við höfða": "hjorturvidsigurdarson@gmail.com",
  "húðlæknastöðin": "hjorturvidsigurdarson@gmail.com",
  "sameind": "hjorturvidsigurdarson@gmail.com",
  "heyrn": "hjorturvidsigurdarson@gmail.com",
  "hp þjálfun ehf": "hjorturvidsigurdarson@gmail.com",
  "tannlæknastofan brostu": "hjorturvidsigurdarson@gmail.com",
  "sjónlag": "hjorturvidsigurdarson@gmail.com",
  "hjartamiðstöðin": "hjorturvidsigurdarson@gmail.com",
  "gigtarmiðstöð íslands": "hjorturvidsigurdarson@gmail.com"
};

  
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }


  const { company, name, email, phone, date, time } = req.body;
  if (!company || !phone || !email) {
    return res.status(400).json({ message: "Missing required booking data" });
  }

  let conversationText = "Engin samtal fundust.";
  try {
    const client = await clientPromise;
    const db = client.db("chatdb");

   await new Promise(resolve => setTimeout(resolve, 2000));

    // Notum 'phone' hér, sem nú er skilgreint
    const conversationDoc = await db.collection("conversations").findOne({ userPhone: phone });
	console.log("Conversation Document:", conversationDoc);
    if (conversationDoc && Array.isArray(conversationDoc.messages)) {
      conversationText = conversationDoc.messages
        .map((msg) => `${msg.role === "user" ? "Notandi" : "Gervigreind"}: ${msg.content}`)
        .join("\n");
    }
  } catch (error) {
    console.error("Villa við að sækja samtal:", error);
  }


const normalizedCompany = company.trim().toLowerCase();
  const recipientEmail = companyEmailMap[normalizedCompany] || process.env.DEFAULT_BOOKING_EMAIL;

console.log("Recipient Email:", recipientEmail); // Debug
  console.log("Conversation Text:", conversationText);

  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Ný bókun frá ${company}`,
    text: `Ný bókun:\n\nNafn: ${name}\nEmail: ${email}\nSími: ${phone}\nFyrirtæki: ${company}\nDagsetning: ${date}\nTími: ${time}\n\nSamtal:\n${conversationText}`,
  };


  try {
    await transporter.sendMail(mailOptions);
     const client = await clientPromise;
    const db = client.db("chatdb");
    await db.collection("conversations").deleteMany({ userPhone: phone });

    res.status(200).json({ message: "Bókun send og samtal hreinsað" });

  } catch (error) {
    console.error("Villa við að senda tölvupóst:", error);
    res.status(500).json({ message: "Villa við að senda tölvupóst" });
  }
}

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, phone, company, date, time } = req.body;

    // Staðsetning skráar
    const filePath = path.join(process.cwd(), "public", "bookings.json");

    // Lesa eldri gögn (ef þau eru til)
    let bookings = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      bookings = JSON.parse(data);
    }

    // Bæta nýjum gögnum við
    const newBooking = { name, email, phone, company, date, time };
    bookings.push(newBooking);

    // Vista í skrá
    fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));

     
	 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // notar SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});




    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "hjorturvidsigurdarson@gmail.com", // Skiptu þessu út fyrir netfangið sem á að fá bókunina
      subject: "Ný bókun frá Heilsutenging",
      text: `Ný bókun:\n\nNafn: ${name}\nEmail: ${email}\nSími: ${phone}\nFyrirtæki: ${company}\nDagsetning: ${date}\nTími: ${time}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("📩 Tölvupóstur sendur!");
      return res.status(200).json({ message: "Bókun vistuð og tölvupóstur sendur!" });
    } catch (error) {
      console.error("❌ Villa við að senda tölvupóst:", error);
      return res.status(500).json({ message: "Villa við að senda tölvupóst" });
    }
  }
  return res.status(405).json({ message: "Aðeins POST leyfilegt" });
}


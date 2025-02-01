import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Aðeins POST leyft" });
  }

  try {
    const { searchTerm, aiResponse } = req.body;

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SPREADSHEET_ID; // Bættu þessu í .env.local

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:C",
      valueInputOption: "RAW",
      requestBody: {
        values: [[new Date().toISOString(), searchTerm, aiResponse]],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Villa við Google Sheets:", error);
    res.status(500).json({ error: "Villa við skráningu" });
  }
}



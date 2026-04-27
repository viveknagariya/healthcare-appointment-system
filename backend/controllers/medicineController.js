const Medicine = require("../Models/Medicine");

const stripEmojis = (text) =>
  String(text || "").replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu,
    "",
  );

exports.getMedicineBySymptom = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.json({ reply: "Please provide a symptom." });

    const cleanMessage = message
      .replace(/[^\w\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    const medicines = await Medicine.find({});

    const matchingMed = medicines.find((m) => {
      const symptom = (m.symptom || "").trim().toLowerCase();
      if (!symptom) return false;
      return cleanMessage.includes(symptom) || symptom.includes(cleanMessage);
    });

    if (matchingMed) {
      let reply = `Here is what I found for **${matchingMed.symptom.trim()}**:\n\n`;
      reply += `**Adult Medicine:** ${matchingMed.adultMed || "N/A"}\n`;
      reply += ` **Child Medicine:** ${matchingMed.childMed || "N/A"}\n`;
      reply += `**Home Remedy:** ${matchingMed.remedy || "N/A"}\n`;
      reply += ` **Diet:** ${matchingMed.diet || "N/A"}\n`;
      reply += ` **Days Limit:** ${matchingMed.daysLimit ? matchingMed.daysLimit + " days" : "N/A"}\n\n`;
      reply += ` *Please consult a verified doctor if symptoms persist!*`;
      return res.json({ reply: stripEmojis(reply) });
    } else {
      return res.json({
        reply: stripEmojis(
          "I'm sorry, I couldn't find a remedy for that symptom in my records. Please try entering a different symptom (e.g. Fever, Cold, Acidity) or consult a doctor.",
        ),
      });
    }
  } catch (error) {
    console.error("AI Chat Error:", error);
    res
      .status(500)
      .json({ reply: stripEmojis("An error occurred while matching symptoms.") });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const newMed = new Medicine(req.body);
    await newMed.save();
    res.json({ success: true, medicine: newMed });
  } catch (error) {
    res.status(500).json({ error: "Add failed" });
  }
};

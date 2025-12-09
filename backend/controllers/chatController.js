import PoetChat from "../models/chats/poetChat.js";
import CoderChat from "../models/chats/coderChat.js";
import StoryChat from "../models/chats/storyChat.js";
import DataSageChat from "../models/chats/dataSageChat.js";
// import DoctorChat from "../models/chats/doctorChat.js";


const MODEL_MAP = {
  poet: PoetChat,
  coder: CoderChat,
  story: StoryChat,
  datasage: DataSageChat,
  // doctor: DoctorChat,
};


//  /api/chats/save
export const saveChat = async (req, res) => {
  try {
    
    console.log("DEBUG → REQ BODY:", req.body);
    console.log("DEBUG → USER FROM TOKEN:", req.user);

    const { aiType, message, response } = req.body;

    // If user not logged in → req.user = undefined
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized — No valid token" });
    }

    const userId = req.user.id;

    // Validation
    if (!aiType || !message || !response)
      return res.status(400).json({ error: `Missing fields. Received aiType: ${aiType}` });

    const Model = MODEL_MAP[aiType];

    // If wrong aiType passed
    if (!Model) {
      console.log("MODEL MAP KEYS AVAILABLE:", Object.keys(MODEL_MAP));
      return res.status(400).json({ error: `Invalid AI type: ${aiType}` });
    }

    // Save chat
    await Model.create({
      userId,
      message,
      response,
      timestamp: new Date(),
    });

    return res.json({ success: true, message: "Chat saved successfully." });

  } catch (err) {
    console.error("SaveChat Error:", err);
    res.status(500).json({ error: "Server error while saving chat." });
  }
};




// GET /api/chats/history/:aiType
export const getChatHistory = async (req, res) => {
  try {
    console.log("DEBUG → req.params:", req.params);

    const { aiType } = req.params;
    console.log("DEBUG → aiType received:", aiType);

    const Model = MODEL_MAP[aiType];
    console.log("DEBUG → MODEL:", Model);

    if (!Model)
      return res.status(400).json({ error: `Invalid AI type: ${aiType}` });

    const userId = req.user?.id;
    console.log("DEBUG → USER:", req.user);

    const chats = await Model.find({ userId }).sort({ timestamp: 1 });

    return res.json({ success: true, history: chats });
  } catch (err) {
    console.error("GetChatHistory Error:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
};

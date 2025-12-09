import express from "express";
import { saveChat, getChatHistory } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();


router.post("/save", authMiddleware, saveChat);


router.get("/history/:aiType", authMiddleware, getChatHistory);

export default router;

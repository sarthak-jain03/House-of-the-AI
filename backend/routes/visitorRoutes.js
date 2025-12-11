import express from "express";
import { trackVisitor } from "../controllers/visitorController.js";

const router = express.Router();


router.get("/visitors", trackVisitor);

export default router;

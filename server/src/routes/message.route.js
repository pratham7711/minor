import express from "express";
import mediaController from "../controllers/message.controllers.js";

const router = express.Router({ mergeParams: true });

router.post("/get", mediaController.getMessage);
router.post("/post", mediaController.postMessage);

export default router;
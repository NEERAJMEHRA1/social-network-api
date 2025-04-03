import express from "express";
const router = express.Router();
import { validator } from "../../helper/common/validator.js";
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    sendFriendRequest,
    respondToFriendRequest,
    getAllFriendsWithPagination,
    getAllFriends,
} from "./controller.js";

router.post("/sendFriendRequest", authMiddleware, validator("sendFriendRequest"), sendFriendRequest);
router.put("/respondToFriendRequest/:id", authMiddleware, respondToFriendRequest);
router.get("/getAllFriendsWithPagination", authMiddleware, getAllFriendsWithPagination);
router.get("/getAllFriends", authMiddleware, getAllFriends);

export default router;
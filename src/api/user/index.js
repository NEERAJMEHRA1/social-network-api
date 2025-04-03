import express from "express";
const router = express.Router();
import { validator } from "../../helper/common/validator.js";
import authMiddleware from "../../helper/common/jwtMiddelware.js";
import {
    userLogin,
    userRegister,
    getUserDetail,
} from "./controller.js";

router.post("/userLogin", userLogin);
router.get("/getUserDetail", authMiddleware, getUserDetail);
router.post("/userRegister", validator("registerValidation"), userRegister);

export default router;
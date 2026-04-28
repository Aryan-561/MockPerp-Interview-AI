import { Router } from "express";
import  {chating} from "./chat.controller.js";


const router = Router();


router.post("/", chating);

export default router;
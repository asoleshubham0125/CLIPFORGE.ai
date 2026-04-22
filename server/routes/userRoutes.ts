import express from "express";
import {
  getUserCredits,
  getAllProjects,
  getProjectByID,
  toggleProjectPublic,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.get("/projects", protect, getAllProjects);
userRouter.get("/project/:projectId", protect, getProjectByID);
userRouter.get("/publish/:projectId  ", protect, toggleProjectPublic);

export default userRouter;

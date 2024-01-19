import { Router } from "express";
import {
  registerUser,
  loginUser,
  addJobCategory,
  logout,
  addJob,
  applyJob,
  getAllUser,
  getAllJob,
} from "../controllers/controller";
import { checkAuth, ownership } from "../middleware/auth";

const router = Router();

router.post("/registerUser", registerUser);
router.route("/loginUser").post(loginUser);
router.post("/addJobCategory", checkAuth, addJobCategory);
router.post("/addJob", checkAuth, addJob);
router.post("/applyJob", checkAuth, applyJob);
router.get("/logout", logout);
router.get("/getAllUsers", getAllUser);
router.get("/getAllJob", getAllJob);

export default router;

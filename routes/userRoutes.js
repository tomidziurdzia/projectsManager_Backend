import express from "express";
import {
  register,
  authenticate,
  confirm,
  forgetPassword,
  checkToken,
  newPassword,
  perfil,
} from "../controllers/userController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

// Autenticacion, Registro y Confirmacion de Usuarios
router.post("/", register);
router.post("/login", authenticate);
router.get("/confirm/:token", confirm);
router.post("/forget-password", forgetPassword);
router.route("/forget-password/:token").get(checkToken).post(newPassword);

router.get("/perfil", checkAuth, perfil);

export default router;

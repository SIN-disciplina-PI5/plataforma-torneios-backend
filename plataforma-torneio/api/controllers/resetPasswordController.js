import {
  forgotPasswordService,
  resetPasswordService,
} from "../services/resetPasswordService.js";
import { getStatusCodeByError } from "../utils/errorHandler.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);
    return res.status(200).json(result);
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    const result = await resetPasswordService(token, novaSenha);
    return res.status(200).json(result);
  } catch (e) {
    const statusCode = getStatusCodeByError(e.message);
    return res.status(statusCode).json({ error: e.message });
  }
};
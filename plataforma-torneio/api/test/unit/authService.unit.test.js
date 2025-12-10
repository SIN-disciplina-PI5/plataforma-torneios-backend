import { jest } from "@jest/globals";
import * as authService from "../../services/authService.js";
import models from "../../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { Usuario, Blacklist } = models;

describe("authService - unit (mocks)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginService", () => {
    test("deve retornar token em login válido", async () => {
      const user = {
        id_usuario: "user-10",
        email: "user@test.com",
        senha: "hash",
        role: "USER",
      };

      Usuario.findOne = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("token-123");

      const token = await authService.loginService("user@test.com", "plain");

      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { email: "user@test.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hash");
      expect(jwt.sign).toHaveBeenCalled();
      expect(token).toBe("token-123");
    });

    test("deve falhar se usuário não encontrado", async () => {
      Usuario.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        authService.loginService("ghost@test.com", "x")
      ).rejects.toThrow("Usuário ou senha inválidos");
    });

    test("deve falhar se senha incorreta", async () => {
      Usuario.findOne = jest.fn().mockResolvedValue({ email: "e", senha: "hash" });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      await expect(
        authService.loginService("e", "bad")
      ).rejects.toThrow("Usuário ou senha inválidos");
    });
  });

  describe("logoutService", () => {
    test("deve registrar token na blacklist", async () => {
      jest.spyOn(jwt, "decode").mockReturnValue({ exp: 999 });
      Blacklist.create = jest.fn().mockResolvedValue({});

      const res = await authService.logoutService("Bearer token-xyz");

      expect(jwt.decode).toHaveBeenCalledWith("Bearer token-xyz");
      expect(Blacklist.create).toHaveBeenCalledWith({
        token: "Bearer token-xyz",
        expiresAt: expect.any(Date),
      });
      expect(res).toEqual({ message: "Você deslogou" });
    });
  });
});

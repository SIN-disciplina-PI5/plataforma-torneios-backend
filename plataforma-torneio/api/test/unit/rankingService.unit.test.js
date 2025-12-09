import { jest } from "@jest/globals";
import * as rankingService from "../../services/rankingService.js";
import models from "../../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Ranking, Usuario } = models;

// Helper para criar um ranking mockado com métodos espiáveis
const makeRanking = (pontos = 0) => {
  return {
    pontos_acumulados: pontos,
    ultima_atualizacao: null,
    posicao_atual: null,
    save: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockResolvedValue(true),
  };
};

describe("rankingService - unit (mocks)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("atualizarPontuacaoService", () => {
    test("deve somar pontos, salvar ranking e atualizar patente", async () => {
      const ranking = makeRanking(0);

      Ranking.findOne = jest.fn().mockResolvedValue(ranking);
      Ranking.create = jest.fn(); // não deve ser chamada
      const recalcularSpy = jest
        .spyOn(rankingService, "recalcularPosicoesService")
        .mockResolvedValue([]);
      Usuario.update = jest.fn().mockResolvedValue([1]);

      const result = await rankingService.atualizarPontuacaoService(
        "user-1",
        "CAMPEAO",
        "OURO"
      );

      expect(Ranking.findOne).toHaveBeenCalledWith({ where: { id_usuario: "user-1" } });
      expect(ranking.save).toHaveBeenCalled();
      expect(recalcularSpy).toHaveBeenCalled();
      expect(Usuario.update).toHaveBeenCalledWith(
        { patente: expect.any(String) },
        { where: { id_usuario: "user-1" } }
      );
      expect(result.pontos_acumulados).toBeGreaterThan(0);

      recalcularSpy.mockRestore();
    });

    test("deve criar ranking se não existir", async () => {
      const novoRanking = makeRanking(0);
      Ranking.findOne = jest.fn().mockResolvedValue(null);
      Ranking.create = jest.fn().mockResolvedValue(novoRanking);
      jest
        .spyOn(rankingService, "recalcularPosicoesService")
        .mockResolvedValue([]);
      Usuario.update = jest.fn().mockResolvedValue([1]);

      await rankingService.atualizarPontuacaoService("user-2", "AVANCO_FASE");

      expect(Ranking.create).toHaveBeenCalledWith({
        id_usuario: "user-2",
        pontos_acumulados: 0,
        posicao_atual: null,
      });
    });
  });

  describe("recalcularPosicoesService", () => {
    test("deve atribuir posições corretas", async () => {
      const r1 = makeRanking(100);
      const r2 = makeRanking(50);
      Ranking.findAll = jest.fn().mockResolvedValue([r1, r2]);

      const res = await rankingService.recalcularPosicoesService();

      expect(Ranking.findAll).toHaveBeenCalledWith({ order: [["pontos_acumulados", "DESC"]] });
      expect(r1.update).toHaveBeenCalledWith({ posicao_atual: 1 });
      expect(r2.update).toHaveBeenCalledWith({ posicao_atual: 2 });
      expect(res).toHaveLength(2);
    });
  });

  describe("buscarRankingGeralService", () => {
    test("deve delegar para Ranking.findAll com limite", async () => {
      Ranking.findAll = jest.fn().mockResolvedValue([]);

      const res = await rankingService.buscarRankingGeralService(10);

      expect(Ranking.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          order: [["pontos_acumulados", "DESC"]],
        })
      );
      expect(res).toEqual([]);
    });
  });

  describe("resetarRankingUsuarioService", () => {
    test("deve resetar pontos, recalcular posições e atualizar patente", async () => {
      const ranking = makeRanking(200);
      Ranking.findOne = jest.fn().mockResolvedValue(ranking);
      jest
        .spyOn(rankingService, "recalcularPosicoesService")
        .mockResolvedValue([]);
      Usuario.update = jest.fn().mockResolvedValue([1]);

      const res = await rankingService.resetarRankingUsuarioService("user-3");

      expect(Ranking.findOne).toHaveBeenCalledWith({ where: { id_usuario: "user-3" } });
      expect(ranking.update).toHaveBeenCalledWith(
        expect.objectContaining({ pontos_acumulados: 0, posicao_atual: null })
      );
      expect(Usuario.update).toHaveBeenCalledWith(
        { patente: expect.any(String) },
        { where: { id_usuario: "user-3" } }
      );
      expect(res).toBe(ranking);
    });

    test("deve lançar erro se ranking não encontrado", async () => {
      Ranking.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        rankingService.resetarRankingUsuarioService("nope")
      ).rejects.toThrow("Ranking do usuário não encontrado");
    });
  });
});

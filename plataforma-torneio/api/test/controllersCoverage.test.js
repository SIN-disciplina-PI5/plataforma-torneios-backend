/**
 * Testes para aumentar cobertura dos Controllers
 * Foca em casos ainda não testados de:
 * - Equipe, EquipeUsuario, Partida, PartidaUsuario, Ranking, Inscrição
 */

import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let adminToken;
let userToken;
let userId;
let adminId;
let torneioId;
let equipeId;
let equipe2Id;
let inscricaoId;
let partidaId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Criar Admin
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin Coverage",
      email: "admin.coverage@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  adminId = adminRes.body.data.id_usuario;

  const adminLoginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.coverage@teste.com",
      senha: "123456",
    });

  adminToken = adminLoginRes.body.token;

  // Criar User
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "User Coverage",
      email: "user.coverage@teste.com",
      senha: "123456",
    });

  userId = userRes.body.data.id_usuario;
  userToken = userRes.body.data.token;

  // Criar Torneio
  const torneioRes = await request(app)
    .post("/api/torneio")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      nome: "Torneio Coverage",
      categoria: "CATEGORIA_A",
      vagas: 32,
    });

  torneioId = torneioRes.body.data.id_torneio;

  // Criar Equipes
  const eq1Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe Coverage 1" });

  equipeId = eq1Res.body.data.id_equipe;

  const eq2Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe Coverage 2" });

  equipe2Id = eq2Res.body.data.id_equipe;

  // Criar Inscrição
  const inscRes = await request(app)
    .post("/api/inscricoes")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      id_equipe: equipeId,
      id_torneio: torneioId,
    });

  inscricaoId = inscRes.body.data.id_inscricao;

  // Aprovar inscrição
  await request(app)
    .put(`/api/inscricoes/${inscricaoId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ status: "APROVADA" });

  // Criar Partida
  const partidaRes = await request(app)
    .post("/api/partidas")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      id_torneio: torneioId,
      fase: "GRUPOS",
    });

  partidaId = partidaRes.body.data.id_partida;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Cobertura Completa - Equipe Controller", () => {
  test("POST /api/equipes - criar com dados válidos", async () => {
    const res = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Nova Equipe" })
      .expect(201);

    expect(res.body.data.nome).toBe("Nova Equipe");
  });

  test("GET /api/equipes - listar (público)", async () => {
    const res = await request(app).get("/api/equipe").expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/equipe/:id - buscar específica", async () => {
    const res = await request(app)
      .get(`/api/equipe/${equipeId}`)
      .expect(200);
    expect(res.body.data.id_equipe).toBe(equipeId);
  });

  test("PUT /api/equipe/:id - atualizar", async () => {
    const res = await request(app)
      .put(`/api/equipe/${equipeId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Equipe Atualizada" })
      .expect(200);
    expect(res.body.data.nome).toBe("Equipe Atualizada");
  });

  test("DELETE /api/equipe/:id - deletar", async () => {
    const createRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Para Deletar" });

    const toDeleteId = createRes.body.data.id_equipe;

    await request(app)
      .delete(`/api/equipe/${toDeleteId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);
  });
});

describe("Cobertura Completa - EquipeUsuario Controller", () => {
  test("POST /api/equipe-usuarios - vincular usuário à equipe", async () => {
    const res = await request(app)
      .post("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_usuario: userId,
        id_equipe: equipeId,
      })
      .expect(201);

    expect(res.body.data.id_usuario).toBe(userId);
    expect(res.body.data.id_equipe).toBe(equipeId);
  });

  test("GET /api/equipe-usuarios - listar vínculos", async () => {
    const res = await request(app)
      .get("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("PUT /api/equipe-usuarios/:id - atualizar vínculo", async () => {
    const linkRes = await request(app)
      .post("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_usuario: userId,
        id_equipe: equipe2Id,
      });

    const linkId = linkRes.body.data.id_equipe_usuario;

    const res = await request(app)
      .put(`/api/equipe-usuarios/${linkId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ id_equipe: equipeId })
      .expect(200);

    expect(res.body.data.id_equipe).toBe(equipeId);
  });

  test("DELETE /api/equipe-usuarios/:id - remover vínculo", async () => {
    const linkRes = await request(app)
      .post("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_usuario: userId,
        id_equipe: equipe2Id,
      });

    const linkId = linkRes.body.data.id_equipe_usuario;

    await request(app)
      .delete(`/api/equipe-usuarios/${linkId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204);
  });
});

describe("Cobertura Completa - Partida Controller", () => {
  test("POST /api/partidas - criar partida", async () => {
    const res = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_torneio: torneioId,
        fase: "GRUPOS",
      })
      .expect(201);

    expect(res.body.data.fase).toBe("GRUPOS");
  });

  test("GET /api/partidas - listar partidas", async () => {
    const res = await request(app)
      .get("/api/partidas")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/partidas/:id - buscar partida", async () => {
    const res = await request(app)
      .get(`/api/partidas/${partidaId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.id_partida).toBe(partidaId);
  });

  test("PATCH /api/partidas/:id - atualizar status", async () => {
    const res = await request(app)
      .patch(`/api/partidas/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "EM_ANDAMENTO" })
      .expect(200);

    expect(res.body.data.status).toBe("EM_ANDAMENTO");
  });

  test("DELETE /api/partidas/:id - deletar partida", async () => {
    const createRes = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_torneio: torneioId,
        fase: "GRUPOS",
      });

    const toDeleteId = createRes.body.data.id_partida;

    await request(app)
      .delete(`/api/partidas/${toDeleteId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);
  });
});

describe("Cobertura Completa - PartidaUsuario Controller", () => {
  test("POST /api/partida-usuarios - vincular equipe a partida", async () => {
    const res = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_partida: partidaId,
        id_equipe: equipeId,
      })
      .expect(201);

    expect(res.body.data.id_equipe).toBe(equipeId);
  });

  test("GET /api/partida-usuarios - listar vínculos", async () => {
    const res = await request(app)
      .get("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("PATCH /api/partida-usuarios/:id - atualizar resultado", async () => {
    const linkRes = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_partida: partidaId,
        id_equipe: equipe2Id,
      });

    const linkId = linkRes.body.data.id_partida_usuario;

    const res = await request(app)
      .patch(`/api/partida-usuarios/resultado/${linkId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ resultado: "VITORIA" })
      .expect(200);

    expect(res.body.data.resultado).toBe("VITORIA");
  });

  test("DELETE /api/partida-usuarios/:id - remover vínculo", async () => {
    const linkRes = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_partida: partidaId,
        id_equipe: equipe2Id,
      });

    const linkId = linkRes.body.data.id_partida_usuario;

    await request(app)
      .delete(`/api/partida-usuarios/delete/${linkId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);
  });
});

describe("Cobertura Completa - Ranking Controller", () => {
  test("GET /api/rankings - listar rankings", async () => {
    const res = await request(app)
      .get("/api/rankings")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/rankings/usuario/:id - ranking de usuário", async () => {
    const res = await request(app)
      .get(`/api/rankings/usuario/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.id_usuario).toBe(userId);
  });

  test("GET /api/rankings/posicao/:posicao - ranking por posição", async () => {
    const res = await request(app)
      .get("/api/rankings/posicao/1")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.data.posicao_atual).toBe(1);
  });

  test("PUT /api/rankings/:id - atualizar ranking", async () => {
    const res = await request(app)
      .put(`/api/rankings/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pontos_acumulados: 100,
        tipo_evento: "VITORIA_FASE_GRUPOS",
      })
      .expect(200);

    expect(res.body.data.pontos_acumulados).toBeGreaterThanOrEqual(100);
  });

  test("POST /api/rankings/recalcular - recalcular todos", async () => {
    const res = await request(app)
      .post("/api/rankings/recalcular")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toBeDefined();
  });

  test("POST /api/rankings/resetar - resetar rankings", async () => {
    const res = await request(app)
      .post("/api/rankings/resetar")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.message).toBeDefined();
  });
});

describe("Cobertura Completa - Inscrição Controller", () => {
  test("POST /api/inscricoes - criar inscrição", async () => {
    const newEqRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Equipe Nova" });

    const res = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_equipe: newEqRes.body.data.id_equipe,
        id_torneio: torneioId,
      })
      .expect(201);

    expect(res.body.data.status).toBe("AGUARDANDO");
  });

  test("GET /api/inscricoes - listar inscrições", async () => {
    const res = await request(app)
      .get("/api/inscricoes")
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/inscricoes/:id - buscar inscrição", async () => {
    const res = await request(app)
      .get(`/api/inscricoes/${inscricaoId}`)
      .expect(200);

    expect(res.body.data.id_inscricao).toBe(inscricaoId);
  });

  test("PUT /api/inscricoes/:id - atualizar status", async () => {
    const newInscRes = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_equipe: equipeId,
        id_torneio: torneioId,
      });

    const newInscId = newInscRes.body.data.id_inscricao;

    const res = await request(app)
      .put(`/api/inscricoes/${newInscId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "REJEITADA" })
      .expect(200);

    expect(res.body.data.status).toBe("REJEITADA");
  });

  test("DELETE /api/inscricoes/:id - deletar inscrição", async () => {
    const newEqRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Para Deletar" });

    const newInscRes = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_equipe: newEqRes.body.data.id_equipe,
        id_torneio: torneioId,
      });

    const toDeleteId = newInscRes.body.data.id_inscricao;

    await request(app)
      .delete(`/api/inscricoes/${toDeleteId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);
  });
});

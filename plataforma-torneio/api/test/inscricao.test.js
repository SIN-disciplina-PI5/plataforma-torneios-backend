import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let adminToken;
let userToken;
let torneioId;
let equipeId;
let inscricaoId;
let adminId;
let userId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um admin
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin Inscrição",
      email: "admin.inscricao@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  adminId = adminRes.body.data.id_usuario;

  const adminLoginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.inscricao@teste.com",
      senha: "123456",
    });

  adminToken = adminLoginRes.body.token;

  // Criar um usuário comum
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Inscrição",
      email: "user.inscricao@teste.com",
      senha: "123456",
      role: "USER",
    });

  userId = userRes.body.data.id_usuario;
  userToken = userRes.body.data.token;

  // Criar um torneio
  const torneioRes = await request(app)
    .post("/api/torneio")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      nome: "Torneio Inscrição",
      categoria: "Futebol",
      vagas: 8,
      status: true,
    });

  torneioId = torneioRes.body.data.id_torneio;

  // Criar uma equipe
  const equipeRes = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      nome: "Equipe Inscrição",
    });

  equipeId = equipeRes.body.data.id_equipe;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de Inscrição", () => {
  const inscricaoData = {
    id_equipe: equipeId,
    id_torneio: torneioId,
  };

  test("POST /api/inscricoes - deve criar uma nova inscrição (autenticado)", async () => {
    const res = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send(inscricaoData)
      .expect(201);

    expect(res.body.message).toBe("Inscrição criada com sucesso");
    expect(res.body.data.id_equipe).toBe(equipeId);
    expect(res.body.data.id_torneio).toBe(torneioId);
    expect(res.body.data.status).toBe("AGUARDANDO"); // Status padrão

    inscricaoId = res.body.data.id_inscricao;
  });

  test("GET /api/inscricoes - deve listar todas as inscrições (público)", async () => {
    const res = await request(app)
      .get("/api/inscricoes")
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/inscricoes/:id - deve buscar uma inscrição específica (público)", async () => {
    const res = await request(app)
      .get(`/api/inscricoes/${inscricaoId}`)
      .expect(200);

    expect(res.body.data.id_inscricao).toBe(inscricaoId);
    expect(res.body.data.id_equipe).toBe(equipeId);
    expect(res.body.data.id_torneio).toBe(torneioId);
  });

  test("PUT /api/inscricoes/:id - deve atualizar status da inscrição (admin)", async () => {
    const res = await request(app)
      .put(`/api/inscricoes/${inscricaoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APROVADA" })
      .expect(200);

    expect(res.body.message).toBe("Inscrição atualizada com sucesso");
    expect(res.body.data.status).toBe("APROVADA");
  });

  test("PUT /api/inscricoes/:id - deve atualizar status para REJEITADA (admin)", async () => {
    // Criar outra inscrição para testar rejeição
    const equipeRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Equipe para Rejeitar" });

    const novaEquipeId = equipeRes.body.data.id_equipe;

    const inscRes = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_equipe: novaEquipeId,
        id_torneio: torneioId,
      });

    const novaInscricaoId = inscRes.body.data.id_inscricao;

    // Rejeitar a inscrição
    const res = await request(app)
      .put(`/api/inscricoes/${novaInscricaoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "REJEITADA" })
      .expect(200);

    expect(res.body.data.status).toBe("REJEITADA");
  });

  test("DELETE /api/inscricoes/:id - deve deletar uma inscrição (admin)", async () => {
    // Criar outra inscrição para deletar
    const equipeRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ nome: "Equipe para Deletar Inscrição" });

    const novaEquipeId = equipeRes.body.data.id_equipe;

    const inscRes = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_equipe: novaEquipeId,
        id_torneio: torneioId,
      });

    const inscricaoParaDeletar = inscRes.body.data.id_inscricao;

    // Deletar
    const res = await request(app)
      .delete(`/api/inscricoes/${inscricaoParaDeletar}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  test("POST /api/inscricoes - deve falhar ao criar inscrição sem autenticação", async () => {
    const res = await request(app)
      .post("/api/inscricoes")
      .send(inscricaoData)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/inscricoes - deve falhar ao criar inscrição sem id_equipe", async () => {
    const res = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ id_torneio: torneioId })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/inscricoes - deve falhar ao criar inscrição sem id_torneio", async () => {
    const res = await request(app)
      .post("/api/inscricoes")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ id_equipe: equipeId })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/inscricoes/:id - deve falhar ao atualizar status inválido (admin)", async () => {
    const res = await request(app)
      .put(`/api/inscricoes/${inscricaoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "STATUS_INVÁLIDO" })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/inscricoes/:id - deve falhar sem autenticação de admin", async () => {
    const res = await request(app)
      .put(`/api/inscricoes/${inscricaoId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "APROVADA" })
      .expect(403); // Forbidden (não é admin)

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/inscricoes/:id - deve retornar 404 para inscrição inexistente", async () => {
    const res = await request(app)
      .get("/api/inscricoes/99999999-9999-9999-9999-999999999999")
      .expect(404);

    expect(res.body.error).toBeDefined();
  });
});

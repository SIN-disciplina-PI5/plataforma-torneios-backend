import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let adminToken;
let userToken;
let userId;
let adminId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um admin
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin Ranking",
      email: "admin.ranking@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  adminId = adminRes.body.data.id_usuario;

  const adminLoginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.ranking@teste.com",
      senha: "123456",
    });

  adminToken = adminLoginRes.body.token;

  // Criar um usuário
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Ranking",
      email: "user.ranking@teste.com",
      senha: "123456",
      role: "USER",
    });

  userId = userRes.body.data.id_usuario;
  userToken = userRes.body.data.token;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de Ranking", () => {
  test("GET /api/ranking/geral - deve buscar ranking geral (autenticado)", async () => {
    const res = await request(app)
      .get("/api/ranking/geral")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Ranking geral recuperado com sucesso");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/ranking/geral?limite=50 - deve buscar ranking geral com limite (autenticado)", async () => {
    const res = await request(app)
      .get("/api/ranking/geral?limite=50")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/ranking/usuario/:id_usuario - deve buscar ranking de um usuário específico", async () => {
    const res = await request(app)
      .get(`/api/ranking/usuario/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain("Ranking do usuário recuperado");
  });

  test("GET /api/ranking/usuario/:id_usuario - deve retornar 404 para usuário inexistente", async () => {
    const res = await request(app)
      .get("/api/ranking/usuario/99999999-9999-9999-9999-999999999999")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Ranking do usuário não encontrado");
  });

  test("GET /api/ranking/posicao/:posicao - deve buscar ranking por posição", async () => {
    const res = await request(app)
      .get("/api/ranking/posicao/1")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    // Pode retornar 404 se não houver usuário nessa posição
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
    }
  });

  test("GET /api/ranking/posicao/:posicao - deve retornar 404 para posição sem usuário", async () => {
    // Assumindo que posição 99999 não terá nenhum usuário
    const res = await request(app)
      .get("/api/ranking/posicao/99999")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  test("POST /api/ranking/atualizar - deve atualizar pontuação de um usuário (admin)", async () => {
    const res = await request(app)
      .post("/api/ranking/atualizar")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_usuario: userId,
        tipo_evento: "VITORIA",
        medalha: "OURO",
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Pontuação atualizada com sucesso");
  });

  test("POST /api/ranking/atualizar - deve falhar sem id_usuario (admin)", async () => {
    const res = await request(app)
      .post("/api/ranking/atualizar")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        tipo_evento: "VITORIA",
        medalha: "OURO",
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("obrigatórios");
  });

  test("POST /api/ranking/atualizar - deve falhar sem tipo_evento (admin)", async () => {
    const res = await request(app)
      .post("/api/ranking/atualizar")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_usuario: userId,
        medalha: "OURO",
      })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  test("POST /api/ranking/atualizar - deve falhar sem permissão de admin", async () => {
    const res = await request(app)
      .post("/api/ranking/atualizar")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_usuario: userId,
        tipo_evento: "VITORIA",
        medalha: "OURO",
      })
      .expect(403); // Forbidden

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/ranking/recalcular - deve recalcular ranking (admin)", async () => {
    const res = await request(app)
      .post("/api/ranking/recalcular")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Ranking recalculado com sucesso");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("POST /api/ranking/recalcular - deve falhar sem permissão de admin", async () => {
    const res = await request(app)
      .post("/api/ranking/recalcular")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("DELETE /api/ranking/resetar/:id_usuario - deve resetar ranking de um usuário (admin)", async () => {
    const res = await request(app)
      .delete(`/api/ranking/resetar/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Ranking do usuário resetado com sucesso");
  });

  test("DELETE /api/ranking/resetar/:id_usuario - deve falhar sem permissão de admin", async () => {
    const res = await request(app)
      .delete(`/api/ranking/resetar/${userId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/ranking/geral - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .get("/api/ranking/geral")
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/ranking/usuario/:id_usuario - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .get(`/api/ranking/usuario/${userId}`)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });
});

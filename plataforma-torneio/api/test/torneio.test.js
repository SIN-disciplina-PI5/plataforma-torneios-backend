import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let adminId;
let torneioId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um admin para rodar os testes que exigem permissão
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin Torneio",
      email: "admin.torneio@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  adminId = adminRes.body.data.id_usuario;

  // Login para pegar token
  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.torneio@teste.com",
      senha: "123456",
    });

  token = loginRes.body.token;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de Torneio (Ciclo Completo)", () => {
  const torneioData = {
    nome: "Campeonato de Verão 2024",
    categoria: "Futebol",
    vagas: 8,
    status: true,
  };

  test("POST /api/torneio - deve criar um novo torneio (como admin)", async () => {
    const res = await request(app)
      .post("/api/torneio")
      .set("Authorization", `Bearer ${token}`)
      .send(torneioData)
      .expect(201);

    expect(res.body.message).toBe("Torneio criado");
    expect(res.body.data.nome).toBe(torneioData.nome);
    expect(res.body.data.categoria).toBe(torneioData.categoria);
    expect(res.body.data.vagas).toBe(torneioData.vagas);
    
    torneioId = res.body.data.id_torneio; // Salva para próximos testes
  });

  test("GET /api/torneio - deve listar todos os torneios", async () => {
    const res = await request(app)
      .get("/api/torneio")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].nome).toBeDefined();
  });

  test("GET /api/torneio/:id_torneio - deve buscar um torneio específico", async () => {
    const res = await request(app)
      .get(`/api/torneio/${torneioId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.id_torneio).toBe(torneioId);
    expect(res.body.nome).toBe(torneioData.nome);
    expect(res.body.categoria).toBe(torneioData.categoria);
  });

  test("PATCH /api/torneio/:id_torneio - deve atualizar um torneio (como admin)", async () => {
    const updateData = {
      nome: "Campeonato de Inverno 2024",
      vagas: 16,
    };

    const res = await request(app)
      .patch(`/api/torneio/${torneioId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData)
      .expect(200);

    expect(res.body.nome).toBe(updateData.nome);
    expect(res.body.vagas).toBe(updateData.vagas);
    expect(res.body.id_torneio).toBe(torneioId);
  });

  test("DELETE /api/torneio/:id_torneio - deve deletar um torneio (como admin)", async () => {
    // Primeiro, criar um novo torneio para deletar
    const createRes = await request(app)
      .post("/api/torneio")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Torneio para Deletar",
        categoria: "Vôlei",
        vagas: 4,
        status: true,
      });

    const torneioParaDeletar = createRes.body.data.id_torneio;

    // Agora deletar
    const deleteRes = await request(app)
      .delete(`/api/torneio/${torneioParaDeletar}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(deleteRes.body).toEqual({});
  });

  test("POST /api/torneio - deve falhar ao criar torneio sem autenticação", async () => {
    const res = await request(app)
      .post("/api/torneio")
      .send(torneioData)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/torneio/:id_torneio - deve retornar 404 para torneio inexistente", async () => {
    const res = await request(app)
      .get("/api/torneio/99999999-9999-9999-9999-999999999999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/torneio - deve falhar ao criar torneio com dados inválidos", async () => {
    const res = await request(app)
      .post("/api/torneio")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Torneio sem Categoria",
        vagas: 8,
        status: true,
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/torneio - deve falhar ao criar torneio com vagas inválidas", async () => {
    const res = await request(app)
      .post("/api/torneio")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Torneio com Vagas Inválidas",
        categoria: "Basquete",
        vagas: -5,
        status: true,
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });
});

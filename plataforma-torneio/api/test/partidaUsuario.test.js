import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let adminToken;
let torneioId;
let equipe1Id;
let equipe2Id;
let partidaId;
let partidaUsuarioId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar admin
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin PartidaUsuario",
      email: "admin.partidausuario@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  const adminLoginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.partidausuario@teste.com",
      senha: "123456",
    });

  adminToken = adminLoginRes.body.token;

  // Criar usuário
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Partida Usuario",
      email: "user.partidausuario@teste.com",
      senha: "123456",
      role: "USER",
    });

  const userToken = userRes.body.data.token;

  // Criar torneio
  const torneioRes = await request(app)
    .post("/api/torneio")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      nome: "Torneio Partida Usuario",
      categoria: "Futebol",
      vagas: 8,
      status: true,
    });

  torneioId = torneioRes.body.data.id_torneio;

  // Criar equipes
  const equipe1Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe 1" });

  equipe1Id = equipe1Res.body.data.id_equipe;

  const equipe2Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe 2" });

  equipe2Id = equipe2Res.body.data.id_equipe;

  // Criar partida
  const partidaRes = await request(app)
    .post("/api/partidas")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      id_torneio: torneioId,
      fase: "GRUPOS",
      status: "PENDENTE",
    });

  partidaId = partidaRes.body.data.id_partida;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de PartidaUsuario (Equipes em Partidas)", () => {
  test("POST /api/partida-usuarios - deve criar vínculo entre partida e equipe", async () => {
    const res = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_partida: partidaId,
        id_equipe: equipe1Id,
      })
      .expect(201);

    expect(res.body.message).toBe("Vínculo criado");
    expect(res.body.data.id_partida).toBe(partidaId);
    expect(res.body.data.id_equipe).toBe(equipe1Id);

    partidaUsuarioId = res.body.data.id_partida_usuario;
  });

  test("POST /api/partida-usuarios/vincular/:id_partida - deve vincular equipe a partida", async () => {
    const res = await request(app)
      .post(`/api/partida-usuarios/vincular/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ id_equipe: equipe2Id })
      .expect(200);

    expect(res.body.id_equipe).toBe(equipe2Id);
    expect(res.body.id_partida).toBe(partidaId);
  });

  test("GET /api/partida-usuarios - deve listar todos os vínculos partida-equipe", async () => {
    const res = await request(app)
      .get("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/partida-usuarios/:id_partida_usuario - deve buscar vínculo específico", async () => {
    const res = await request(app)
      .get(`/api/partida-usuarios/${partidaUsuarioId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id_partida_usuario).toBe(partidaUsuarioId);
    expect(res.body.id_partida).toBe(partidaId);
  });

  test("PATCH /api/partida-usuarios/edit/:id_partida_usuario - deve atualizar vínculo", async () => {
    const res = await request(app)
      .patch(`/api/partida-usuarios/edit/${partidaUsuarioId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_equipe: equipe2Id,
      })
      .expect(200);

    expect(res.body.id_equipe).toBe(equipe2Id);
  });

  test("PATCH /api/partida-usuarios/resultado/:id_partida_usuario - deve definir resultado", async () => {
    const res = await request(app)
      .patch(`/api/partida-usuarios/resultado/${partidaUsuarioId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "VENCEDOR" })
      .expect(200);

    expect(res.body.status).toBe("VENCEDOR");
  });

  test("DELETE /api/partida-usuarios/delete/:id_partida_usuario - deve deletar vínculo", async () => {
    // Criar novo vínculo para deletar
    const novaPartidaRes = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_torneio: torneioId,
        fase: "OITAVAS_DE_FINAL",
        status: "PENDENTE",
      });

    const novaPartidaId = novaPartidaRes.body.data.id_partida;

    const vinculoRes = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_partida: novaPartidaId,
        id_equipe: equipe1Id,
      });

    const vinculoId = vinculoRes.body.data.id_partida_usuario;

    const res = await request(app)
      .delete(`/api/partida-usuarios/delete/${vinculoId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  test("POST /api/partida-usuarios - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .post("/api/partida-usuarios")
      .send({
        id_partida: partidaId,
        id_equipe: equipe1Id,
      })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/partida-usuarios - deve falhar sem permissão de admin", async () => {
    // Criar usuário comum
    const userRes = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Comum",
        email: "comum.partidausuario@teste.com",
        senha: "123456",
        role: "USER",
      });

    const userToken = userRes.body.data.token;

    const res = await request(app)
      .post("/api/partida-usuarios")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        id_partida: partidaId,
        id_equipe: equipe1Id,
      })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/partida-usuarios - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .get("/api/partida-usuarios")
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("PATCH /api/partida-usuarios/resultado/:id_partida_usuario - deve falhar sem permissão", async () => {
    const userRes = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Teste Resultado",
        email: "resultado.partidausuario@teste.com",
        senha: "123456",
        role: "USER",
      });

    const userToken = userRes.body.data.token;

    const res = await request(app)
      .patch(`/api/partida-usuarios/resultado/${partidaUsuarioId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "VENCEDOR" })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });
});

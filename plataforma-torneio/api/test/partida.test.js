import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let adminToken;
let torneioId;
let equipe1Id;
let equipe2Id;
let partidaId;
let adminId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um admin
  const adminRes = await request(app)
    .post("/api/admin/register")
    .send({
      nome: "Admin Partida",
      email: "admin.partida@teste.com",
      senha: "123456",
      secretKey: process.env.ADMIN_SECRET_KEY,
    });

  adminId = adminRes.body.data.id_usuario;

  const adminLoginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "admin.partida@teste.com",
      senha: "123456",
    });

  adminToken = adminLoginRes.body.token;

  // Criar um usuário para criar equipes
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Partida",
      email: "user.partida@teste.com",
      senha: "123456",
      role: "USER",
    });

  const userToken = userRes.body.data.token;

  // Criar um torneio
  const torneioRes = await request(app)
    .post("/api/torneio")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      nome: "Torneio Partida",
      categoria: "Futebol",
      vagas: 8,
      status: true,
    });

  torneioId = torneioRes.body.data.id_torneio;

  // Criar primeira equipe
  const equipe1Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe 1 Partida" });

  equipe1Id = equipe1Res.body.data.id_equipe;

  // Criar segunda equipe
  const equipe2Res = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ nome: "Equipe 2 Partida" });

  equipe2Id = equipe2Res.body.data.id_equipe;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de Partida", () => {
  const partidaData = {
    id_torneio: torneioId,
    fase: "GRUPOS",
    status: "PENDENTE",
  };

  test("POST /api/partidas - deve criar uma nova partida (admin)", async () => {
    const res = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(partidaData)
      .expect(201);

    expect(res.body.message).toBe("Partida criada");
    expect(res.body.data.id_torneio).toBe(torneioId);
    expect(res.body.data.fase).toBe("GRUPOS");
    expect(res.body.data.status).toBe("PENDENTE");

    partidaId = res.body.data.id_partida;
  });

  test("GET /api/partidas - deve listar todas as partidas (autenticado)", async () => {
    const res = await request(app)
      .get("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/partidas/:id_partida - deve buscar uma partida específica (autenticado)", async () => {
    const res = await request(app)
      .get(`/api/partidas/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id_partida).toBe(partidaId);
    expect(res.body.id_torneio).toBe(torneioId);
    expect(res.body.fase).toBe("GRUPOS");
  });

  test("PATCH /api/partidas/edit/:id_partida - deve atualizar uma partida (admin)", async () => {
    const updateData = {
      fase: "OITAVAS_DE_FINAL",
    };

    const res = await request(app)
      .patch(`/api/partidas/edit/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(res.body.fase).toBe("OITAVAS_DE_FINAL");
    expect(res.body.id_partida).toBe(partidaId);
  });

  test("PATCH /api/partidas/agendar/:id_partida - deve agendar uma partida (admin)", async () => {
    const agora = new Date();
    const horarioAgendado = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // Amanhã

    const res = await request(app)
      .patch(`/api/partidas/agendar/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ horario: horarioAgendado })
      .expect(200);

    expect(res.body.horario).toBeDefined();
  });

  test("PATCH /api/partidas/iniciar/:id_partida - deve iniciar uma partida (admin)", async () => {
    const res = await request(app)
      .patch(`/api/partidas/iniciar/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.status).toBe("EM_ANDAMENTO");
    expect(res.body.id_partida).toBe(partidaId);
  });

  test("PATCH /api/partidas/resultado/:id_partida - deve registrar resultado (admin)", async () => {
    const res = await request(app)
      .patch(`/api/partidas/resultado/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        placar: "2-1",
        resultado: "Vitória por gol de diferença",
      })
      .expect(200);

    expect(res.body.placar).toBe("2-1");
    expect(res.body.resultado).toBe("Vitória por gol de diferença");
  });

  test("PATCH /api/partidas/vencedor/:id_partida - deve definir vencedor (admin)", async () => {
    const res = await request(app)
      .patch(`/api/partidas/vencedor/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ vencedor_id: equipe1Id })
      .expect(200);

    expect(res.body.vencedor_id).toBe(equipe1Id);
  });

  test("PATCH /api/partidas/finalizar/:id_partida - deve finalizar uma partida (admin)", async () => {
    const res = await request(app)
      .patch(`/api/partidas/finalizar/${partidaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.status).toBe("FINALIZADA");
  });

  test("DELETE /api/partidas/delete/:id_partida - deve deletar uma partida (admin)", async () => {
    // Criar uma nova partida para deletar
    const createRes = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_torneio: torneioId,
        fase: "QUARTAS_DE_FINAL",
        status: "PENDENTE",
      });

    const partidaParaDeletar = createRes.body.data.id_partida;

    // Deletar
    const res = await request(app)
      .delete(`/api/partidas/delete/${partidaParaDeletar}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  test("POST /api/partidas - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .post("/api/partidas")
      .send(partidaData)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/partidas - deve falhar sem permissão de admin", async () => {
    // Criar um usuário comum
    const userRes = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Comum Partida",
        email: "user.comum.partida@teste.com",
        senha: "123456",
        role: "USER",
      });

    const userToken = userRes.body.data.token;

    const res = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${userToken}`)
      .send(partidaData)
      .expect(403); // Forbidden

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/partidas/:id_partida - deve falhar para partida inexistente", async () => {
    const res = await request(app)
      .get("/api/partidas/99999999-9999-9999-9999-999999999999")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/partidas - deve falhar com dados inválidos", async () => {
    const res = await request(app)
      .post("/api/partidas")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        id_torneio: torneioId,
        fase: "FASE_INVÁLIDA",
        status: "PENDENTE",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("PATCH /api/partidas/agendar/:id_partida - deve falhar sem permissão", async () => {
    const userRes = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Agendamento",
        email: "user.agendamento@teste.com",
        senha: "123456",
        role: "USER",
      });

    const userToken = userRes.body.data.token;

    const res = await request(app)
      .patch(`/api/partidas/agendar/${partidaId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ horario: new Date() })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });
});

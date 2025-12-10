import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let userId;
let equipeId;
let equipeUsuarioId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um usuário para os testes
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Equipe Usuario",
      email: "user.equipeusuario@teste.com",
      senha: "123456",
      role: "USER",
    });

  userId = userRes.body.data.id_usuario;
  token = userRes.body.data.token;

  // Criar uma equipe
  const equipeRes = await request(app)
    .post("/api/equipe")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Equipe Teste Usuário" });

  equipeId = equipeRes.body.data.id_equipe;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de EquipeUsuario (Membros de Equipe)", () => {
  const equipeUsuarioData = {
    id_equipe: "",
    id_usuario: "",
  };

  test("POST /api/equipe-usuarios - deve vincular usuário a uma equipe", async () => {
    equipeUsuarioData.id_equipe = equipeId;
    equipeUsuarioData.id_usuario = userId;

    const res = await request(app)
      .post("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send(equipeUsuarioData)
      .expect(201);

    expect(res.body.status).toBe("success");
    expect(res.body.data.equipeUsuario.id_equipe).toBe(equipeId);
    expect(res.body.data.equipeUsuario.id_usuario).toBe(userId);

    equipeUsuarioId = res.body.data.equipeUsuario.id;
  });

  test("GET /api/equipe-usuarios - deve listar todos os vínculos equipe-usuário", async () => {
    const res = await request(app)
      .get("/api/equipe-usuarios")
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.equipeUsuario)).toBe(true);
    expect(res.body.results).toBeGreaterThan(0);
  });

  test("GET /api/equipe-usuarios/:equipeUsuarioId - deve buscar vínculo específico", async () => {
    const res = await request(app)
      .get(`/api/equipe-usuarios/${equipeUsuarioId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.equipeUsuario.id).toBe(equipeUsuarioId);
  });

  test("PUT /api/equipe-usuarios/:equipeUsuarioId - deve atualizar vínculo", async () => {
    // Criar nova equipe para testar atualização
    const novaEquipeRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Nova Equipe" });

    const novaEquipeId = novaEquipeRes.body.data.id_equipe;

    const res = await request(app)
      .put(`/api/equipe-usuarios/${equipeUsuarioId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        id_equipe: novaEquipeId,
        id_usuario: userId,
      })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.equipeUsuario.id_equipe).toBe(novaEquipeId);
  });

  test("DELETE /api/equipe-usuarios/:equipeUsuarioId - deve deletar vínculo", async () => {
    // Criar novo vínculo para deletar
    const userRes2 = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário 2",
        email: "user2.equipeusuario@teste.com",
        senha: "123456",
        role: "USER",
      });

    const userId2 = userRes2.body.data.id_usuario;
    const token2 = userRes2.body.data.token;

    const vinculoRes = await request(app)
      .post("/api/equipe-usuarios")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        id_equipe: equipeId,
        id_usuario: userId2,
      });

    const vinculoId = vinculoRes.body.data.equipeUsuario.id;

    const res = await request(app)
      .delete(`/api/equipe-usuarios/${vinculoId}`)
      .set("Authorization", `Bearer ${token2}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  test("POST /api/equipe-usuarios - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .post("/api/equipe-usuarios")
      .send(equipeUsuarioData)
      .expect(401);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/equipe-usuarios/:equipeUsuarioId - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .get(`/api/equipe-usuarios/${equipeUsuarioId}`)
      .expect(401);

    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/equipe-usuarios/:equipeUsuarioId - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .put(`/api/equipe-usuarios/${equipeUsuarioId}`)
      .send({
        id_equipe: equipeId,
        id_usuario: userId,
      })
      .expect(401);

    expect(res.body.error).toBeDefined();
  });

  test("DELETE /api/equipe-usuarios/:equipeUsuarioId - deve falhar sem autenticação", async () => {
    const res = await request(app)
      .delete(`/api/equipe-usuarios/${equipeUsuarioId}`)
      .expect(401);

    expect(res.body.error).toBeDefined();
  });
});

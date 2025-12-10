import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let userId;
let equipeId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo

  // Criar um usuário comum para os testes
  const userRes = await request(app)
    .post("/api/users/signup")
    .send({
      nome: "Usuário Equipe",
      email: "user.equipe@teste.com",
      senha: "123456",
      role: "USER",
    });

  userId = userRes.body.data.id_usuario;
  token = userRes.body.data.token;
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Rotas de Equipe", () => {
  const equipeData = {
    nome: "Equipe Alpha",
  };

  test("POST /api/equipes - deve criar uma nova equipe (autenticado)", async () => {
    const res = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${token}`)
      .send(equipeData)
      .expect(201);

    expect(res.body.status).toBe("Equipe criada com sucesso!");
    expect(res.body.data.nome).toBe(equipeData.nome);
    
    equipeId = res.body.data.id_equipe; // Salva para próximos testes
  });

  test("GET /api/equipes - deve listar todas as equipes (público)", async () => {
    const res = await request(app)
      .get("/api/equipe")
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.results).toBeGreaterThan(0);
  });

  test("GET /api/equipe/:id - deve buscar uma equipe específica (público)", async () => {
    const res = await request(app)
      .get(`/api/equipe/${equipeId}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.id_equipe).toBe(equipeId);
    expect(res.body.data.nome).toBe(equipeData.nome);
  });

  test("PUT /api/equipe/:id - deve atualizar uma equipe (autenticado)", async () => {
    const updateData = {
      nome: "Equipe Alpha Atualizada",
    };

    const res = await request(app)
      .put(`/api/equipe/${equipeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData)
      .expect(200);

    expect(res.body.status).toBe("Equipe atualizada com sucesso!");
    expect(res.body.data.nome).toBe(updateData.nome);
    expect(res.body.data.id_equipe).toBe(equipeId);
  });

  test("DELETE /api/equipe/:id - deve deletar uma equipe (autenticado)", async () => {
    // Primeiro, criar uma nova equipe para deletar
    const createRes = await request(app)
      .post("/api/equipe")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Equipe para Deletar",
      });

    const equipeToDeletar = createRes.body.data.id_equipe;

    // Agora deletar
    const res = await request(app)
      .delete(`/api/equipe/${equipeToDeletar}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  test("POST /api/equipes - deve falhar ao criar equipe sem autenticação", async () => {
    const res = await request(app)
      .post("/api/equipe")
      .send(equipeData)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/equipe/:id - deve retornar 404 para equipe inexistente (público)", async () => {
    const res = await request(app)
      .get("/api/equipe/99999999-9999-9999-9999-999999999999")
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/equipe/:id - deve falhar ao atualizar sem autenticação", async () => {
    const res = await request(app)
      .put(`/api/equipe/${equipeId}`)
      .send({ nome: "Novo Nome" })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("DELETE /api/equipe/:id - deve falhar ao deletar sem autenticação", async () => {
    const res = await request(app)
      .delete(`/api/equipe/${equipeId}`)
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/equipes - deve criar múltiplas equipes", async () => {
    const equipesParaCriar = [
      { nome: "Equipe Beta" },
      { nome: "Equipe Gamma" },
      { nome: "Equipe Delta" },
    ];

    const equipes = [];
    for (const equipe of equipesParaCriar) {
      const res = await request(app)
        .post("/api/equipe")
        .set("Authorization", `Bearer ${token}`)
        .send(equipe)
        .expect(201);

      equipes.push(res.body.data);
    }

    expect(equipes.length).toBe(3);
    equipes.forEach((equipe, index) => {
      expect(equipe.nome).toBe(equipesParaCriar[index].nome);
    });
  });
});

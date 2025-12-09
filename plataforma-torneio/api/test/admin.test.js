import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let adminId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Rotas de Admin (Ciclo Completo)", () => {
  const admin = {
    nome: "Admin Teste",
    email: "admin@teste.com",
    senha: "123456",
    secretKey: process.env.ADMIN_SECRET_KEY,
  };

  // 1. TESTE DE CRIAÇÃO
  test("POST /api/admin/register - deve cadastrar admin", async () => {
    const res = await request(app)
      .post("/api/admin/register")
      .send(admin)
      .expect(201);

    expect(res.body.data.role).toBe("ADMIN");
    adminId = res.body.data.id_usuario; // Salva ID para os próximos passos
  });

  // 2. TESTE DE LOGIN (Necessário para pegar o token)
  test("POST /api/admin/login - deve logar e retornar token", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({ email: admin.email, senha: admin.senha })
      .expect(200);

    expect(res.body.token).toBeDefined();
    token = res.body.token; // Salva token para rotas protegidas
  });

  // 3. TESTE DE ATUALIZAÇÃO
  test("PATCH /api/admin/edit/:id - deve atualizar nome", async () => {
    const res = await request(app)
      .patch(`/api/admin/edit/${adminId}`)
      .set("Authorization", `Bearer ${token}`) // Envia o token
      .send({ nome: "Admin Editado" })
      .expect(200);

    expect(res.body.data.nome).toBe("Admin Editado");
  });

  // 4. TESTE DE LOGOUT
  test("POST /api/admin/logout - deve deslogar", async () => {
    const res = await request(app)
      .post("/api/admin/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe("Você deslogou");
  });

  // 5. TESTE DE DELEÇÃO
  test("DELETE /api/admin/delete/:id - deve deletar admin", async () => {
    // Precisamos logar de novo pois o token anterior foi invalidado no logout
    // Se o logout invalida token no banco (blacklist), esse teste falharia com o token antigo.
    const loginRes = await request(app)
      .post("/api/admin/login")
      .send({ email: admin.email, senha: "123456" }); // Senha não mudou
    const newToken = loginRes.body.token;

    await request(app)
      .delete(`/api/admin/delete/${adminId}`)
      .set("Authorization", `Bearer ${newToken}`)
      .expect(204); // 204 = Sucesso sem conteúdo
  });
});

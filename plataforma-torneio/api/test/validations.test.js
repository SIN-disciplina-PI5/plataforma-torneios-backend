import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let userId;

beforeAll(async () => {
  await sequelize.sync({ force: true }); //recria o banco limpo
});

afterAll(async () => {
  await sequelize.close(); //fecha a conexão com o banco
});

describe("Validações e Casos Especiais - User", () => {
  test("POST /api/users/signup - deve falhar com email inválido", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Teste",
        email: "email-invalido",
        senha: "123456",
        role: "USER",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/signup - deve falhar com email vazio", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Teste",
        email: "",
        senha: "123456",
        role: "USER",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/signup - deve falhar com nome vazio", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "",
        email: "teste@email.com",
        senha: "123456",
        role: "USER",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/signup - deve falhar com senha vazia", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Teste",
        email: "teste@email.com",
        senha: "",
        role: "USER",
      })
      .expect(400);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/signup - deve falhar com email duplicado", async () => {
    // Primeiro signup
    await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário 1",
        email: "duplicado@email.com",
        senha: "123456",
        role: "USER",
      })
      .expect(201);

    // Segundo signup com mesmo email
    const res = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário 2",
        email: "duplicado@email.com",
        senha: "123456",
        role: "USER",
      })
      .expect(400);

    expect(res.body.error).toContain("Email já cadastrado");
  });

  test("POST /api/users/login - deve falhar com email inválido", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "naoexiste@email.com",
        senha: "123456",
      })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/login - deve falhar com senha errada", async () => {
    // Criar usuário
    await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Teste",
        email: "teste.senha@email.com",
        senha: "senha123",
        role: "USER",
      });

    // Tentar login com senha errada
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "teste.senha@email.com",
        senha: "senhaerrada",
      })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("POST /api/users/login - deve falhar com email/senha vazia", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "",
        senha: "",
      })
      .expect(403);

    expect(res.body.error).toBeDefined();
  });

  test("GET /api/users - deve listar todos os usuários", async () => {
    const res = await request(app)
      .get("/api/users")
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("GET /api/users/:id_usuario - deve buscar usuário por ID", async () => {
    const signupRes = await request(app)
      .post("/api/users/signup")
      .send({
        nome: "Usuário Busca",
        email: "busca@email.com",
        senha: "123456",
        role: "USER",
      });

    const userId = signupRes.body.data.id_usuario;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(res.body.data.id_usuario).toBe(userId);
    expect(res.body.data.nome).toBe("Usuário Busca");
  });

  test("GET /api/users/:id_usuario - deve retornar 404 para usuário inexistente", async () => {
    const res = await request(app)
      .get("/api/users/99999999-9999-9999-9999-999999999999")
      .expect(404);

    expect(res.body.error).toBeDefined();
  });
});

describe("Validações e Casos Especiais - Admin", () => {
  test("POST /api/admin/register - deve falhar sem secret key", async () => {
    const res = await request(app)
      .post("/api/admin/register")
      .send({
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: "123456",
        // secretKey não enviada
      })
      .expect(400);

    expect(res.body.error).toContain("Chave de segurança");
  });

  test("POST /api/admin/register - deve falhar com secret key inválida", async () => {
    const res = await request(app)
      .post("/api/admin/register")
      .send({
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: "123456",
        secretKey: "chave_errada",
      })
      .expect(400);

    expect(res.body.error).toContain("Chave de segurança");
  });

  test("POST /api/admin/register - deve falhar com email duplicado", async () => {
    // Primeiro admin
    await request(app)
      .post("/api/admin/register")
      .send({
        nome: "Admin 1",
        email: "admin.duplicado@teste.com",
        senha: "123456",
        secretKey: process.env.ADMIN_SECRET_KEY,
      })
      .expect(201);

    // Segundo admin com mesmo email
    const res = await request(app)
      .post("/api/admin/register")
      .send({
        nome: "Admin 2",
        email: "admin.duplicado@teste.com",
        senha: "123456",
        secretKey: process.env.ADMIN_SECRET_KEY,
      })
      .expect(400);

    expect(res.body.error).toContain("E-mail já cadastrado");
  });
});

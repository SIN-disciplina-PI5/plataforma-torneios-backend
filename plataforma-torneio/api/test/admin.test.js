import request from "supertest";
import app from "../index.js";
import { sequelize } from "../models/index.js";

let token;
let adminId;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe("Rotas de Admin (Ciclo Completo)", () => {
    const timestamp = Date.now();
    const admin = {
        nome: "Admin Teste",
        email: `admin${timestamp}@teste.com`,
        senha: "123456",
        secretKey: process.env.ADMIN_SECRET_KEY,
    };

    test("POST /api/admin/register - deve cadastrar admin", async () => {
        const res = await request(app)
            .post("/api/admin/register")
            .send(admin)
            .expect(201);

        expect(res.body.data.role).toBe("ADMIN");
        adminId = res.body.data.id_usuario;
    });

    test("POST /api/admin/login - deve logar e retornar token", async () => {
        const res = await request(app)
            .post("/api/admin/login")
            .send({ email: admin.email, senha: admin.senha })
            .expect(200);

        expect(res.body.token).toBeDefined();
        token = res.body.token;
    });

    test("PATCH /api/admin/edit/:id - deve atualizar nome", async () => {
        const res = await request(app)
            .patch(`/api/admin/edit/${adminId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ nome: "Admin Editado" })
            .expect(200);

        expect(res.body.data.nome).toBe("Admin Editado");
    });

    test("POST /api/admin/logout - deve deslogar", async () => {
        const res = await request(app)
            .post("/api/admin/logout")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(res.body.message).toBe("Você deslogou");
    });

    test("DELETE /api/admin/delete/:id - deve deletar admin", async () => {
        const loginRes = await request(app)
            .post("/api/admin/login")
            .send({ email: admin.email, senha: admin.senha });
        
        const newToken = loginRes.body.token;

        await request(app)
            .delete(`/api/admin/delete/${adminId}`)
            .set("Authorization", `Bearer ${newToken}`)
            .expect(204);
    });
});
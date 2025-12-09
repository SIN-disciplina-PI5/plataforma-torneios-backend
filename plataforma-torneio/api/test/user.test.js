import request from "supertest";
import app from "../index.js";
import { sequelize } from "../models/index.js";

let token;
let userId;

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe("Rotas de usuário", () => {
    const timestamp = Date.now();
    const user = {
        nome: "Nome Teste",
        email: `nome${timestamp}@email.com`,
        senha: "123456",
    };

    test("POST /api/users/signup - deve cadastrar um novo usuário", async () => {
        const res = await request(app)
            .post("/api/users/signup")
            .send(user)
            .expect(201);
        
        expect(res.body.data.novoUsuario.email).toBe(user.email);
        token = res.body.data.token;
        userId = res.body.data.novoUsuario.id_usuario;
    });

    test("POST /api/users/login - deve logar e retornar token", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({ email: user.email, senha: user.senha })
            .expect(200);
        
        expect(res.body.token).toBeDefined();
        token = res.body.token; 
    });

    test("PATCH /api/users/edit/:id_usuario - deve atualizar o perfil", async () => {
        const res = await request(app)
            .patch(`/api/users/edit/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Nome Atualizado",
                email: `novo${timestamp}@email.com`,
            })
            .expect(200);

        expect(res.body.nome).toBe("Nome Atualizado");
        expect(res.body.email).toBe(`novo${timestamp}@email.com`);
    });

    test("DELETE /api/users/delete/:id_usuario - deve deletar um usuário", async () => {
        const res = await request(app)
            .delete(`/api/users/delete/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(204);
        
        expect(res.body).toEqual({});
    });

    test("POST /api/users/logout - deve deslogar com sucesso", async () => {
        const res = await request(app)
            .post("/api/users/logout")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);
        
        expect(res.body.message).toBe("Você deslogou");
    });
});
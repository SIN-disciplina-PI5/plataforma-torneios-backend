import request from "supertest";
import app from "../index.js";
import models, { sequelize } from "../models/index.js";

let token;
let userId;

beforeAll(async () => {                     //antes de rodar todos os testes, recria o banco limpo
    await sequelize.sync({ force: true });  //força a recriação das tabelas 
});

afterAll(async () => {                      //depois de executar os testes, fecha a conexão com o banco
    await sequelize.close();
});

describe("Rotas de usuário", () => {
    const user = {
        nome: "Nome Teste",
        email: "nome@email.com",
        senha: "123456",
        role: "USER",
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
    });

    test("PATCH /api/users/edit/:id_usuario - deve atualizar o perfil", async () => {
        const res = await request(app)
            .patch(`/api/users/edit/${userId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Nome Atualizado",
                email: "novoemail@email.com",
                role: "ADMIN",
            })
            .expect(200);

        expect(res.body.nome).toBe("Nome Atualizado");
        expect(res.body.email).toBe("novoemail@email.com");
        expect(res.body.role).toBe("ADMIN");
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

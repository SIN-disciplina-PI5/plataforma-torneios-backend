// teste.test.js
import { sequelize } from "../models/index.js";
import models from "../models/index.js";
const { Usuario, Torneio, Inscricao, Equipe, EquipeUsuario, Partida, PartidaUsuario, Ranking, Blacklist } = models;

// Importa todos os serviços
import { loginService, logoutService, verificarTokenService } from "../services/authService.js";
import { createUsuarioService, getAllUsuariosService, getUsuarioByIdService, updateUsuarioService, deleteUsuarioService } from "../services/userService.js";
import { createTorneioService, gerarChaveService, avancarFaseService, atualizarStatusService, getTorneioByIdService } from "../services/torneioService.js";
import { createInscricaoService, updateInscricaoService, getInscricoesByTorneioService } from "../services/inscricaoService.js";
import { createEquipeService, entrarNaEquipeService, sairDaEquipeService, getAllEquipesService } from "../services/equipeService.js";
import { atualizarPontuacaoService, getRankingUsuarioService, getRankingGeralService } from "../services/rankingService.js";
import { finalizarPartidaService, getPartidaByIdService, agendarPartidaService, iniciarPartidaService, createPartidaService } from "../services/partidaService.js";

// Configura ambiente de teste
process.env.MY_SECRET = "testsecret";
process.env.JWT_EXPIRES_IN = "3600";

// Função auxiliar para criar datas de teste
const obterDatasTorneio = () => {
  const data_inicio = new Date();
  data_inicio.setDate(data_inicio.getDate() + 1); // começa amanhã
  const data_fim = new Date();
  data_fim.setDate(data_fim.getDate() + 30); // termina em 30 dias
  return { data_inicio, data_fim };
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Fluxo completo: usuários → torneio → inscrições → equipes → chave → partida → ranking", () => {
  let adminToken, user1Token, user2Token, user3Token, user4Token;
  let user1Id, user2Id, user3Id, user4Id;
  let torneioId;
  let equipe1Id, equipe2Id;

  test("1. Criar usuários (admin e 4 comuns)", async () => {
    const admin = await createUsuarioService({ nome: "Admin", email: "admin@teste.com", senha: "admin123" });
    await Usuario.update({ role: "ADMIN" }, { where: { id_usuario: admin.id_usuario } });
    
    const user1 = await createUsuarioService({ nome: "User1", email: "user1@teste.com", senha: "123456" });
    const user2 = await createUsuarioService({ nome: "User2", email: "user2@teste.com", senha: "123456" });
    const user3 = await createUsuarioService({ nome: "User3", email: "user3@teste.com", senha: "123456" });
    const user4 = await createUsuarioService({ nome: "User4", email: "user4@teste.com", senha: "123456" });
    
    user1Id = user1.id_usuario;
    user2Id = user2.id_usuario;
    user3Id = user3.id_usuario;
    user4Id = user4.id_usuario;
    
    expect(admin.id_usuario).toBeDefined();
    expect(user1Id).toBeDefined();
  });

  test("2. Login de todos os usuários", async () => {
    const adminLogin = await loginService("admin@teste.com", "admin123");
    adminToken = adminLogin;
    
    const user1Login = await loginService("user1@teste.com", "123456");
    user1Token = user1Login;
    const user2Login = await loginService("user2@teste.com", "123456");
    user2Token = user2Login;
    const user3Login = await loginService("user3@teste.com", "123456");
    user3Token = user3Login;
    const user4Login = await loginService("user4@teste.com", "123456");
    user4Token = user4Login;
    
    expect(adminToken).toBeTruthy();
    expect(user1Token).toBeTruthy();
  });

  test("3. Criar torneio (admin) com datas válidas", async () => {
    const { data_inicio, data_fim } = obterDatasTorneio();
    const torneio = await createTorneioService({ 
      nome: "Torneio Teste", 
      categoria: "Duplas", 
      vagas: 4,
      data_inicio,
      data_fim
    });
    torneioId = torneio.id_torneio;
    expect(torneioId).toBeDefined();
    expect(torneio.vagas).toBe(4);
    expect(torneio.data_inicio).toBeDefined();
    expect(torneio.data_fim).toBeDefined();
  });

  test("4. Inscrições dos 4 usuários", async () => {
    const insc1 = await createInscricaoService({ id_usuario: user1Id, id_torneio: torneioId });
    const insc2 = await createInscricaoService({ id_usuario: user2Id, id_torneio: torneioId });
    const insc3 = await createInscricaoService({ id_usuario: user3Id, id_torneio: torneioId });
    const insc4 = await createInscricaoService({ id_usuario: user4Id, id_torneio: torneioId });
    
    expect(insc1.status).toBe("AGUARDANDO");
    expect(insc2.status).toBe("AGUARDANDO");
    expect(insc3.status).toBe("AGUARDANDO");
    expect(insc4.status).toBe("AGUARDANDO");
  });

  test("5. Admin aprova as 4 inscrições", async () => {
    const inscricoes = await getInscricoesByTorneioService(torneioId);
    for (const insc of inscricoes) {
      await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
    }
    const aprovadas = await Inscricao.count({ where: { id_torneio: torneioId, status: "APROVADA" } });
    expect(aprovadas).toBe(4);
  });

  test("6. User1 cria equipe1", async () => {
    const equipe = await createEquipeService(torneioId, user1Id, "Equipe A");
    equipe1Id = equipe.id_equipe;
    expect(equipe1Id).toBeDefined();
    const membros = await EquipeUsuario.findAll({ where: { id_equipe: equipe1Id } });
    expect(membros.length).toBe(1);
    expect(membros[0].id_usuario).toBe(user1Id);
  });

  test("7. User2 entra na equipe1", async () => {
    const result = await entrarNaEquipeService(torneioId, user2Id, equipe1Id);
    expect(result.message).toBe("Usuário entrou na equipe");
    const membros = await EquipeUsuario.findAll({ where: { id_equipe: equipe1Id } });
    expect(membros.length).toBe(2);
  });

  test("8. User3 cria equipe2", async () => {
    const equipe = await createEquipeService(torneioId, user3Id, "Equipe B");
    equipe2Id = equipe.id_equipe;
    expect(equipe2Id).toBeDefined();
  });

  test("9. User4 entra na equipe2", async () => {
    const result = await entrarNaEquipeService(torneioId, user4Id, equipe2Id);
    expect(result.message).toBe("Usuário entrou na equipe");
  });

  test("10. Gerar chave do torneio", async () => {
    const partidasGeradas = await gerarChaveService(torneioId);
    expect(partidasGeradas.length).toBe(2);
    expect(partidasGeradas[0].fase).toBe("OITAVAS_DE_FINAL");
    
    const partidas = await Partida.findAll({ where: { id_torneio: torneioId } });
    expect(partidas.length).toBe(2);
    const vinculadas = await PartidaUsuario.findAll();
    expect(vinculadas.length).toBe(4);
  });

  test("11. Agendar partida com horário válido (dentro do período do torneio)", async () => {
    const partida = await Partida.findOne({ where: { id_torneio: torneioId } });
    const torneio = await getTorneioByIdService(torneioId);
    const horarioValido = new Date(torneio.data_inicio);
    horarioValido.setHours(horarioValido.getHours() + 1);
    
    const agendada = await agendarPartidaService(partida.id_partida, horarioValido);
    expect(agendada.status).toBe("PENDENTE");
    expect(agendada.horario).toBeDefined();
  });

  test("12. Finalizar primeira partida (definir vencedor)", async () => {
    const partida = await Partida.findOne({ where: { id_torneio: torneioId } });
    const equipesNaPartida = await PartidaUsuario.findAll({ where: { id_partida: partida.id_partida } });
    const vencedorId = equipesNaPartida[0].id_equipe;
    
    const finalizada = await finalizarPartidaService(partida.id_partida, {
      placar: "2x0",
      vencedor_id: vencedorId,
      resultado: "Time A venceu"
    });
    expect(finalizada.status).toBe("FINALIZADA");
    expect(finalizada.vencedor_id).toBe(vencedorId);
    
    const membrosVencedores = await EquipeUsuario.findAll({ where: { id_equipe: vencedorId } });
    for (const membro of membrosVencedores) {
      const ranking = await getRankingUsuarioService(membro.id_usuario);
      expect(ranking.pontos).toBeGreaterThan(0);
    }
  });

  test("13. Avançar para próxima fase", async () => {
    const segundaPartida = await Partida.findOne({ where: { id_torneio: torneioId, status: "PENDENTE" } });
    const equipesSegunda = await PartidaUsuario.findAll({ where: { id_partida: segundaPartida.id_partida } });
    const vencedorSegunda = equipesSegunda[0].id_equipe;
    await finalizarPartidaService(segundaPartida.id_partida, {
      placar: "2x1",
      vencedor_id: vencedorSegunda
    });
    
    const novasPartidas = await avancarFaseService(torneioId, "OITAVAS_DE_FINAL");
    expect(novasPartidas.length).toBeGreaterThan(0);
  });

  test("14. Verificar ranking geral após as partidas", async () => {
    const rankingGeral = await getRankingGeralService(10);
    expect(rankingGeral.length).toBe(4);
    expect(rankingGeral[0]).toHaveProperty("pontos");
    expect(rankingGeral[0]).toHaveProperty("usuario");
  });

  test("15. (Bônus) Testar logout de um usuário", async () => {
    const logoutResult = await logoutService(user1Token);
    expect(logoutResult.message).toBe("Você deslogou");
    const blacklisted = await Blacklist.findOne({ where: { token: user1Token } });
    expect(blacklisted).toBeTruthy();
  });
});

// ========== TESTES DE EXCEÇÃO E VALIDAÇÃO ==========
describe("Testes de exceção e validação", () => {
  let adminToken, userToken;

  beforeAll(async () => {
    const admin = await createUsuarioService({ nome: "Admin2", email: "admin2@teste.com", senha: "admin123" });
    await Usuario.update({ role: "ADMIN" }, { where: { id_usuario: admin.id_usuario } });
    adminToken = await loginService("admin2@teste.com", "admin123");
    
    const user = await createUsuarioService({ nome: "UserTest", email: "usertest@teste.com", senha: "123456" });
    userToken = await loginService("usertest@teste.com", "123456");
  });

  const obterDatasValidas = () => {
    const data_inicio = new Date();
    data_inicio.setDate(data_inicio.getDate() + 1);
    const data_fim = new Date();
    data_fim.setDate(data_fim.getDate() + 30);
    return { data_inicio, data_fim };
  };

  describe("Validações de Torneio", () => {
    test("Não deve criar torneio sem data_inicio", async () => {
      const { data_fim } = obterDatasValidas();
      await expect(createTorneioService({ 
        nome: "Sem Data Inicio", 
        categoria: "Duplas", 
        vagas: 4,
        data_fim
      })).rejects.toThrow("Data de início é obrigatória");
    });

    test("Não deve criar torneio sem data_fim", async () => {
      const { data_inicio } = obterDatasValidas();
      await expect(createTorneioService({ 
        nome: "Sem Data Fim", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio
      })).rejects.toThrow("Data de fim é obrigatória");
    });

    test("Não deve criar torneio com data_fim anterior ou igual a data_inicio", async () => {
      const data_inicio = new Date();
      const data_fim = new Date();
      data_fim.setDate(data_fim.getDate() - 1); // fim antes do início
      
      await expect(createTorneioService({ 
        nome: "Datas Inválidas", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      })).rejects.toThrow("Data de fim deve ser posterior à data de início");
    });

    test("Não deve criar torneio com número de vagas inválido", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      await expect(createTorneioService({ 
        nome: "Vagas Invalidas", 
        categoria: "Duplas", 
        vagas: 2,
        data_inicio,
        data_fim
      })).rejects.toThrow("As vagas devem ser 4, 8, 16 ou 32");
    });
  });

  describe("Validações de Inscrição", () => {
    test("Não deve permitir inscrição se torneio já estiver com todas vagas preenchidas", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const torneio = await createTorneioService({ 
        nome: "Torneio Limite", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      
      const users = [];
      for (let i = 0; i < 4; i++) {
        const user = await createUsuarioService({ nome: `Limite${i}`, email: `limite${i}@teste.com`, senha: "123" });
        users.push(user);
        await createInscricaoService({ id_usuario: user.id_usuario, id_torneio: torneio.id_torneio });
      }
      
      const inscricoes = await getInscricoesByTorneioService(torneio.id_torneio);
      for (const insc of inscricoes) {
        await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
      }
      
      const userExtra = await createUsuarioService({ nome: "Extra", email: "extra@teste.com", senha: "123" });
      await expect(createInscricaoService({ id_usuario: userExtra.id_usuario, id_torneio: torneio.id_torneio }))
        .rejects.toThrow("Torneio está com todas as vagas preenchidas");
    });

    test("Usuário não pode criar equipe sem estar aprovado no torneio", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const torneio = await createTorneioService({ 
        nome: "Torneio Sem Aprovação", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      const userNovo = await createUsuarioService({ nome: "Novato", email: "novato@teste.com", senha: "123" });
      await createInscricaoService({ id_usuario: userNovo.id_usuario, id_torneio: torneio.id_torneio });
      
      await expect(createEquipeService(torneio.id_torneio, userNovo.id_usuario, "Equipe Proibida"))
        .rejects.toThrow("Usuário precisa estar aprovado no torneio");
    });
  });

  describe("Validações de Equipe", () => {
    test("Usuário não pode entrar em equipe se já possuir uma", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const t = await createTorneioService({ 
        nome: "Torneio Dupla Cheia", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      const u1 = await createUsuarioService({ nome: "U1", email: "u1@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "U2", email: "u2@teste.com", senha: "123" });
      
      const i1 = await createInscricaoService({ id_usuario: u1.id_usuario, id_torneio: t.id_torneio });
      const i2 = await createInscricaoService({ id_usuario: u2.id_usuario, id_torneio: t.id_torneio });
      await updateInscricaoService(i1.id_inscricao, { status: "APROVADA" });
      await updateInscricaoService(i2.id_inscricao, { status: "APROVADA" });
      
      const equipe = await createEquipeService(t.id_torneio, u1.id_usuario, "Equipe Única");
      await entrarNaEquipeService(t.id_torneio, u2.id_usuario, equipe.id_equipe);
      
      await expect(createEquipeService(t.id_torneio, u2.id_usuario, "Segunda Equipe"))
        .rejects.toThrow("Usuário já possui equipe");
    });

    test("Não permitir entrar em equipe já cheia (2 membros)", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const t = await createTorneioService({ 
        nome: "Torneio Equipe Cheia", 
        categoria: "Duplas", 
        vagas: 8,
        data_inicio,
        data_fim
      });
      
      const u1 = await createUsuarioService({ nome: "Time1_A", email: "time1a@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "Time1_B", email: "time1b@teste.com", senha: "123" });
      const u3 = await createUsuarioService({ nome: "Time1_C", email: "time1c@teste.com", senha: "123" });
      
      for (const u of [u1, u2, u3]) {
        const insc = await createInscricaoService({ id_usuario: u.id_usuario, id_torneio: t.id_torneio });
        await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
      }
      
      const equipe = await createEquipeService(t.id_torneio, u1.id_usuario, "Equipe Lotada");
      await entrarNaEquipeService(t.id_torneio, u2.id_usuario, equipe.id_equipe);
      
      await expect(entrarNaEquipeService(t.id_torneio, u3.id_usuario, equipe.id_equipe))
        .rejects.toThrow("Equipe já está cheia");
    });
  });

  describe("Validações de Chave e Partida", () => {
    test("Gerar chave deve falhar se não houver equipes suficientes", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const t = await createTorneioService({ 
        nome: "Torneio Sem Equipes", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      const u1 = await createUsuarioService({ nome: "Solitário", email: "solo@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "Outro", email: "outro@teste.com", senha: "123" });
      
      const i1 = await createInscricaoService({ id_usuario: u1.id_usuario, id_torneio: t.id_torneio });
      const i2 = await createInscricaoService({ id_usuario: u2.id_usuario, id_torneio: t.id_torneio });
      await updateInscricaoService(i1.id_inscricao, { status: "APROVADA" });
      await updateInscricaoService(i2.id_inscricao, { status: "APROVADA" });
      
      await expect(gerarChaveService(t.id_torneio))
        .rejects.toThrow("Não há equipes suficientes para gerar chave");
    });

    test("Gerar chave deve falhar após o início do torneio", async () => {
      const data_inicio = new Date();
      data_inicio.setDate(data_inicio.getDate() - 1); // ontem
      const data_fim = new Date();
      data_fim.setDate(data_fim.getDate() + 30);
      
      const t = await createTorneioService({ 
        nome: "Torneio Iniciado", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      
      const u1 = await createUsuarioService({ nome: "UserA", email: "usera@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "UserB", email: "userb@teste.com", senha: "123" });
      const u3 = await createUsuarioService({ nome: "UserC", email: "userc@teste.com", senha: "123" });
      const u4 = await createUsuarioService({ nome: "UserD", email: "userd@teste.com", senha: "123" });
      
      for (const u of [u1, u2, u3, u4]) {
        const insc = await createInscricaoService({ id_usuario: u.id_usuario, id_torneio: t.id_torneio });
        await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
      }
      
      const equipe1 = await createEquipeService(t.id_torneio, u1.id_usuario, "EquipeX");
      await entrarNaEquipeService(t.id_torneio, u2.id_usuario, equipe1.id_equipe);
      const equipe2 = await createEquipeService(t.id_torneio, u3.id_usuario, "EquipeY");
      await entrarNaEquipeService(t.id_torneio, u4.id_usuario, equipe2.id_equipe);
      
      await expect(gerarChaveService(t.id_torneio))
        .rejects.toThrow("Não é possível gerar a chave após o início do torneio");
    });

    test("Não deve agendar partida com horário fora do período do torneio", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const t = await createTorneioService({ 
        nome: "Torneio Agendamento", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      
      const u1 = await createUsuarioService({ nome: "Agenda1", email: "agenda1@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "Agenda2", email: "agenda2@teste.com", senha: "123" });
      const u3 = await createUsuarioService({ nome: "Agenda3", email: "agenda3@teste.com", senha: "123" });
      const u4 = await createUsuarioService({ nome: "Agenda4", email: "agenda4@teste.com", senha: "123" });
      
      for (const u of [u1, u2, u3, u4]) {
        const insc = await createInscricaoService({ id_usuario: u.id_usuario, id_torneio: t.id_torneio });
        await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
      }
      
      const equipe1 = await createEquipeService(t.id_torneio, u1.id_usuario, "DuplaAgenda1");
      await entrarNaEquipeService(t.id_torneio, u2.id_usuario, equipe1.id_equipe);
      const equipe2 = await createEquipeService(t.id_torneio, u3.id_usuario, "DuplaAgenda2");
      await entrarNaEquipeService(t.id_torneio, u4.id_usuario, equipe2.id_equipe);
      
      await gerarChaveService(t.id_torneio);
      const partida = await Partida.findOne({ where: { id_torneio: t.id_torneio } });
      
      const horarioInvalido = new Date(data_fim);
      horarioInvalido.setDate(horarioInvalido.getDate() + 1);
      
      await expect(agendarPartidaService(partida.id_partida, horarioInvalido))
        .rejects.toThrow(`Horário da partida deve estar entre`);
    });

    test("Finalizar partida sem informar vencedor deve lançar erro", async () => {
      const { data_inicio, data_fim } = obterDatasValidas();
      const t = await createTorneioService({ 
        nome: "Torneio Finalização", 
        categoria: "Duplas", 
        vagas: 4,
        data_inicio,
        data_fim
      });
      
      const u1 = await createUsuarioService({ nome: "FinalA1", email: "finala1@teste.com", senha: "123" });
      const u2 = await createUsuarioService({ nome: "FinalA2", email: "finala2@teste.com", senha: "123" });
      const u3 = await createUsuarioService({ nome: "FinalB1", email: "finalb1@teste.com", senha: "123" });
      const u4 = await createUsuarioService({ nome: "FinalB2", email: "finalb2@teste.com", senha: "123" });
      
      for (const u of [u1, u2, u3, u4]) {
        const insc = await createInscricaoService({ id_usuario: u.id_usuario, id_torneio: t.id_torneio });
        await updateInscricaoService(insc.id_inscricao, { status: "APROVADA" });
      }
      
      const equipe1 = await createEquipeService(t.id_torneio, u1.id_usuario, "DuplaFinal1");
      await entrarNaEquipeService(t.id_torneio, u2.id_usuario, equipe1.id_equipe);
      const equipe2 = await createEquipeService(t.id_torneio, u3.id_usuario, "DuplaFinal2");
      await entrarNaEquipeService(t.id_torneio, u4.id_usuario, equipe2.id_equipe);
      
      await gerarChaveService(t.id_torneio);
      const partida = await Partida.findOne({ where: { id_torneio: t.id_torneio } });
      
      await expect(finalizarPartidaService(partida.id_partida, { placar: "2x0" }))
        .rejects.toThrow("Vencedor obrigatório");
    });
  });

  describe("Validações de Token", () => {
    test("Token inválido deve ser rejeitado pelo verificarTokenService", async () => {
      await expect(verificarTokenService("token_qualquer"))
        .rejects.toThrow("Token inválido ou expirado");
      await expect(verificarTokenService(null))
        .rejects.toThrow("Token obrigatório");
    });
  });
});
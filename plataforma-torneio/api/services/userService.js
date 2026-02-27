import models from "../models/index.js";
const { Usuario, Ranking, EquipeUsuario, PartidaUsuario, Partida, Equipe, Torneio } = models;

export const createUsuarioService = async (dados) => {
  const { nome, email, senha } = dados;
  if (!nome) throw new Error("Nome é obrigatório");
  if (!email) throw new Error("Email é obrigatório");
  if (!senha) throw new Error("Senha é obrigatória");

  const usuarioExistente = await Usuario.findOne({ where: { email } });
  if (usuarioExistente) throw new Error("Email já cadastrado");

  const novoUsuario = await Usuario.create({
    nome, email, senha,
    role: "USER",
    patente: "Iniciante"
  });

  return {
    id_usuario: novoUsuario.id_usuario,
    nome: novoUsuario.nome,
    email: novoUsuario.email,
    role: novoUsuario.role,
    patente: novoUsuario.patente,
  };
};

export const getAllUsuariosService = async () => {
  const usuarios = await Usuario.findAll({
    attributes: ["id_usuario", "nome", "email", "role", "patente"],
    order: [["nome", "ASC"]]
  });
  return usuarios;
};

export const getUsuarioByIdService = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    attributes: ["id_usuario", "nome", "email", "role", "patente"],
    include: [{ model: Ranking, as: "ranking", attributes: ["pontos_acumulados", "posicao_atual"] }]
  });
  if (!usuario) throw new Error("Usuário não encontrado");

  const { ranking, ...dadosUsuario } = usuario.toJSON();
  return {
    ...dadosUsuario,
    ranking: ranking ? {
      pontos: ranking.pontos_acumulados,
      posicao: ranking.posicao_atual,
    } : null,
  };
};

export const updateUsuarioService = async (id, dados) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuário não encontrado");

  if (dados.email && dados.email !== usuario.email) {
    const emailExistente = await Usuario.findOne({ where: { email: dados.email } });
    if (emailExistente) throw new Error("Email já está em uso");
  }

  await usuario.update(dados);
  return {
    id_usuario: usuario.id_usuario,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
    patente: usuario.patente,
  };
};

export const deleteUsuarioService = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new Error("Usuário não encontrado");
  await usuario.destroy();
  return { message: "Usuário deletado com sucesso" };
};

export const getHistoricoUsuarioService = async (userId) => {
  const vinculos = await EquipeUsuario.findAll({
    where: { id_usuario: userId },
    attributes: ["id_equipe"]
  });

  if (!vinculos.length) return [];

  const equipeIds = vinculos.map(v => v.id_equipe);

  const partidasEquipes = await PartidaUsuario.findAll({
    where: { id_equipe: equipeIds },
    attributes: ["id_partida"]
  });

  if (!partidasEquipes.length) return [];

  const partidaIds = [...new Set(partidasEquipes.map(p => p.id_partida))];

  const historico = await Partida.findAll({
    where: { id_partida: partidaIds },
    include: [{ model: Torneio, attributes: ["nome"] }],
    attributes: ["id_partida", "fase", "status", "horario", "placar", "resultado"],
    order: [["horario", "DESC"]]
  });

  return historico.map(p => ({
    id_partida: p.id_partida,
    fase: p.fase,
    status: p.status,
    horario: p.horario,
    placar: p.placar,
    resultado: p.resultado,
    torneio: p.Torneio ? { nome: p.Torneio.nome } : null,
  }));
};

export const getPerfilCompletoService = async (userId) => {
  const usuario = await getUsuarioByIdService(userId); 

  const vinculos = await EquipeUsuario.findAll({
    where: { id_usuario: userId },
    attributes: ["id_equipe"]
  });

  let equipes = [];
  if (vinculos.length) {
    const equipeIds = vinculos.map(v => v.id_equipe);
    const equipesData = await Equipe.findAll({
      where: { id_equipe: equipeIds },
      attributes: ["id_equipe", "nome"]
    });
    equipes = equipesData.map(e => ({ id: e.id_equipe, nome: e.nome }));
  }

  return {
    ...usuario,
    equipes,
  };
};
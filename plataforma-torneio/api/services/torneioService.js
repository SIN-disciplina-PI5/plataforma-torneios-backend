import models from "../models/index.js";
const { Torneio } = models;

export const criarTorneioService = async (dados) => {
    const { nome, categoria, vagas } = dados;
    if (!nome || !categoria || !vagas) throw new Error("Dados faltando");

    const novoTorneio = await Torneio.create({
        nome,
        categoria,
        status: true,
        vagas,
    });

    return novoTorneio;
};

export const listarTorneiosService = async () => {
    return await Torneio.findAll();
};

export const buscarTorneioService = async (id) => {
    const torneio = await Torneio.findByPk(id);
    if (!torneio) throw new Error("Torneio não encontrado");
    return torneio;
};

export const atualizarTorneioService = async (id, dados) => {
    const torneio = await Torneio.findByPk(id);
    if (!torneio) throw new Error("Torneio não encontrado");
    await torneio.update(dados);
    return torneio;
};

export const deletarTorneioService = async (id) => {
    const deletado = await Torneio.destroy({ where: { id_torneio: id } });
    if (!deletado) throw new Error("Torneio não encontrado");
};

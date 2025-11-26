import models from "../models/index.js";

const equipeService = {
  create: async (data) => {
    try {
      const novaEquipe = await models.Equipe.create(data);
      return novaEquipe;
    } catch (error) {
      throw new Error(`Erro ao criar equipe: ${error.message}`);
    }
  },

  getAll: async () => {
    try {
      return await models.Equipe.findAll();
    } catch (error) {
      throw new Error(`Erro ao buscar equipes: ${error.message}`);
    }
  },

  getById: async (id) => {
    try {
      const equipe = await models.Equipe.findByPk(id);
      if (!equipe) throw new Error("Equipe não encontrada");
      return equipe;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  update: async (id, data) => {
    try {
      const equipe = await models.Equipe.findByPk(id);
      if (!equipe) throw new Error("Equipe não encontrada para atualização");

      await equipe.update(data);
      return equipe;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  delete: async (id) => {
    try {
      const equipe = await models.Equipe.findByPk(id);
      if (!equipe) throw new Error("Equipe não encontrada para exclusão");

      await equipe.destroy();
      return { message: "Equipe deletada com sucesso" };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default equipeService;

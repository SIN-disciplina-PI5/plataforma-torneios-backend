import models from "../models/index.js";

const equipeUsuarioService = {
  async getAll() {
    return await models.EquipeUsuario.findAll();
  },

  async getById(id) {
    const item = await models.EquipeUsuario.findByPk(id);
    if (!item) throw new Error("EquipeUsuario não encontrado");
    return item;
  },

  async create(data) {
    return await models.EquipeUsuario.create(data);
  },

  async update(id, data) {
    const item = await models.EquipeUsuario.findByPk(id);
    if (!item) throw new Error("EquipeUsuario não encontrado");

    await item.update(data);
    return item;
  },

  async delete(id) {
    const item = await models.EquipeUsuario.findByPk(id);
    if (!item) throw new Error("EquipeUsuario não encontrado");

    await item.destroy();
    return true;
  }
};

export default equipeUsuarioService;

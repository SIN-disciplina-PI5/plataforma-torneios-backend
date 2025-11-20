import AppError from '../utils/AppError';

const equipeUsuarioService = {
  getAll: async (models) => {
    const model = models.EquipeUsuario;
    console.log(`Fetching all items for model: ${model.name}`);
    try {
      const items = await model.findAll();
      console.log(`Found ${items.length} items for model: ${model.name}`);
      return items;
    } catch (error) {
      console.error(`Error fetching items for model: ${model.name}`, error);
      throw new AppError(`Erro ao buscar ${model.name.toLowerCase()}s`, 500);
    }
  },

  getById: async (models, id) => {
    const model = models.EquipeUsuario;
    console.log(`Fetching ${model.name} by id: ${id}`);
    try {
      const item = await model.findByPk(id);
      if (!item) {
        console.warn(`${model.name} com id ${id} não encontrado`);
        throw new AppError(`${model.name} não encontrado`, 404);
      }
      return item;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error(`Erro ao buscar ${model.name} por id: ${id}`, error);
      throw new AppError(`Erro ao buscar ${model.name}`, 500);
    }
  },

  create: async (models, data) => {
    const model = models.EquipeUsuario;
    console.log(`Creating new ${model.name} with data:`, data);
    try {
      const item = await model.create(data);
      console.log(`${model.name} criado com ID: ${item.id_equipe_usuario}`);
      return item;
    } catch (error) {
      console.error(`Erro ao criar ${model.name}`, error);
      throw new AppError(`Erro ao criar ${model.name}`, 500);
    }
  },

  update: async (models, id, data) => {
    const model = models.EquipeUsuario;
    console.log(`Updating ${model.name} id=${id} with data:`, data);
    try {
      const item = await model.findByPk(id);
      if (!item) {
        console.warn(`${model.name} com id ${id} não encontrado para update`);
        throw new AppError(`${model.name} não encontrado`, 404);
      }
      await item.update(data);
      console.log(`${model.name} id=${id} atualizado`);
      return item;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error(`Erro ao atualizar ${model.name} id=${id}`, error);
      throw new AppError(`Erro ao atualizar ${model.name}`, 500);
    }
  },

  delete: async (models, id) => {
    const model = models.EquipeUsuario;
    console.log(`Deleting ${model.name} id=${id}`);
    try {
      const item = await model.findByPk(id);
      if (!item) {
        console.warn(`${model.name} com id ${id} não encontrado para delete`);
        throw new AppError(`${model.name} não encontrado`, 404);
      }
      await item.destroy();
      console.log(`${model.name} id=${id} removido`);
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error(`Erro ao remover ${model.name} id=${id}`, error);
      throw new AppError(`Erro ao remover ${model.name}`, 500);
    }
  }
};

export default equipeUsuarioService;

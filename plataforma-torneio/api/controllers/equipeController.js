import equipeService from "../services/equipeService.js";

const equipeController = {
  createEquipe: async (req, res) => {
    try {
      const equipe = await equipeService.create(req.body);
      return res.status(201).json({
        status: "Equipe criada com sucesso!",
        data: equipe,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getAllEquipes: async (req, res) => {
    try {
      const equipes = await equipeService.getAll();
      return res.status(200).json({
        status: "success",
        results: equipes.length,
        data: equipes,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  getEquipeById: async (req, res) => {
    try {
      const equipe = await equipeService.getById(req.params.id);
      return res.status(200).json({
        status: "success",
        data: equipe,
      });
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  },

  updateEquipe: async (req, res) => {
    try {
      const equipe = await equipeService.update(req.params.id, req.body);
      return res.status(200).json({
        status: "Equipe atualizada com sucesso!",
        data: equipe,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  deleteEquipe: async (req, res) => {
    try {
      await equipeService.delete(req.params.id);
      return res.status(204).json({
        status: "Equipe deletada com sucesso!",
        data: null,
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
};

export default equipeController;

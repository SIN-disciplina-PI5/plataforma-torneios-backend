import {
  createEquipeService,
  getAllEquipesService,
  getEquipeByIdService,
  updateEquipeService,
  deleteEquipeService,
} from "../services/equipeService.js";

export const createEquipe = async (req, res) => {
  try {
    const equipe = await createEquipeService(req.body);
    return res.status(201).json({
      message: "Equipe criada com sucesso!",
      data: equipe,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllEquipes = async (req, res) => {
  try {
    const equipes = await getAllEquipesService();
    return res.status(200).json({
      results: equipes.length,
      data: equipes,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getEquipeById = async (req, res) => {
  try {
    const equipe = await getEquipeByIdService(req.params.id);
    return res.status(200).json({ data: equipe });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

export const updateEquipe = async (req, res) => {
  try {
    const equipe = await updateEquipeService(req.params.id, req.body);
    return res.status(200).json({
      message: "Equipe atualizada com sucesso!",
      data: equipe,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deleteEquipe = async (req, res) => {
  try {
    await deleteEquipeService(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
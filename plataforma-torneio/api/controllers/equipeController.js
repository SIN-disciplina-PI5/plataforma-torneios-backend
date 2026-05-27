import {
  createEquipeService,
  getAllEquipesService,
  getEquipeByIdService,
  updateEquipeService,
  deleteEquipeService,
  entrarNaEquipeService,
  sairDaEquipeService,
  adminAddMembroService,
  adminRemoveMembroService,
} from "../services/equipeService.js";

export const createEquipe = async (req, res) => {
  try {
    const { id_torneio } = req.params;
    const { nome } = req.body;
    const id_usuario =
      req.user.role === "ADMIN" && req.body.id_usuario
        ? req.body.id_usuario
        : req.user.id;

    const equipe = await createEquipeService(id_torneio, id_usuario, nome);
    res.status(201).json(equipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const entrarNaEquipe = async (req, res) => {
  try {
    const { id_torneio } = req.params;
    const { id_equipe } = req.body;
    const result = await entrarNaEquipeService(id_torneio, req.user.id, id_equipe);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const sairDaEquipe = async (req, res) => {
  try {
    const { id_torneio } = req.params;
    const result = await sairDaEquipeService(id_torneio, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllEquipes = async (req, res) => {
  try {
    const { id_torneio } = req.query;
    const equipes = await getAllEquipesService(id_torneio);
    res.status(200).json(equipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEquipeById = async (req, res) => {
  try {
    const equipe = await getEquipeByIdService(req.params.id);
    res.status(200).json(equipe);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateEquipe = async (req, res) => {
  try {
    const equipe = await updateEquipeService(req.params.id, req.body);
    res.status(200).json(equipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEquipe = async (req, res) => {
  try {
    await deleteEquipeService(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const adminAddMembro = async (req, res) => {
  try {
    const { id_equipe } = req.params;
    const { id_usuario } = req.body;
    const result = await adminAddMembroService(id_equipe, id_usuario);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const adminRemoveMembro = async (req, res) => {
  try {
    const { id_equipe, id_usuario } = req.params;
    const result = await adminRemoveMembroService(id_equipe, id_usuario);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

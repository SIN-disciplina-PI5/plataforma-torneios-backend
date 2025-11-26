import equipeUsuarioService from '../services/equipeUsuarioService.js';

const equipeUsuarioController = {
  async getAllEquipeUsuarios(req, res, next) {
    try {
      const equipeUsuario = await equipeUsuarioService.getAll();

      res.status(200).json({
        status: 'success',
        results: equipeUsuario.length,
        data: { equipeUsuario },
      });
    } catch (err) {
      next(err);
    }
  },

  async getEquipeUsuarioById(req, res, next) {
    try {
      const equipeUsuario = await equipeUsuarioService.getById(req.params.equipeUsuarioId);

      res.status(200).json({
        status: 'success',
        data: { equipeUsuario },
      });
    } catch (err) {
      next(err);
    }
  },

  async createEquipeUsuario(req, res, next) {
    try {
      const equipeUsuario = await equipeUsuarioService.create({
        id_equipe: req.body.id_equipe,
        id_usuario: req.body.id_usuario,
      });

      res.status(201).json({
        status: 'success',
        data: { equipeUsuario },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateEquipeUsuario(req, res, next) {
    try {
      const equipeUsuario = await equipeUsuarioService.update(req.params.id, {
        id_equipe: req.body.id_equipe,
        id_usuario: req.body.id_usuario,
      });

      res.status(200).json({
        status: 'success',
        data: { equipeUsuario },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteEquipeUsuario(req, res, next) {
    try {
      await equipeUsuarioService.delete(req.params.id);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default equipeUsuarioController;

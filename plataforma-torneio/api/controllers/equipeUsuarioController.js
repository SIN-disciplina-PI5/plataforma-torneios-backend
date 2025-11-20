import catchAsync from '../utils/catchAsync';
import equipeUsuarioService from '../services/equipeUsuarioService';

const equipeUsuarioController = {
  getAllEquipeUsuarios: catchAsync(async (req, res, next) => {
    const equipeUsuario = await equipeUsuarioService.getAll();
    res.status(200).json({
      status: 'success',
      results: equipeUsuario.length,
      data: {
        equipeUsuario,
      },
    });
  }),

  getEquipeUsuarioById: catchAsync(async (req, res, next) => {
    const equipeUsuario = await equipeUsuarioService.getById(req.params.equipeUsuarioId);
    res.status(200).json({
      status: 'success',
      data: {
        equipeUsuario,
      },
    });
  }),

  createEquipeUsuario: catchAsync(async (req, res, next) => {
    const equipeUsuario = await equipeUsuarioService.create({
      id_equipe: req.body.id_equipe,
      id_usuario: req.body.id_usuario,
    });
    res.status(201).json({
      status: 'success',
      data: {
        equipeUsuario,
      },
    });
  }),

  updateEquipeUsuario: catchAsync(async (req, res, next) => {
    const equipeUsuario = await equipeUsuarioService.update(req.params.id, {
     id_equipe: req.body.id_equipe,
      id_usuario: req.body.id_usuario,
    });
    res.status(200).json({
      status: 'success',
      data: {
        equipeUsuario,
      },
    });
  }),
  deleteEquipeUsuario: catchAsync(async (req, res, next) => {
    await equipeUsuarioService.delete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),
};

export default equipeUsuarioController;


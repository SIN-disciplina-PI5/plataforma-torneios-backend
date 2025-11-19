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
      text: req.body.text,
      userId: req.context.me.id,
    });
    res.status(201).json({
      status: 'success',
      data: {
        equipeUsuario,
      },
    });
  }),

  updateEquipeUsuario: catchAsync(async (req, res, next) => {
    const equipeUsuario = await equipeUsuarioService.update(req.params.equipeUsuarioId, req.body);
    res.status(200).json({
      status: 'success',
      data: {
        equipeUsuario,
      },
    });
  }),

  deleteEquipeUsuario: catchAsync(async (req, res, next) => {
    await equipeUsuarioService.delete(req.params.equipeUsuarioId);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),
};

export default equipeUsuarioController;

// necessário revisão do código acima
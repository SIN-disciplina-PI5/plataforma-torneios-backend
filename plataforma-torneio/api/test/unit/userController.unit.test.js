import { jest } from '@jest/globals';
import * as userService from '../../services/userService.js';
import {
  criarUsuario,
  getAllUsuarios,
  getUsuarioById,
  editarPerfil,
  deletarPerfil,
} from '../../controllers/userController.js';

describe('UserController - Unit Tests (com Mocks)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      user: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('criarUsuario', () => {
    test('deve criar usuário e retornar 201', async () => {
      mockReq.body = {
        nome: 'Novo User',
        email: 'novo@test.com',
        senha: '123456',
      };

      const resultadoMockado = {
        novoUsuario: {
          id_usuario: 'uuid-123',
          nome: 'Novo User',
          email: 'novo@test.com',
        },
        token: 'token_mockado',
      };

      jest.spyOn(userService, 'criarUsuarioService').mockResolvedValue(resultadoMockado);

      await criarUsuario(mockReq, mockRes);

      expect(userService.criarUsuarioService).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Usuário criado',
        data: resultadoMockado,
      });
    });

    test('deve retornar 400 em caso de erro', async () => {
      mockReq.body = { nome: 'User' };
      
      jest.spyOn(userService, 'criarUsuarioService').mockRejectedValue(
        new Error('Dados faltando')
      );

      await criarUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Dados faltando' });
    });
  });

  describe('getAllUsuarios', () => {
    test('deve retornar lista de usuários com status 200', async () => {
      const usuariosMockados = [
        { id_usuario: '1', nome: 'User 1' },
        { id_usuario: '2', nome: 'User 2' },
      ];

      jest.spyOn(userService, 'getAllUsuariosService').mockResolvedValue(usuariosMockados);

      await getAllUsuarios(mockReq, mockRes);

      expect(userService.getAllUsuariosService).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: usuariosMockados });
    });

    test('deve retornar 500 em caso de erro', async () => {
      jest.spyOn(userService, 'getAllUsuariosService').mockRejectedValue(
        new Error('Erro no banco')
      );

      await getAllUsuarios(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro no banco' });
    });
  });

  describe('getUsuarioById', () => {
    test('deve retornar usuário por ID com status 200', async () => {
      mockReq.params = { id_usuario: 'uuid-123' };
      
      const usuarioMockado = {
        id_usuario: 'uuid-123',
        nome: 'User Test',
        email: 'test@email.com',
      };

      jest.spyOn(userService, 'getUsuarioByIdService').mockResolvedValue(usuarioMockado);

      await getUsuarioById(mockReq, mockRes);

      expect(userService.getUsuarioByIdService).toHaveBeenCalledWith('uuid-123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: usuarioMockado });
    });

    test('deve retornar 404 se usuário não existe', async () => {
      mockReq.params = { id_usuario: 'inexistente' };
      
      jest.spyOn(userService, 'getUsuarioByIdService').mockRejectedValue(
        new Error('Usuário não encontrado')
      );

      await getUsuarioById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado',
      });
    });
  });

  describe('editarPerfil', () => {
    test('deve atualizar perfil e retornar 200', async () => {
      mockReq.params = { id_usuario: 'uuid-123' };
      mockReq.body = { nome: 'Nome Atualizado' };

      const usuarioAtualizado = {
        id_usuario: 'uuid-123',
        nome: 'Nome Atualizado',
        email: 'test@email.com',
      };

      jest.spyOn(userService, 'editarUsuarioService').mockResolvedValue(usuarioAtualizado);

      await editarPerfil(mockReq, mockRes);

      expect(userService.editarUsuarioService).toHaveBeenCalledWith(
        'uuid-123',
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(usuarioAtualizado);
    });

    test('deve retornar 400 em caso de erro', async () => {
      mockReq.params = { id_usuario: 'uuid-123' };
      mockReq.body = { email: 'email_invalido' };

      jest.spyOn(userService, 'editarUsuarioService').mockRejectedValue(
        new Error('Email inválido')
      );

      await editarPerfil(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email inválido' });
    });
  });

  describe('deletarPerfil', () => {
    test('deve deletar usuário e retornar 204', async () => {
      mockReq.params = { id_usuario: 'uuid-123' };

      jest.spyOn(userService, 'deletarUsuarioService').mockResolvedValue(true);

      await deletarPerfil(mockReq, mockRes);

      expect(userService.deletarUsuarioService).toHaveBeenCalledWith('uuid-123');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });

    test('deve retornar 400 se erro ao deletar', async () => {
      mockReq.params = { id_usuario: 'uuid-123' };

      jest.spyOn(userService, 'deletarUsuarioService').mockRejectedValue(
        new Error('Não é possível deletar')
      );

      await deletarPerfil(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Não é possível deletar',
      });
    });
  });
});

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import models from '../../models/index.js';
import * as userService from '../../services/userService.js';

describe('UserService - Unit Tests (com Mocks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    models.Usuario.findOne = jest.fn();
    models.Usuario.findAll = jest.fn();
    models.Usuario.create = jest.fn();
    models.Usuario.findByPk = jest.fn();
  });

  describe('criarUsuarioService', () => {
    test('deve criar um novo usuário com sucesso', async () => {
      const dadosUsuario = {
        nome: 'Teste User',
        email: 'teste@email.com',
        senha: '123456',
        role: 'USER',
      };

      const usuarioMockado = {
        id_usuario: 'uuid-123',
        nome: 'Teste User',
        email: 'teste@email.com',
        role: 'USER',
        dataValues: {
          id_usuario: 'uuid-123',
          nome: 'Teste User',
          email: 'teste@email.com',
          role: 'USER',
        },
      };

      models.Usuario.findOne.mockResolvedValue(null); // Email não existe
      models.Usuario.create.mockResolvedValue({
        ...usuarioMockado,
        toJSON: () => usuarioMockado,
      });
      jest.spyOn(jwt, 'sign').mockReturnValue('token_mockado_123');

      // Executa o service
      const resultado = await userService.criarUsuarioService(dadosUsuario);

      // Verificações
      expect(models.Usuario.findOne).toHaveBeenCalledWith({
        where: { email: 'teste@email.com' },
      });
      expect(models.Usuario.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(resultado.novoUsuario).toEqual(
        expect.objectContaining({
          id_usuario: 'uuid-123',
          nome: 'Teste User',
          email: 'teste@email.com',
          role: 'USER',
        })
      );
      expect(resultado.token).toBe('token_mockado_123');
    });

    test('deve lançar erro se email já existe', async () => {
      const dadosUsuario = {
        nome: 'Teste User',
        email: 'existe@email.com',
        senha: '123456',
      };

      models.Usuario.findOne.mockResolvedValue({ email: 'existe@email.com' });

      // Verifica se lança erro
      await expect(userService.criarUsuarioService(dadosUsuario)).rejects.toThrow(
        'Email já cadastrado'
      );

      expect(models.Usuario.findOne).toHaveBeenCalledTimes(1);
      expect(models.Usuario.create).not.toHaveBeenCalled();
    });

    test('deve lançar erro se dados estão incompletos', async () => {
      const dadosIncompletos = {
        nome: 'Teste',
        // falta email e senha
      };

      await expect(userService.criarUsuarioService(dadosIncompletos)).rejects.toThrow(
        'Dados faltando'
      );
    });
  });

  describe('getAllUsuariosService', () => {
    test('deve retornar lista de usuários', async () => {
      const usuariosMockados = [
        { id_usuario: '1', nome: 'User 1', email: 'user1@test.com' },
        { id_usuario: '2', nome: 'User 2', email: 'user2@test.com' },
      ];

      models.Usuario.findAll.mockResolvedValue(usuariosMockados);

      const resultado = await userService.getAllUsuariosService();

      expect(models.Usuario.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(usuariosMockados);
      expect(resultado).toHaveLength(2);
    });

    test('deve retornar array vazio se não há usuários', async () => {
      models.Usuario.findAll.mockResolvedValue([]);

      const resultado = await userService.getAllUsuariosService();

      expect(resultado).toEqual([]);
      expect(resultado).toHaveLength(0);
    });
  });

  describe('getUsuarioByIdService', () => {
    test('deve retornar usuário por ID', async () => {
      const usuarioMockado = {
        id_usuario: 'uuid-123',
        nome: 'Teste User',
        email: 'teste@email.com',
      };

      models.Usuario.findByPk.mockResolvedValue(usuarioMockado);

      const resultado = await userService.getUsuarioByIdService('uuid-123');

      expect(models.Usuario.findByPk).toHaveBeenCalledWith('uuid-123', {
        attributes: { exclude: ['senha'] },
      });
      expect(resultado).toEqual(usuarioMockado);
    });

    test('deve lançar erro se usuário não existe', async () => {
      models.Usuario.findByPk.mockResolvedValue(null);

      await expect(userService.getUsuarioByIdService('id-inexistente')).rejects.toThrow(
        'Usuário não encontrado'
      );
    });
  });
});

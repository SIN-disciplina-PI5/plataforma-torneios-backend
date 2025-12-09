import { jest } from '@jest/globals';
import models from '../../models/index.js';
import equipeService from '../../services/equipeService.js';

describe('EquipeService - Unit Tests (com Mocks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    models.Equipe.findAll = jest.fn();
    models.Equipe.findByPk = jest.fn();
    models.Equipe.create = jest.fn();
  });

  describe('getAllEquipesService', () => {
    test('deve retornar todas as equipes', async () => {
      const equipesMockadas = [
        { id_equipe: '1', nome: 'Equipe A' },
        { id_equipe: '2', nome: 'Equipe B' },
        { id_equipe: '3', nome: 'Equipe C' },
      ];

      models.Equipe.findAll.mockResolvedValue(equipesMockadas);

      const resultado = await equipeService.getAll();

      expect(models.Equipe.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(equipesMockadas);
      expect(resultado).toHaveLength(3);
    });

    test('deve retornar array vazio quando não há equipes', async () => {
      models.Equipe.findAll.mockResolvedValue([]);

      const resultado = await equipeService.getAll();

      expect(resultado).toEqual([]);
    });

    test('deve lançar erro se banco falhar', async () => {
      models.Equipe.findAll.mockRejectedValue(new Error('Erro no banco'));

      await expect(equipeService.getAll()).rejects.toThrow('Erro no banco');
    });
  });

  describe('getEquipeByIdService', () => {
    test('deve retornar equipe por ID', async () => {
      const equipeMockada = {
        id_equipe: 'uuid-123',
        nome: 'Equipe Teste',
      };

      models.Equipe.findByPk.mockResolvedValue(equipeMockada);

      const resultado = await equipeService.getById('uuid-123');

      expect(models.Equipe.findByPk).toHaveBeenCalledWith('uuid-123');
      expect(resultado).toEqual(equipeMockada);
    });

    test('deve lançar erro se equipe não existe', async () => {
      models.Equipe.findByPk.mockResolvedValue(null);

      await expect(equipeService.getById('id-inexistente')).rejects.toThrow(
        'Equipe não encontrada'
      );
    });
  });

  describe('createEquipeService', () => {
    test('deve criar nova equipe com sucesso', async () => {
      const dadosEquipe = {
        nome: 'Nova Equipe',
      };

      const equipeCriada = {
        id_equipe: 'uuid-novo',
        nome: 'Nova Equipe',
        createdAt: new Date(),
      };

      models.Equipe.create.mockResolvedValue(equipeCriada);

      const resultado = await equipeService.create(dadosEquipe);

      expect(models.Equipe.create).toHaveBeenCalledWith(dadosEquipe);
      expect(resultado).toEqual(equipeCriada);
    });

    test('deve lançar erro se nome não foi fornecido', async () => {
      models.Equipe.create.mockRejectedValue(new Error('Erro ao criar equipe: nome obrigatório'));

      await expect(equipeService.create({})).rejects.toThrow('Erro ao criar equipe: nome obrigatório');
    });

    test('deve propagar erro do banco', async () => {
      models.Equipe.create.mockRejectedValue(new Error('Constraint violation'));

      await expect(
        equipeService.create({ nome: 'Equipe' })
      ).rejects.toThrow('Constraint violation');
    });
  });

  describe('updateEquipeService', () => {
    test('deve atualizar equipe existente', async () => {
      const equipeMockada = {
        id_equipe: 'uuid-123',
        nome: 'Equipe Antiga',
        update: jest.fn().mockResolvedValue({
          id_equipe: 'uuid-123',
          nome: 'Equipe Atualizada',
        }),
      };

      models.Equipe.findByPk.mockResolvedValue(equipeMockada);

      const resultado = await equipeService.update('uuid-123', {
        nome: 'Equipe Atualizada',
      });

      expect(models.Equipe.findByPk).toHaveBeenCalledWith('uuid-123');
      expect(equipeMockada.update).toHaveBeenCalledWith({
        nome: 'Equipe Atualizada',
      });
    });

    test('deve lançar erro se equipe não existe', async () => {
      models.Equipe.findByPk.mockResolvedValue(null);

      await expect(
        equipeService.update('id-inexistente', { nome: 'Novo Nome' })
      ).rejects.toThrow('Equipe não encontrada para atualização');
    });
  });

  describe('deleteEquipeService', () => {
    test('deve deletar equipe existente', async () => {
      const equipeMockada = {
        id_equipe: 'uuid-123',
        destroy: jest.fn().mockResolvedValue(true),
      };

      models.Equipe.findByPk.mockResolvedValue(equipeMockada);

      await equipeService.delete('uuid-123');

      expect(models.Equipe.findByPk).toHaveBeenCalledWith('uuid-123');
      expect(equipeMockada.destroy).toHaveBeenCalledTimes(1);
    });

    test('deve lançar erro se equipe não existe', async () => {
      models.Equipe.findByPk.mockResolvedValue(null);

      await expect(equipeService.delete('id-inexistente')).rejects.toThrow(
        'Equipe não encontrada para exclusão'
      );
    });
  });
});

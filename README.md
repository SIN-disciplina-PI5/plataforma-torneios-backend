# Plataforma Torneios Backend

## Visão Geral
O backend da Plataforma Torneios é uma API REST construída em Node.js e Express para gerenciar torneios, equipes, inscrições, partidas, rankings e notificações. O projeto foi desenvolvido para a disciplina PI5 do curso de Sistemas para Internet da UNICAP.

A API é organizada em camadas de rotas, controladores e serviços, com autenticação JWT, autorização baseada em perfis de administrador e validações para as principais regras de negócio.

## Estrutura do Projeto
- `api/index.js`: inicialização do servidor, configuração de express e sincronização do banco.
- `api/routes/`: definição de rotas da API.
- `api/controllers/`: lógica de requisição e resposta.
- `api/services/`: regras de negócio e operações sobre modelos.
- `api/models/`: definição de entidades e relacionamentos com Sequelize.
- `api/middlewares/`: autenticação, autorização e proteção contra excesso de requisições.
- `api/utils/`: tratamento de erros, validações e serviços auxiliares.

## Tecnologias Utilizadas
- JavaScript (ES Modules)
- Node.js
- Express
- Sequelize
- PostgreSQL
- JSON Web Tokens (JWT)
- Bcrypt
- Nodemon
- dotenv
- cors
- express-rate-limit

## Regras de Negócio Principais
1. Autenticação e Autorização
   - Usuários se autenticam via login e recebem token JWT.
   - Rotas sensíveis exigem `authenticateToken`.
   - Algumas rotas são restritas a administradores (`checkAdmin`).

2. Gestão de torneios
   - Apenas administradores podem criar, editar, excluir, gerar chave de torneio, avançar fases e atualizar status.
   - Torneios têm status e fase atual.
   - A criação e atualização de torneios valida campos essenciais e a integridade dos dados.

3. Inscrições e equipes
   - Usuários autenticados podem se inscrever em torneios.
   - As equipes pertencem a torneios e podem ser criadas por usuários.
   - A associação entre usuários e equipes é controlada por rotas específicas.
   - Administradores podem adicionar ou remover membros de equipes.

4. Partidas
   - Partidas são criadas no contexto de um torneio e vinculadas a equipes.
   - Status válidos de partida: `PENDENTE`, `EM_ANDAMENTO`, `FINALIZADA`.
   - Partidas não podem ser criadas diretamente como `FINALIZADA`.
   - Partidas finalizadas não podem ser excluídas.
   - Rotas de agendar, iniciar e finalizar partida são exclusivas de administradores.

5. Ranking
   - Há endpoints para ranking geral, ranking por usuário e ranking por posição.
   - Atualização de pontuação e recalculo de ranking são operações reservadas a administradores.
   - O ranking de um usuário pode ser resetado por administrador.

6. Segurança e integridade
   - Rate limiting aplicado em rotas de autenticação e algumas operações sensíveis.
   - Controle de sessão por tokens JWT e blacklist de tokens.
   - Uso de SSL no banco PostgreSQL fora de ambiente de teste.

## Rotas Principais
As rotas são expostas sob `/api`.

### Autenticação e Usuários
- `POST /api/users/login` - autenticação.
- `POST /api/users/signup` - cadastro de usuário.
- `POST /api/users/logout` - logout.
- `GET /api/users/:id_usuario` - obter dados do usuário.
- `PATCH /api/users/edit/:id_usuario` - atualizar usuário.
- `DELETE /api/users/delete/:id_usuario` - remover usuário.
- `GET /api/users` - listar usuários (admin).

### Torneios
- `POST /api/torneio` - criar torneio (admin).
- `GET /api/torneio` - listar torneios.
- `GET /api/torneio/:id_torneio` - obter torneio por ID.
- `PATCH /api/torneio/:id_torneio` - atualizar torneio (admin).
- `DELETE /api/torneio/:id_torneio` - excluir torneio (admin).
- `POST /api/torneio/:id_torneio/gerar-chave` - gerar chave de torneio (admin).
- `POST /api/torneio/:id_torneio/avancar-fase` - avançar fase do torneio (admin).
- `PATCH /api/torneio/:id_torneio/status` - atualizar status (admin).

### Inscrições
- `POST /api/inscricoes` - criar inscrição.
- `GET /api/inscricoes` - listar todas inscrições (admin).
- `GET /api/inscricoes/torneio/:id_torneio` - listar inscrições por torneio.
- `GET /api/inscricoes/:id_inscricao` - detalhes de inscrição.
- `PATCH /api/inscricoes/:id_inscricao` - atualizar inscrição (admin).
- `DELETE /api/inscricoes/:id_inscricao` - excluir inscrição.

### Equipes
- `GET /api/equipe` - listar equipes.
- `GET /api/equipe/:id` - obter equipe.
- `POST /api/equipe/:id_torneio` - criar equipe para torneio.
- `PUT /api/equipe/:id` - atualizar equipe (admin).
- `DELETE /api/equipe/:id` - excluir equipe (admin).
- `POST /api/equipe/entrar/:id_torneio` - entrar em equipe.
- `POST /api/equipe/sair/:id_torneio` - sair de equipe.
- `POST /api/equipe/admin/:id_equipe/membros` - adicionar membro à equipe (admin).
- `DELETE /api/equipe/admin/:id_equipe/membros/:id_usuario` - remover membro (admin).

### Partidas
- `POST /api/partidas` - criar partida (admin).
- `GET /api/partidas` - listar partidas.
- `GET /api/partidas/:id_partida` - obter partida.
- `PATCH /api/partidas/:id_partida` - atualizar partida (admin).
- `DELETE /api/partidas/:id_partida` - excluir partida (admin).
- `PATCH /api/partidas/agendar/:id_partida` - agendar partida (admin).
- `PATCH /api/partidas/iniciar/:id_partida` - iniciar partida (admin).
- `PATCH /api/partidas/finalizar/:id_partida` - finalizar partida (admin).

### Ranking
- `GET /api/ranking/geral` - ranking geral.
- `GET /api/ranking/usuario/:id_usuario` - ranking de usuário.
- `GET /api/ranking/posicao/:posicao` - buscar ranking por posição.
- `POST /api/ranking/atualizar` - atualizar pontuação (admin).
- `POST /api/ranking/recalcular` - recalcular ranking (admin).
- `DELETE /api/ranking/resetar/:id_usuario` - resetar ranking do usuário (admin).

## Configuração e Execução
1. Copiar arquivo de ambiente e definir variáveis necessárias.
   - `POSTGRES_URL`
   - `PORT` (opcional, padrão `4000`)
   - `POSTGRES_SSL` (opcional, `true` para forçar SSL)

2. Instalar dependências
   - `npm install`

3. Executar em desenvolvimento
   - `npm start`

## Observações
- O banco de dados é sincronizado automaticamente em tempo de execução.
- A aplicação habilita SSL no banco PostgreSQL quando `POSTGRES_SSL=true` ou quando a URL já contém `sslmode=require`.
- O caminho base da API é `/api`.

## Equipe
- Mel Lopes Ferreira – 853748
- Kaiki Barros Bezerra – 853752
- Gabriel Willian da Cunha Santos – 853757
- Pedro Delmiro Galvão de Lucena – 853744
- Beatriz Martins Vieira Belo – 853791
- Wesley Oliveira Amorim Filho – 853788
- Daniel Levi Santos Leite – 854027


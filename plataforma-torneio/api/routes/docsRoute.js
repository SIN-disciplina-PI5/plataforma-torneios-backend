import { Router } from "express";

const router = Router();

const bearer = [{ bearerAuth: [] }];

const ok = { description: "Sucesso" };
const created = { description: "Criado com sucesso" };
const noContent = { description: "Sem conteúdo" };
const error = { description: "Erro" };
const body = {
  required: true,
  content: {
    "application/json": {
      schema: { type: "object" },
    },
  },
};

const id = (name) => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});

const route = (tag, summary, security = bearer, requestBody = null, responses = { 200: ok, 400: error }) => {
  const doc = { tags: [tag], summary, responses };
  if (security) doc.security = security;
  if (requestBody) doc.requestBody = requestBody;
  return doc;
};

const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "API Plataforma de Torneio",
    version: "1.0.0",
    description: "Swagger simples com as rotas principais da API.",
  },
  servers: [{ url: "http://localhost:4000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/users/login": {
      post: route("Usuários", "Realiza login e retorna JWT", null, body, { 200: ok, 401: error }),
    },
    "/api/users/logout": {
      post: route("Usuários", "Realiza logout e adiciona o token à blacklist"),
    },
    "/api/users/signup": {
      post: route("Usuários", "Cria um usuário comum", null, body, { 201: created, 400: error }),
    },
    "/api/users": {
      get: route("Usuários", "Lista todos os usuários. Requer admin."),
    },
    "/api/users/{id_usuario}": {
      get: { ...route("Usuários", "Busca usuário por ID"), parameters: [id("id_usuario")] },
    },
    "/api/users/edit/{id_usuario}": {
      patch: { ...route("Usuários", "Atualiza usuário por ID", bearer, body), parameters: [id("id_usuario")] },
    },
    "/api/users/delete/{id_usuario}": {
      delete: { ...route("Usuários", "Remove usuário por ID", bearer, null, { 204: noContent, 400: error }), parameters: [id("id_usuario")] },
    },
    "/api/torneio": {
      get: route("Torneios", "Lista torneios"),
      post: route("Torneios", "Cria torneio. Requer admin.", bearer, body, { 201: created, 400: error }),
    },
    "/api/torneio/{id_torneio}": {
      get: { ...route("Torneios", "Busca torneio por ID"), parameters: [id("id_torneio")] },
      patch: { ...route("Torneios", "Atualiza torneio. Requer admin.", bearer, body), parameters: [id("id_torneio")] },
      delete: { ...route("Torneios", "Remove torneio. Requer admin.", bearer, null, { 204: noContent, 400: error }), parameters: [id("id_torneio")] },
    },
    "/api/torneio/{id_torneio}/gerar-chave": {
      post: { ...route("Torneios", "Gera a chave do torneio. Requer admin."), parameters: [id("id_torneio")] },
    },
    "/api/torneio/{id_torneio}/avancar-fase": {
      post: { ...route("Torneios", "Avança a fase do torneio. Requer admin.", bearer, body), parameters: [id("id_torneio")] },
    },
    "/api/torneio/{id_torneio}/status": {
      patch: { ...route("Torneios", "Atualiza status do torneio. Requer admin.", bearer, body), parameters: [id("id_torneio")] },
    },
    "/api/inscricoes": {
      get: route("Inscrições", "Lista inscrições. Requer admin."),
      post: route("Inscrições", "Cria inscrição no torneio", bearer, body, { 201: created, 400: error }),
    },
    "/api/inscricoes/torneio/{id_torneio}": {
      get: { ...route("Inscrições", "Lista inscrições de um torneio"), parameters: [id("id_torneio")] },
    },
    "/api/inscricoes/{id_inscricao}": {
      get: { ...route("Inscrições", "Busca inscrição por ID"), parameters: [id("id_inscricao")] },
      patch: { ...route("Inscrições", "Atualiza inscrição. Requer admin.", bearer, body), parameters: [id("id_inscricao")] },
      delete: { ...route("Inscrições", "Remove inscrição"), parameters: [id("id_inscricao")] },
    },
    "/api/equipe": {
      get: route("Equipes", "Lista equipes"),
    },
    "/api/equipe/{id}": {
      get: { ...route("Equipes", "Busca equipe por ID"), parameters: [id("id")] },
      post: { ...route("Equipes", "Cria equipe no torneio informado pelo parâmetro", bearer, body, { 201: created, 400: error }), parameters: [id("id")] },
      put: { ...route("Equipes", "Atualiza equipe. Requer admin.", bearer, body), parameters: [id("id")] },
      delete: { ...route("Equipes", "Remove equipe. Requer admin.", bearer, null, { 204: noContent, 400: error }), parameters: [id("id")] },
    },
    "/api/equipe/entrar/{id_torneio}": {
      post: { ...route("Equipes", "Usuário autenticado entra em equipe", bearer, body), parameters: [id("id_torneio")] },
    },
    "/api/equipe/sair/{id_torneio}": {
      post: { ...route("Equipes", "Usuário autenticado sai da equipe"), parameters: [id("id_torneio")] },
    },
    "/api/equipe/admin/{id_equipe}/membros": {
      post: { ...route("Equipes", "Admin adiciona membro à equipe", bearer, body), parameters: [id("id_equipe")] },
    },
    "/api/equipe/admin/{id_equipe}/membros/{id_usuario}": {
      delete: { ...route("Equipes", "Admin remove membro da equipe"), parameters: [id("id_equipe"), id("id_usuario")] },
    },
    "/api/ranking/geral": {
      get: route("Ranking", "Lista ranking geral"),
    },
    "/api/ranking/usuario/{id_usuario}": {
      get: { ...route("Ranking", "Busca ranking de um usuário"), parameters: [id("id_usuario")] },
    },
    "/api/ranking/posicao/{posicao}": {
      get: { ...route("Ranking", "Busca ranking por posição"), parameters: [id("posicao")] },
    },
    "/api/ranking/atualizar": {
      post: route("Ranking", "Atualiza pontuação por evento. Requer admin.", bearer, body),
    },
    "/api/ranking/recalcular": {
      post: route("Ranking", "Recalcula ranking. Requer admin."),
    },
    "/api/ranking/resetar/{id_usuario}": {
      delete: { ...route("Ranking", "Reseta ranking de usuário. Requer admin."), parameters: [id("id_usuario")] },
    },
    "/api/partidas": {
      get: route("Partidas", "Lista partidas"),
      post: route("Partidas", "Cria partida com duas equipes. Requer admin.", bearer, body, { 201: created, 400: error }),
    },
    "/api/partidas/{id_partida}": {
      get: { ...route("Partidas", "Busca partida por ID"), parameters: [id("id_partida")] },
      patch: { ...route("Partidas", "Atualiza partida. Requer admin.", bearer, body), parameters: [id("id_partida")] },
      delete: { ...route("Partidas", "Remove partida. Requer admin.", bearer, null, { 204: noContent, 400: error }), parameters: [id("id_partida")] },
    },
    "/api/partidas/agendar/{id_partida}": {
      patch: { ...route("Partidas", "Agenda partida. Requer admin.", bearer, body), parameters: [id("id_partida")] },
    },
    "/api/partidas/iniciar/{id_partida}": {
      patch: { ...route("Partidas", "Inicia partida. Requer admin."), parameters: [id("id_partida")] },
    },
    "/api/partidas/finalizar/{id_partida}": {
      patch: { ...route("Partidas", "Finaliza partida. Requer vencedor participante.", bearer, body), parameters: [id("id_partida")] },
    },
    "/api/equipe-usuarios": {
      get: route("Vínculos", "Lista vínculos equipe-usuário. Requer admin."),
      post: route("Vínculos", "Cria vínculo equipe-usuário. Requer admin.", bearer, body, { 201: created, 400: error }),
    },
    "/api/equipe-usuarios/{id}": {
      get: { ...route("Vínculos", "Busca vínculo equipe-usuário. Requer admin."), parameters: [id("id")] },
      delete: { ...route("Vínculos", "Remove vínculo equipe-usuário. Requer admin.", bearer, null, { 204: noContent, 400: error }), parameters: [id("id")] },
    },
    "/api/partida-equipes": {
      get: route("Vínculos", "Lista vínculos partida-equipe"),
      post: route("Vínculos", "Cria vínculo partida-equipe. Requer admin.", bearer, body, { 201: created, 400: error }),
    },
    "/api/partida-equipes/{id_partida_equipe}": {
      get: { ...route("Vínculos", "Busca vínculo partida-equipe"), parameters: [id("id_partida_equipe")] },
      patch: { ...route("Vínculos", "Atualiza vínculo partida-equipe. Requer admin.", bearer, body), parameters: [id("id_partida_equipe")] },
      delete: { ...route("Vínculos", "Remove vínculo partida-equipe. Requer admin.", bearer, null, { 204: noContent, 400: error }), parameters: [id("id_partida_equipe")] },
    },
    "/api/password/forgot-password": {
      post: route("Senha", "Solicita código de redefinição de senha", null, body),
    },
    "/api/password/reset-password": {
      post: route("Senha", "Redefine senha usando código", null, body),
    },
    "/api/notifications": {
      get: route("Notificações", "Lista notificações do usuário autenticado"),
      post: route("Notificações", "Cria notificação. Requer admin.", bearer, body, { 201: created, 400: error }),
    },
    "/api/notifications/{id}/read": {
      patch: { ...route("Notificações", "Marca notificação como lida"), parameters: [id("id")] },
    },
  },
};

router.get("/openapi.json", (req, res) => {
  res.json(openApiDocument);
});

router.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Plataforma de Torneio</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api/docs/openapi.json",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>`);
});

export default router;

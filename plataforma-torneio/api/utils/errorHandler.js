/**
 * Mapeia mensagem de erro para status code HTTP apropriado
 * @param {string} errorMessage - Mensagem de erro
 * @returns {number} Status code HTTP
 */

export const getStatusCodeByError = (errorMessage = "") => {
  const message = String(errorMessage).toLowerCase();

  // 404 - Não encontrado
  if (message.includes("não encontrado") || message.includes("not found")) {
    return 404;
  }

  // 403 - Acesso negado
  if (message.includes("acesso negado") || message.includes("não autorizado")) {
    return 403;
  }

  // 409 - Conflito (duplicata, já existe, etc)
  if (
    message.includes("já existe") ||
    message.includes("duplicad") ||
    message.includes("conflito") ||
    message.includes("único") ||
    message.includes("unique constraint")
  ) {
    return 409;
  }

  // 401 - Credenciais inválidas
  if (
    message.includes("credenciais") ||
    message.includes("senha incorreta") ||
    message.includes("email ou senha") ||
    message.includes("token inválido") ||
    message.includes("token expirado")
  ) {
    return 401;
  }

  // 400 - Bad request (validação, dados inválidos, etc)
  return 400;
};

/**
 * Wrapper para tratamento consistente de erros em endpoints
 * @param {Error} error - Objeto de erro
 * @returns {object} { statusCode, message }
 */
export const handleError = (error) => {
  const statusCode = getStatusCodeByError(error.message);
  return {
    statusCode,
    message: error.message,
  };
};

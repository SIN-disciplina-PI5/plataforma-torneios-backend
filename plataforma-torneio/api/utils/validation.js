export const normalizarTextoObrigatorio = (valor, nomeCampo) => {
  if (typeof valor !== "string") {
    throw new Error(`${nomeCampo} é obrigatório`);
  }

  const texto = valor.trim();
  if (!texto) {
    throw new Error(`${nomeCampo} não pode ser vazio`);
  }

  return texto;
};

export const normalizarTextoOpcional = (valor, nomeCampo) => {
  if (valor === undefined) return undefined;
  return normalizarTextoObrigatorio(valor, nomeCampo);
};

import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  standardHeaders: true,   // Inclui os cabeçalhos padrão (RateLimit-Limit, RateLimit-Remaining, etc.)
  legacyHeaders: false,  // Desabilita os cabeçalhos obsoletos (X-RateLimit-*)
  message: {
    status: 429,
    message: "Muitas tentativas. Tente novamente em 1 minuto.",
  },
});
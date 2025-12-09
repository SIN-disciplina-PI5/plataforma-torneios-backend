import rateLimit from "express-rate-limit";

const shouldApplyRateLimit = process.env.NODE_ENV !== "test";

export const rateLimiter = shouldApplyRateLimit
  ? rateLimit({
      windowMs: 60 * 1000, 
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        message: "Muitas tentativas. Tente novamente em 1 minuto.",
      },
    })
  : (req, res, next) => next();
import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // under 15 minutes 10 request is allowerd
  standardHeaders: true, //how many request is allowed will be shown in response headers
  legacyHeaders: false, //old X-rateLimit headers not used again
  message: {
    status: "fail",
    message: "Too many requests.Please try again later",
  }, // if after 10 request under 15 minutes was not correct it will write this
});

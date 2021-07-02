import { Request, Response } from "express";
import { audience } from "../token/token";
const pem2jwk = require("pem-jwk").pem2jwk;

const publicSigningKey = process.env.DI_IPV_SIGN_CERT;

const getJwks = (req: Request, res: Response): void => {
  const jwk = pem2jwk(publicSigningKey);
  res.json({
    keys: [
      {
        ...jwk,
        kid: audience,
        use: "sig",
      },
    ],
  });
};

export { getJwks };

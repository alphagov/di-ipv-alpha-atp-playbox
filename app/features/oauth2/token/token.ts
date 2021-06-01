import * as fs from "fs";
import hashSessionId from "../../../utils/hashSessionId";

const jwt = require("jsonwebtoken");
const privateSigningKey = fs.readFileSync(
  "./keys/private-di-ipv-atp-playbox.pem"
);
const publicSigningKey = fs.readFileSync(
  "./keys/public-di-ipv-atp-playbox.pem"
);

export const audience = "urn:di:ipv:orchestrator-stub";
export const issuer = "urn:di:ipv:ipv-atp-playbox";

export const createJwtToken = (subject: string): string => {
  return jwt.sign(
    {
      data: hashSessionId((Math.random() * 100000000).toString()),
      typ: "ac+jwt",
    },
    privateSigningKey,
    {
      subject: subject,
      audience: audience,
      issuer: issuer,
      expiresIn: 60 * 60,
      algorithm: "RS256",
    }
  );
};

export const isTokenValid = (token: string): boolean => {
  try {
    jwt.verify(token, publicSigningKey, {
      algorithms: ["RS256"],
      audience: audience,
      issuer: issuer,
      clockTolerance: 0,
    });
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return false;
  }
};

export const getTokenFromRequest = (req: Express.Request): string | null => {
  if (
    !Object.prototype.hasOwnProperty.call(req, "headers") &&
    !Object.prototype.hasOwnProperty.call(req["headers"], "authorization")
  ) {
    return null;
  }

  let token = req["headers"]["authorization"];

  if (token.startsWith("Bearer ")) {
    token = token.substring(7);
  }

  return token;
};

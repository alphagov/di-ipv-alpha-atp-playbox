import { Request, Response } from "express";
import { pathName } from "../../paths";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { RedisClient } from "redis";
import { doCodeCallback } from "../oauth2/authorize";
import { postGPG45ProfileJSON } from "./api";
import { getValidations } from "../ipv";

export class Engine {
  start = (req: Request, res: Response): void => {
    req.session.userId = uuidv4();
    req.session.userData = {};
    req.session.validations = null;
    req.session.engine = {};
    req.session.gpg45Profile = null;
    res.redirect(pathName.public.HOME);
    return;
  };

  next = async (source: string, req: Request, res: any): Promise<void> => {
    switch (source) {
      case "info":
      case "passport":
      case "bank-account":
      case "json":
      case "drivingLicence": {
        const validations = getValidations(req);
        const data = {
          identityVerificationBundle: {
            identityEvidence: [],
          },
        };

        Object.keys(validations).forEach((key) => {
          if (validations[key] && validations[key].evidence) {
            data.identityVerificationBundle.identityEvidence.push({
              evidenceScore: { ...validations[key].evidence },
            });
          }
        });
        const gpg45Profile = await postGPG45ProfileJSON(data);
        req.session.gpg45Profile = gpg45Profile.matchedIdentityProfile
          ? gpg45Profile.matchedIdentityProfile.description
          : null;
        res.redirect(pathName.public.HOME);
        break;
      }
      default:
        res.redirect("/500");
    }
  };

  callback = async (req: Express.Request, res: any): Promise<void> => {
    const redisClient = getRedisClient();
    this.doCallback(req, res, redisClient);
  };

  generateUserDataAuthCode = (
    req: Express.Request,
    redisClient: RedisClient
  ): any => {
    const uuid = req.session.userId;
    const data = {
      ...req.session.userData,
      _profile: req.session.gpg45Profile,
    };
    redisClient.set("userid:" + uuid, JSON.stringify(data));

    const authCode = uuidv4();
    redisClient.set("authcode:" + authCode, uuid);

    return authCode;
  };

  doCallback = (
    req: Express.Request,
    res: any,
    redisClient: RedisClient
  ): void => {
    const authCode = this.generateUserDataAuthCode(req, redisClient);
    doCodeCallback(req, res, authCode);
  };
}

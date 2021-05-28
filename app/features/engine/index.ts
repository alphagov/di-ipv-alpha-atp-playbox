import { Request, Response } from "express";
import { pathName } from "../../paths";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { RedisClient } from "redis";
import { doCodeCallback } from "../oauth2/authorize";

export class Engine {
  start = (req: Request, res: Response): void => {
    req.session.userId = uuidv4();
    req.session.userData = {};
    req.session.engine = {};
    res.redirect(pathName.public.JSON);
    return;
  };

  next = async (
    source: string,
    req: Express.Request,
    res: any
  ): Promise<void> => {
    const redisClient = getRedisClient();

    switch (source) {
      case "info":
      case "passport":
      case "json":
        this.doCallback(req, res, redisClient);
        break;
      default:
        res.redirect("/500");
    }
  };

  generateUserDataAuthCode = (
    req: Express.Request,
    redisClient: RedisClient
  ): any => {
    const uuid = req.session.userId;
    const data = req.session.userData;
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

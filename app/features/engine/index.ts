/* eslint-disable no-console */
import { Request, Response } from "express";
import { pathName } from "../../paths";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { getRedisCacheByKey } from "../../utils/redis";
import { RedisClient } from "redis";
import { isTokenValid } from "../ipv/oauth/token/token";

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
        break;
      case "passport":
      case "json":
        this.handleJsonResponse(req, res, redisClient);
        break;
      case "userinfo":
        await this.handleUserInfoRequest(req, res, redisClient);
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

  fetchUserInfo = async (
    token: any,
    redisClient: RedisClient
  ): Promise<JSON> => {
    const userId = await getRedisCacheByKey(
      redisClient,
      "accesstoken:" + token
    );

    if (userId === null) {
      console.error("User ID could not be found!");
    }

    const data = await getRedisCacheByKey(redisClient, "userid:" + userId);

    return {
      sub: userId,
      ...JSON.parse(data),
    };
  };

  getTokenFromRequest = (req: Express.Request): string | null => {
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

  handleJsonResponse = (
    req: Express.Request,
    res: any,
    redisClient: RedisClient
  ): void => {
    const authCode = this.generateUserDataAuthCode(req, redisClient);
    res.redirect(
      `${req.session.oauth.redirect_uri}?code=${authCode}&state=${req.session.oauth.state}`
    );
  };

  handleUserInfoRequest = async (
    req: Express.Request,
    res: any,
    redisClient: RedisClient
  ): Promise<void> => {
    const token = this.getTokenFromRequest(req);

    if (token === null) {
      res.statusCode = 401;
      res.json({
        message: "Token missing or invalid",
      });
      return;
    }

    if (!isTokenValid(token)) {
      res.statusCode = 403;
      res.json({
        message: "Invalid token provided",
      });
      return;
    }
    const userInfo = await this.fetchUserInfo(token, redisClient);
    res.json(userInfo);
  };
}

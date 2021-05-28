/* eslint-disable no-console */
import { Request, Response } from "express";
import { pathName } from "../../paths";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { getRedisCacheByKey } from "../../utils/redis";
import { RedisClient } from "redis";

export class Engine extends Object {
  start = (req: Request, res: Response): void => {
    req.session.userId = uuidv4();
    req.session.userData = {};
    req.session.engine = {};
    // req.session.basicInfo = {};
    // req.session.passport = {};
    res.redirect(pathName.public.JSON);
    return;
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
      console.log("User ID is null");
      console.log("Access Token Key: accesstoken:" + token);
      console.log("User ID Key: userid:" + userId);
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
  ) => {
    const authCode = this.generateUserDataAuthCode(req, redisClient);
    res.redirect(
      `${req.session.oauth.redirect_uri}?code=${authCode}&state=${req.session.oauth.state}`
    );
  };

  handleUserInfoResponse = async (
    req: Express.Request,
    res: any,
    redisClient: RedisClient
  ): Promise<void> => {
    const token = this.getTokenFromRequest(req);
    console.log("token: " + token);
    if (token === null) {
      res.statusCode = 401;
      res.json({
        message: "Token missing or invalid",
      });
      return;
    }

    const userInfo = await this.fetchUserInfo(token, redisClient);
    res.json(userInfo);
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
        await this.handleUserInfoResponse(req, res, redisClient);
        break;
      default:
        res.redirect("/500");
    }
  };
}

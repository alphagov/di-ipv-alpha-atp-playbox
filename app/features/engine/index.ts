/* eslint-disable no-console */
import { Request, Response } from "express";
import { pathName } from "../../paths";
import hashSessionId from "../../utils/hashSessionId";
import { getRedisClient } from "../../session";
import { v4 as uuidv4 } from "uuid";
import { getRedisCacheByKey } from "../../utils/redis";

export class Engine extends Object {
  start = (req: Request, res: Response): void => {
    // TODO: Create user id here
    // const redisClient = getRedisClient();
    // redisClient.set("userid:" + uuid, null);
    req.session.userId = uuidv4();
    req.session.engine = {};
    req.session.basicInfo = {};
    req.session.passport = {};
    res.redirect(pathName.public.INFO);
    return;
  };
  next = async (
    source: string,
    values: any,
    req: Express.Request,
    res: any
  ): Promise<void> => {
    const redisClient = getRedisClient();
    if (source == "info") {
      res.redirect(pathName.public.PASSPORT_START);
      return;
    }
    if (["passport", "json"].includes(source)) {
      console.log(
        "session ID Hash",
        encodeURIComponent(hashSessionId(req.sessionID))
      );
      // sessionData.basicInfo = req.session.basicInfo;
      // sessionData.passport = req.session.passport;
      const uuid = req.session.userId;
      const data = {
        basicInfo: req.session.basicInfo,
        passport: req.session.passport,
      };
      redisClient.set("userid:" + uuid, JSON.stringify(data));

      const authCode = uuidv4();
      redisClient.set("authcode:" + authCode, uuid);
      res.redirect(
        `${req.session.oauth.redirect_uri}?code=${authCode}&state=${req.session.oauth.state}`
      );
      return;
    }
    if (source == "userinfo") {
      //const token = jwt.sign({ sub: "userinfo", ...sessionData }, jwtSecret());
      const token = req["headers"]["authorization"].substring(7);
      console.log(token);
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
      if (data === null) {
        console.log("Data is null");
      }
      console.log(data);
      res.json({
        sub: "userinfo",
        ...JSON.parse(data),
      });

      return;
    }
    res.redirect("/500");
    return;
  };
}

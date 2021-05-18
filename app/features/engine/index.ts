/* eslint-disable no-console */
import { Request, Response } from "express";
import { pathName } from "../../paths";
import hashSessionId from "../../utils/hashSessionId";
import { sessionData } from "./global";
export class Engine extends Object {
  start = (req: Request, res: Response): void => {
    req.session.engine = {};
    req.session.basicInfo = {};
    req.session.passport = {};
    res.redirect(pathName.public.INFO);
    return;
  };
  next = (
    source: string,
    values: any,
    req: Express.Request,
    res: any
  ): void => {
    if (source == "info") {
      res.redirect(pathName.public.PASSPORT_START);
      return;
    }
    if (["passport", "json"].includes(source)) {
      console.log(
        "session ID Hash",
        encodeURIComponent(hashSessionId(req.sessionID))
      );
      sessionData.basicInfo = req.session.basicInfo;
      sessionData.passport = req.session.passport;
      res.redirect(
        `${req.session.oauth.redirect_uri}?${
          req.session.oauth.response_type
        }=${encodeURIComponent(hashSessionId(req.sessionID))}&state=${
          req.session.oauth.state
        }`
      );
      return;
    }
    if (source == "userinfo") {
      //const token = jwt.sign({ sub: "userinfo", ...sessionData }, jwtSecret());
      res.json({ sub: "userinfo", ...sessionData });

      return;
    }
    res.redirect("/500");
    return;
  };
}

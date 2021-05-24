/* eslint-disable no-console */
import { Request, Response } from "express";
import { pathName } from "../../paths";
import hashSessionId from "../../utils/hashSessionId";
import _ from "lodash";

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
      res.redirect(
        `${req.session.oauth.redirect_uri}?${
          req.session.oauth.response_type
        }=${encodeURIComponent(hashSessionId(req.sessionID))}&state=${
          req.session.oauth.state
        }`
      );
      return;
    }
    if (source == "out") {
      const paramToken = values.id;
      const sessionData = {
        basicInfo: _.clone(req.session.basicInfo),
        passport: _.clone(req.session.passport),
      };
      req.session.engine = {};
      req.session.basicInfo = {};
      req.session.passport = {};
      if (paramToken == hashSessionId(req.sessionID)) {
        res.json({
          sessionData: sessionData,
        });
      } else {
        console.log(
          "session ID Hash",
          paramToken,
          hashSessionId(req.sessionID)
        );
        res.json({ error: "unknown session" });
      }
      return;
    }
    res.redirect("/500");
    return;
  };
}

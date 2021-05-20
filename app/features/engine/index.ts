/* eslint-disable no-console */
import { Request, Response } from "express";
import { jwtSecret } from "../../../config";
import { pathName } from "../../paths";
import jwt from "jsonwebtoken";
import hashSessionId from "../../utils/hashSessionId";

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
    if (source == "passport") {
      const id = { id: hashSessionId(req.sessionID) };
      const token = jwt.sign(id, jwtSecret(), { expiresIn: "1800s" });

      const buff = Buffer.from(token, "ascii");
      const paramToken = encodeURIComponent(buff.toString("base64"));
      console.log(
        "session ID Hash",
        encodeURIComponent(hashSessionId(req.sessionID))
      );
      res.redirect(`${pathName.external.ORCHESTRATOR}?token=${paramToken}`);
      return;
    }
    if (source == "out") {
      const paramToken = values.id;
      if (paramToken == hashSessionId(req.sessionID)) {
        res.json({
          sessionData: {
            basicInfo: req.session.basicInfo,
            passport: req.session.passport,
          },
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

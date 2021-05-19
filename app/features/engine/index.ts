import { Request, Response } from "express";
import { jwtSecret } from "../../../config";
import { pathName } from "../../paths";
import jwt from "jsonwebtoken";

/* eslint-disable no-console */
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
      const output = {
        basicInfo: req.session.basicInfo,
        passport: req.session.passport,
      };
      const token = jwt.sign(output, jwtSecret(), { expiresIn: "1800s" });
      req.session.basicInfo = {};
      req.session.passport = {};
      res.redirect(`${pathName.external.ORCHESTRATOR}?token=${token}`);
      console.log(req.session);
      return;
    }
    res.redirect("/500");
    return;
  };
}

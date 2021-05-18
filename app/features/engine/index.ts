import { jwtSecret } from "../../../config";

/* eslint-disable no-console */
export class Engine extends Object {
  start = (req, res): string => {
    req.session.engine = {};
    return res.redirect("/ipv/info");
  };
  next = (source: string, values: any, req, res): string => {
    if (source == "info") {
      res.redirect("/passport");
      return;
    }
    if (source == "passport") {
      const output = {
        basicInfo: req.session.basicInfo,
        passport: req.session.passport,
      };
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(output, jwtSecret(), { expiresIn: "1800s" });
      res.redirect(
        "http://localhost:8081/orchestrator/callback?token=" + token
      );
      req.session.basicInfo = null;
      req.session.passport = null;
      return;
    }
    res.redirect("/500");
  };
}

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
      res.redirect(
        "/output?data=" + encodeURIComponent(JSON.stringify(output))
      );
      return;
    }
    res.redirect("/500");
  };
}

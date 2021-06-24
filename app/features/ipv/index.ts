import { Request } from "express";

export const getScore = (
  req: Request,
  param: string,
  list: Array<string>
): number => {
  let score = 0;
  list.forEach((item) => {
    if (req.session.userData[item] && req.session.userData[item].scores)
      score = score + req.session.userData[item].scores[param];
  });
  return score;
};

export const getValidations = (req: Request): any => {
  const list = [
    "bankAccount",
    "drivingLicence",
    "passport",
    "basicInfo",
    "json",
  ];
  const validations = {};
  validations["bankAccount"] = req.session.userData.bankAccount
    ? {
        validation: req.session.userData.bankAccount.validation,
        evidence: req.session.userData.bankAccount.evidence,
      }
    : null;
  validations["drivingLicence"] = req.session.userData.drivingLicence
    ? {
        validation: req.session.userData.drivingLicence.validation,
        evidence: req.session.userData.drivingLicence.evidence,
      }
    : null;
  validations["passport"] = req.session.userData.passport
    ? {
        validation: req.session.userData.passport.validation,
        evidence: req.session.userData.passport.evidence,
      }
    : null;
  validations["basicInfo"] = req.session.userData.basicInfo
    ? {
        validation: req.session.userData.basicInfo.validation,
        evidence: req.session.userData.basicInfo.evidence,
      }
    : null;
  validations["json"] = req.session.userData.json
    ? {
        validation: req.session.userData.json.validation,
        evidence: req.session.userData.json.evidence,
      }
    : null;
  validations["scores"] = {
    history: getScore(req, "history", list),
    fraud: getScore(req, "fraud", list),
    verification: getScore(req, "verification", list),
  };

  return validations;
};

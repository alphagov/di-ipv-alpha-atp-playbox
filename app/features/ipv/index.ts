import { Request } from "express";

export const getValidations = (req: Request): any => {
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

  return validations;
};

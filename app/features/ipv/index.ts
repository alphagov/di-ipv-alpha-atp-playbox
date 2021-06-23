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
  validations["scores"] = {
    history:
      (req.session.userData.bankAccount
        ? req.session.userData.bankAccount.scores.history
        : 0) +
      (req.session.userData.drivingLicence
        ? req.session.userData.drivingLicence.scores.history
        : 0) +
      (req.session.userData.passport
        ? req.session.userData.passport.scores.history
        : 0) +
      (req.session.userData.basicInfo
        ? req.session.userData.basicInfo.scores.history
        : 0) +
      (req.session.userData.json
        ? req.session.userData.json.scores.history
        : 0),
    fraud:
      (req.session.userData.bankAccount
        ? req.session.userData.bankAccount.scores.fraud
        : 0) +
      (req.session.userData.drivingLicence
        ? req.session.userData.drivingLicence.scores.fraud
        : 0) +
      (req.session.userData.passport
        ? req.session.userData.passport.scores.fraud
        : 0) +
      (req.session.userData.basicInfo
        ? req.session.userData.basicInfo.scores.fraud
        : 0) +
      (req.session.userData.json ? req.session.userData.json.scores.fraud : 0),
    verification:
      (req.session.userData.bankAccount
        ? req.session.userData.bankAccount.scores.verification
        : 0) +
      (req.session.userData.drivingLicence
        ? req.session.userData.drivingLicence.scores.verification
        : 0) +
      (req.session.userData.passport
        ? req.session.userData.passport.scores.verification
        : 0) +
      (req.session.userData.basicInfo
        ? req.session.userData.basicInfo.scores.verification
        : 0) +
      (req.session.userData.json
        ? req.session.userData.json.scores.verification
        : 0),
  };
  return validations;
};

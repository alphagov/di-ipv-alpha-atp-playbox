/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Request, Response, Router, NextFunction } from "express";
import { body } from "express-validator";
import moment from "moment";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { bodyValidate as validate } from "../../../../../middleware/form-validation-middleware";
import { pathName } from "../../../../../paths";
import {
  dateInputAsMoment,
  dateValidation,
} from "../../../../common/dateValidation";
import { addToFill, addToList } from "../../../../components/autoInput";
import { postPassportAPI } from "../../api";

import * as jwt from "jsonwebtoken";
import { EvidenceType } from "../../../../../data";

const template = "atp/passport/ui/idx/view.njk";

const passportValidationMiddleware = [
  body("number")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.passport.start.number.validationError.required", {
        value,
      });
    }),
  body("surname")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.passport.start.surname.validationError.required", {
        value,
      });
    }),
  body("givenNames")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.passport.start.givenNames.validationError.required", {
        value,
      });
    }),
  ...dateValidation(
    "dob",
    "pages.passport.start.dob.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isAfter(todaysDate)) {
        throw new Error(
          req.t("pages.passport.start.dob.validationError.futureDate", {
            value: momentDate.format("LL"),
            today: todaysDate.format("LL"),
          })
        );
      }
    }
  ),
  ...dateValidation(
    "issued",
    "pages.passport.start.issued.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isAfter(todaysDate)) {
        throw new Error(
          req.t("pages.passport.start.issued.validationError.futureDate", {
            value: momentDate.format("LL"),
            today: todaysDate.format("LL"),
          })
        );
      }
    }
  ),
  ...dateValidation(
    "expiry",
    "pages.passport.start.expiry.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isBefore(todaysDate)) {
        throw new Error(
          req.t("pages.passport.start.expiry.validationError.pastDate", {
            value: momentDate.format("LL"),
            today: todaysDate.format("LL"),
          })
        );
      }
    }
  ),
];

const getPassport = (req: Request, res: Response): void => {
  if (!req.session.sessionData.identityEvidence) {
    req.session.sessionData.identityEvidence = [];
  }

  let passportAttributes;
  const allIdentityEvidence = req.session.sessionData.identityEvidence;
  if (allIdentityEvidence) {
    passportAttributes = allIdentityEvidence.filter(filterPassport).slice(-1).map((evidence) => evidence.attributes)[0];
  }

  function filterPassport(allIdentityEvidence) {
    return allIdentityEvidence.type == EvidenceType.UK_PASSPORT;
  }

  const number = passportAttributes ? passportAttributes.passportNumber : null;
  const surname = passportAttributes ? passportAttributes.surname : null;
  const givenNames = passportAttributes ? passportAttributes.forenames : null;
  const dob = passportAttributes ? passportAttributes.dateOfBirth : null;
  const issued = passportAttributes ? passportAttributes.issued : null;
  const expiry = passportAttributes ? passportAttributes.expiryDate : null;

  const values = {
    number,
    surname,
    givenNames,
    dobDay: dob ? dob.day : null,
    dobMonth: dob ? dob.month : null,
    dobYear: dob ? dob.year : null,
    issuedDay: issued ? issued.day : null,
    issuedMonth: issued ? issued.month : null,
    issuedYear: issued ? issued.year : null,
    expiryDay: expiry ? expiry.day : null,
    expiryMonth: expiry ? expiry.month : null,
    expiryYear: expiry ? expiry.year : null,
  };
  return res.render(template, { ...values });
};

const postPassport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attributes = {
      passportNumber: req.body["number"],
      surname: req.body["surname"],
      forenames: req.body["givenNames"].split(" "),
      dateOfBirth:
        req.body["dobYear"] +
        "-" +
        req.body["dobMonth"].padStart(2, "0") +
        "-" +
        req.body["dobDay"].padStart(2, "0") +
        "T00:00:00",
      issued:
        req.body["issuedDay"] +
        "-" +
        req.body["issuedMonth"].padStart(2, "0") +
        "-" +
        req.body["issuedDay"].padStart(2, "0") +
        "T00:00:00",
      expiryDate:
        req.body["expiryYear"] +
        "-" +
        req.body["expiryMonth"].padStart(2, "0") +
        "-" +
        req.body["expiryDay"].padStart(2, "0") +
        "T00:00:00",
    };

    const identityEvidence: IdentityEvidence = {
      type: EvidenceType.UK_PASSPORT,
      strength: 0,
      validity: 0,
      attributes: attributes,
    };

    const output = await postPassportAPI(attributes);
    const decoded = jwt.decode(output);
    identityEvidence.jws = output;
    identityEvidence.atpResponse = decoded;
    req.session.sessionData.identityEvidence = req.session.sessionData.identityEvidence || [];
    req.session.sessionData.identityEvidence.push(identityEvidence);

    addToFill(req, "dob", {
      dobDay: req.body["dobDay"],
      dobMonth: req.body["dobMonth"],
      dobYear: req.body["dobYear"],
    });
    addToFill(req, "expiry", {
      expiryDay: req.body["expiryDay"],
      expiryMonth: req.body["expiryMonth"],
      expiryYear: req.body["expiryYear"],
    });
    addToFill(req, "issued", {
      issuedDay: req.body["issuedDay"],
      issuedMonth: req.body["issuedMonth"],
      issuedYear: req.body["issuedYear"],
    });
    addToList(req, "givenNames", {
      givenNames: req.body["givenNames"],
    });
    addToList(req, "surname", {
      surname: req.body["surname"],
    });
    res.redirect("/ipv/next?source=passport");
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupPassportController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.PASSPORT_START, getPassport);
    router.post(
      pathName.public.PASSPORT_START,
      passportValidationMiddleware,
      validate(template, validationData),
      postPassport
    );
    return router;
  }
}

export { SetupPassportController, getPassport, postPassport };

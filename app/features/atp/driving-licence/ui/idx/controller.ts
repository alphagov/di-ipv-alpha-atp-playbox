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
import { postDrivingLicenceAPI } from "../../api";
import * as jwt from "jsonwebtoken";
import { EvidenceType } from "../../../../../data";
const template = "atp/driving-licence/ui/idx/view.njk";

const drivingLicenceValidationMiddleware = [
  body("number")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t(
        "pages.drivingLicence.start.number.validationError.required",
        {
          value,
        }
      );
    }),
  body("surname")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t(
        "pages.drivingLicence.start.surname.validationError.required",
        {
          value,
        }
      );
    }),
  body("givenNames")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t(
        "pages.drivingLicence.start.givenNames.validationError.required",
        {
          value,
        }
      );
    }),
  ...dateValidation(
    "dob",
    "pages.drivingLicence.start.dob.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isAfter(todaysDate)) {
        throw new Error(
          req.t("pages.drivingLicence.start.dob.validationError.futureDate", {
            value: momentDate.format("LL"),
            today: todaysDate.format("LL"),
          })
        );
      }
    }
  ),
  ...dateValidation(
    "issued",
    "pages.drivingLicence.start.issued.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isAfter(todaysDate)) {
        throw new Error(
          req.t(
            "pages.drivingLicence.start.issued.validationError.futureDate",
            {
              value: momentDate.format("LL"),
              today: todaysDate.format("LL"),
            }
          )
        );
      }
    }
  ),
  ...dateValidation(
    "expiry",
    "pages.drivingLicence.start.expiry.validationError",
    (year, month, day, req) => {
      const momentDate = dateInputAsMoment(year, month, day).startOf("day");
      const todaysDate = moment().startOf("day");
      if (momentDate.isBefore(todaysDate)) {
        throw new Error(
          req.t("pages.drivingLicence.start.expiry.validationError.pastDate", {
            value: momentDate.format("LL"),
            today: todaysDate.format("LL"),
          })
        );
      }
    }
  ),
];

const getDrivingLicence = (req: Request, res: Response): void => {
  if (!req.session.sessionData.identityEvidence) {
    req.session.sessionData.identityEvidence = [];
  }

  let drivingLicenceAttributes;
  const allIdentityEvidence = req.session.sessionData.identityEvidence;
  if (allIdentityEvidence) {
    drivingLicenceAttributes = allIdentityEvidence
      .filter((evidence) => evidence.type == EvidenceType.DRIVING_LICENCE)
      .slice(-1)
      .map((evidence) => evidence.attributes)[0];
  }

  const number = drivingLicenceAttributes
    ? drivingLicenceAttributes.licenceNumber
    : null;
  const surname = drivingLicenceAttributes
    ? drivingLicenceAttributes.surname
    : null;
  const givenNames = drivingLicenceAttributes
    ? drivingLicenceAttributes.forenames
    : null;
  const dob = drivingLicenceAttributes
    ? drivingLicenceAttributes.dateOfBirth
    : null;
  const issued = drivingLicenceAttributes
    ? drivingLicenceAttributes.issued
    : null;
  const expiry = drivingLicenceAttributes
    ? drivingLicenceAttributes.expiryDate
    : null;

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

const postDrivingLicence = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attributes = {
      licenceNumber: req.body["number"],
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
      type: EvidenceType.DRIVING_LICENCE,
      strength: 0,
      validity: 0,
      attributes: attributes,
    };

    const output = await postDrivingLicenceAPI(attributes);
    const decoded = jwt.decode(output);
    identityEvidence.jws = output;
    identityEvidence.atpResponse = decoded;
    req.session.sessionData.identityEvidence =
      req.session.sessionData.identityEvidence || [];
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
    res.redirect("/ipv/next?source=driving-licence");
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupDrivingLicenceController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.DRIVING_LICENCE_START, getDrivingLicence);
    router.post(
      pathName.public.DRIVING_LICENCE_START,
      drivingLicenceValidationMiddleware,
      validate(template, validationData),
      postDrivingLicence
    );
    return router;
  }
}

export { SetupDrivingLicenceController, getDrivingLicence, postDrivingLicence };

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
import { bodyValidate as validate } from "../../../../../middleware/form-validation-middleware";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import { body } from "express-validator";
import {
  dateInputAsMoment,
  dateValidation,
} from "../../../../common/dateValidation";
import moment from "moment";
import { postBasicInfoJSON } from "../../api";
import { addToFill, addToList } from "../../../../components/autoInput";
import { EvidenceType } from "../../../../../data";
import * as jwt from "jsonwebtoken";

const template = "atp/information/ui/idx/view.njk";

const infoValidationMiddleware = [
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
  body("addressLine1")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.ipv.info.addressLine1.validationError.required", {
        value,
      });
    }),
  body("addressTown")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.ipv.info.addressTown.validationError.required", {
        value,
      });
    }),
  body("addressPostcode")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.ipv.info.addressPostcode.validationError.required", {
        value,
      });
    }),
];

// This is the root route and will redirect back to the appropriate gov.uk start page
const getInfo = (req: Request, res: Response): void => {
  if (!req.session.sessionData.identityEvidence) {
    req.session.identityEvidence = [];
  }

  const allIdentityEvidence = req.session.sessionData.identityEvidence;

  let informationAttributes;
  if (allIdentityEvidence) {
    informationAttributes = allIdentityEvidence
      .filter((evidence) => evidence.type == EvidenceType.ATP_GENERIC_DATA)
      .slice(-1)
      .map((evidence) => evidence.attributes)[0];
  }

  const surname = informationAttributes ? informationAttributes.surname : null;
  const givenNames = informationAttributes
    ? informationAttributes.forenames
    : null;
  const dob = informationAttributes ? informationAttributes.dateOfBirth : null;
  const addressLine1 = informationAttributes
    ? informationAttributes.addressLine1
    : null;
  const addressLine2 = informationAttributes
    ? informationAttributes.addressLine2
    : null;
  const addressTown = informationAttributes
    ? informationAttributes.addressTown
    : null;
  const addressCounty = informationAttributes
    ? informationAttributes.addressCounty
    : null;
  const addressPostcode = informationAttributes
    ? informationAttributes.addressPostcode
    : null;

  const values = {
    surname,
    givenNames,
    dobDay: dob ? dob.day : null,
    dobMonth: dob ? dob.month : null,
    dobYear: dob ? dob.year : null,
    addressLine1,
    addressLine2,
    addressTown,
    addressCounty,
    addressPostcode,
  };
  return res.render(template, { language: req.i18n.language, ...values });
};

const postInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attributes = {
      surname: req.body["surname"],
      givenNames: req.body["givenNames"],
      dob: {
        day: req.body["dobDay"],
        month: req.body["dobMonth"],
        year: req.body["dobYear"],
      },
      addressLine1: req.body["addressLine1"],
      addressLine2: req.body["addressLine2"],
      addressTown: req.body["addressTown"],
      addressCounty: req.body["addressCounty"],
      addressPostcode: req.body["addressPostcode"],
    };

    const identityEvidence: IdentityEvidence = {
      type: EvidenceType.ATP_GENERIC_DATA,
      strength: 0,
      validity: 0,
      attributes: attributes,
    };

    const output = await postBasicInfoJSON(attributes);
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
    addToList(req, "givenNames", {
      givenNames: req.body["givenNames"],
    });
    addToList(req, "surname", {
      surname: req.body["surname"],
    });
    addToList(req, "addressLine1", {
      surname: req.body["addressLine1"],
    });
    addToList(req, "addressLine2", {
      surname: req.body["addressLine2"],
    });
    addToList(req, "addressTown", {
      surname: req.body["addressTown"],
    });
    addToList(req, "addressCounty", {
      surname: req.body["addressCounty"],
    });
    addToList(req, "addressPostcode", {
      surname: req.body["addressPostcode"],
    });

    const allJson = req.session.sessionData.identityEvidence
      .filter((evidence) => evidence.type == EvidenceType.ATP_GENERIC_DATA)
      .slice(-1)
      .map((evidence) => evidence.attributes)[0];

    await postBasicInfoJSON(allJson);
    res.redirect("/ipv/next?source=information");
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupInfoController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.INFO, getInfo);
    router.post(
      pathName.public.INFO,
      infoValidationMiddleware,
      validate(template, validationData),
      postInfo
    );
    return router;
  }
}

export { SetupInfoController, getInfo };

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
import { PageSetup } from "../../../interfaces/PageSetup";
import { bodyValidate as validate } from "../../../middleware/form-validation-middleware";
import { pathName } from "../../../paths";
import { dateInputAsMoment, dateValidation } from "../../common/dateValidation";

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

const getStart = (req: Request, res: Response): void => {
  if (!req.session.passport) {
    req.session.passport = { dob: "", issued: "", expiry: "" };
  }
  const {
    number,
    surname,
    givenNames,
    dob,
    issued,
    expiry,
  } = req.session.passport;
  const values = {
    number,
    surname,
    givenNames,
    dobDay: dob.day,
    dobMonth: dob.month,
    dobYear: dob.year,
    issuedDay: issued.day,
    issuedMonth: issued.month,
    issuedYear: issued.year,
    expiryDay: expiry.day,
    expiryMonth: expiry.month,
    expiryYear: expiry.year,
  };
  return res.render("passport/start/view.njk", { ...values });
};

const postStart = (req: Request, res: Response, next: NextFunction): void => {
  try {
    req.session.passport = {
      ...req.session.passport,
      number: req.body["number"],
      surname: req.body["surname"],
      givenNames: req.body["givenNames"],
      dob: {
        day: req.body["dobDay"],
        month: req.body["dobMonth"],
        year: req.body["dobYear"],
      },
      issued: {
        day: req.body["issuedDay"],
        month: req.body["issuedMonth"],
        year: req.body["issuedYear"],
      },
      expiry: {
        day: req.body["expiryDay"],
        month: req.body["expiryMonth"],
        year: req.body["expiryYear"],
      },
    };
    return res.redirect(pathName.public.FORBIDDEN);
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupStartController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.PASSPORT_START, getStart);
    router.post(
      pathName.public.PASSPORT_START,
      passportValidationMiddleware,
      validate("passport/start/view.njk", validationData),
      postStart
    );
    return router;
  }
}

export { SetupStartController, getStart, postStart };

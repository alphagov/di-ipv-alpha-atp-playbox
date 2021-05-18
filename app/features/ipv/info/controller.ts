/* eslint-disable no-console */
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

import { Request, Response, Router } from "express";
import { bodyValidate as validate } from "../../../middleware/form-validation-middleware";
import { PageSetup } from "../../../interfaces/PageSetup";
import { pathName } from "../../../paths";
import { Engine } from "../../engine";
import { body } from "express-validator";
import { dateInputAsMoment, dateValidation } from "../../common/dateValidation";
import moment from "moment";

const template = "ipv/info/view.njk";

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
  return res.render(template, { language: req.i18n.language });
};

const postInfo = (req: Request, res: Response): void => {
  // call something
  const engine = new Engine();
  const url = engine.next("info", {}, req);
  return res.redirect(url);
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

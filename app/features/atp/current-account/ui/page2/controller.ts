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

const template = "atp/current-account/ui/page2/view.njk";

const currentAccountValidationMiddleware = [
  body("cvv")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.bankAccount.cvv.validationError.required", {
        value,
      });
    })
    .bail()
    .custom((cvv) => {
      const regex = /^[0-9]{3}$/g;
      const found = cvv.match(regex);
      return !!found;
    })
    .withMessage((value, { req, location, path }) => {
      return req.t("pages.bankAccount.cvv.validationError.digits", {
        value,
        location,
        path,
      });
    }),
];

// This is the root route and will redirect back to the appropriate gov.uk start page
const getCurrentAccountLastOpened = (req: Request, res: Response): void => {
  if (!req.session.userData.currentAccount) {
    req.session.userData.currentAccount = {};
  }
  const { cvv } = req.session.userData.currentAccount;
  const values = { cvv: cvv };
  return res.render(template, { language: req.i18n.language, ...values });
};

const postCurrentAccountLastOpened = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // call something
  try {
    req.session.userData.currentAccount = {
      ...req.session.userData.currentAccount,
      cvv: req.body["cvv"],
    };
    res.redirect(pathName.public.CURRENT_ACCOUNT_MORTGAGE);
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupCurrentAccountLastOpenedController {
  initialise(): Router {
    const router = Router();
    router.get(
      pathName.public.CURRENT_ACCOUNT_CVV,
      getCurrentAccountLastOpened
    );
    router.post(
      pathName.public.CURRENT_ACCOUNT_CVV,
      currentAccountValidationMiddleware,
      validate(template, validationData),
      postCurrentAccountLastOpened
    );
    return router;
  }
}

export { SetupCurrentAccountLastOpenedController, getCurrentAccountLastOpened };

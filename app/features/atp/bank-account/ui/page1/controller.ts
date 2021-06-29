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
import { postBankAccountJSON } from "../../api";
import { Engine } from "../../../../engine";

const template = "atp/bank-account/ui/page1/view.njk";

const bankAccountValidationMiddleware = [
  body("lastOpened")
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.t("pages.bankAccount.lastOpened.validationError.required", {
        value,
      });
    }),
];

// This is the root route and will redirect back to the appropriate gov.uk start page
const getBankAccountLastOpened = (req: Request, res: Response): void => {
  if (!req.session.userData.bankAccount) {
    req.session.userData.bankAccount = {};
  }
  const { lastOpened } = req.session.userData.bankAccount;
  const values = { lastOpened: lastOpened };
  return res.render(template, { language: req.i18n.language, ...values });
};

const postBankAccountLastOpened = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // call something
  try {
    if (req.body["lastOpened"] == "never") {
      req.session.userData.bankAccount = {
        lastOpened: req.body["lastOpened"],
      };
      const allJson = req.session.userData.bankAccount;
      delete allJson["validation"];
      await postBankAccountJSON(allJson);

      const engine = new Engine();
      engine.next("bank-account", req, res);
    } else {
      req.session.userData.bankAccount = {
        ...req.session.userData.bankAccount,
        lastOpened: req.body["lastOpened"],
        // TODO: add this in the ATP
      };
      res.redirect(pathName.public.CURRENT_ACCOUNT_CVV);
    }
  } catch (e) {
    next(e);
  }
};

const validationData = (): any => {
  return {};
};

@PageSetup.register
class SetupBankAccountLastOpenedController {
  initialise(): Router {
    const router = Router();
    router.get(
      pathName.public.CURRENT_ACCOUNT_LAST_OPENED,
      getBankAccountLastOpened
    );
    router.post(
      pathName.public.CURRENT_ACCOUNT_LAST_OPENED,
      bankAccountValidationMiddleware,
      validate(template, validationData),
      postBankAccountLastOpened
    );
    return router;
  }
}

export { SetupBankAccountLastOpenedController, getBankAccountLastOpened };

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
import { PageSetup } from "../../../interfaces/PageSetup";
import { pathName } from "../../../paths";

const template = "ipv/home/view.njk";

const getHome = (req: Request, res: Response): void => {
  // TODO: Display a landing page with all the available check links -> Passport, KBV, Other
  const validations = {};
  validations["bankAccount"] = req.session.userData.bankAccount
    ? req.session.userData.bankAccount.validation
    : null;
  validations["passport"] = req.session.userData.passport
    ? req.session.userData.passport.validation
    : null;
  validations["basicInfo"] = req.session.userData.basicInfo
    ? req.session.userData.basicInfo.validation
    : null;
  validations["json"] = req.session.userData.json
    ? req.session.userData.json.validation
    : null;
  return res.render(template, { language: req.i18n.language, validations });
};

@PageSetup.register
class SetupHomeController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.HOME, getHome);

    return router;
  }
}

export { SetupHomeController, getHome };

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
import { body } from "express-validator";
import { bodyValidate as validate } from "../../../middleware/form-validation-middleware";
import { PageSetup } from "../../../interfaces/PageSetup";
import { pathName } from "../../../paths";
import { Engine } from "../../engine";

const template = "ipv/json/view.njk";

const jsonValidationMiddleware = [
  body("jsonObj").custom((jsonObj) => {
    return new Promise((resolve, reject) => {
      try {
        if (jsonObj == "") {
          return resolve("ok");
        }
        JSON.parse(jsonObj);
        return resolve("ok");
      } catch (e) {
        reject(e);
      }
    });
  }),
];

const getJSON = (req: Request, res: Response): void => {
  const userData = JSON.stringify(req.session.userData);
  return res.render(template, { language: req.i18n.language, userData });
};

const appendJsonData = (req: Request): void => {
  const jsonObj = req.body["jsonObj"];
  const json = JSON.parse(jsonObj);
  req.session.userData = {
    ...req.session.userData,
    ...json,
  };
};

const postJSON = (req: Request, res: Response): void => {
  const errors = {};
  const jsonObj = req.body["jsonObj"];
  try {
    if (jsonObj == "") {
      if ("button-continue" in req.body) {
        const engine = new Engine();
        engine.next("json", req, res);
        return;
      } else {
        const userData = JSON.stringify(req.session.userData);
        return res.render(template, {
          language: req.i18n.language,
          jsonObj,
          userData,
          errors,
        });
      }
    }
    appendJsonData(req);
  } catch (e) {
    errors["jsonObj"] = {
      text: e,
      href: "#jsonObj",
    };
  }

  if ("button-continue" in req.body) {
    const engine = new Engine();
    engine.next("json", req, res);
    return;
  } else {
    const userData = JSON.stringify(req.session.userData);
    return res.render(template, {
      language: req.i18n.language,
      jsonObj,
      userData,
      errors,
    });
  }
};

const validationData = (session: Express.Session): any => {
  return {
    userData: JSON.stringify(session.userData),
  };
};

@PageSetup.register
class SetupJSONController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.JSON, getJSON);
    router.post(
      pathName.public.JSON,
      jsonValidationMiddleware,
      validate(template, validationData),
      postJSON
    );
    return router;
  }
}

export { SetupJSONController, getJSON };

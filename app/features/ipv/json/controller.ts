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

const template = "ipv/json/view.njk";

const jsonValidationMiddleware = [
  body("jsonObj")
    .not()
    .isEmpty()
    .withMessage(() => {
      return "Please enter an object in JSON format";
    })
    .bail()
    .custom((jsonObj) => {
      return new Promise((resolve, reject) => {
        try {
          JSON.parse(jsonObj);
          return resolve("ok");
        } catch (e) {
          reject(e);
        }
      });
    })
    .bail()
    .custom((jsonObj) => {
      return new Promise((resolve, reject) => {
        try {
          const json = JSON.parse(jsonObj);
          if (!json["_type"]) {
            return reject(
              new Error('must contain a type, for example "_type": "passport"')
            );
          }
          return resolve("ok");
        } catch (e) {
          reject(e);
        }
      });
    }),
];

// This is the root route and will redirect back to the appropriate gov.uk start page
const getJSON = (req: Request, res: Response): void => {
  return res.render(template, { language: req.i18n.language });
};

const postJSON = (req: Request, res: Response): void => {
  const errors = {};
  const jsonObj = req.body["jsonObj"];
  try {
    // put your code in here to process the json
    const json = JSON.parse(jsonObj);
    switch (json["_type"]) {
      case "passport":
        {
          // populate passport in session (example)
          const { number, surname, givenNames, dob, issued, expiry } = json;
          req.session.passport = {
            ...req.session.passport,
            number: number,
            surname: surname,
            givenNames: givenNames,
            dob: !dob
              ? null
              : {
                  day: dob.day,
                  month: dob.month,
                  year: dob.year,
                },
            issued: !issued
              ? null
              : {
                  day: issued.day,
                  month: issued.month,
                  year: issued.year,
                },
            expiry: !expiry
              ? null
              : {
                  day: expiry.day,
                  month: expiry.month,
                  year: expiry.year,
                },
          };
        }
        console.log("input", JSON.parse(jsonObj));
        console.log("session.passport", req.session.passport);
        break;
      default:
        console.log("input", JSON.parse(jsonObj));
    }
  } catch (e) {
    errors["jsonObj"] = {
      text: e,
      href: "#jsonObj",
    };
  }
  // call something
  return res.render(template, {
    language: req.i18n.language,
    jsonObj,
    errors,
  });
};

const validationData = (): any => {
  return {};
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

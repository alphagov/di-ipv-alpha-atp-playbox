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
import { bodyValidate as validate } from "../../../../../middleware/form-validation-middleware";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import { Engine } from "../../../../engine";
import { postAttributesCall } from "../../api";

const template = "atp/attributes/ui/idx/view.njk";

const attributesValidationMiddleware = [
  body("attributesObj").custom((attributesObj) => {
    return new Promise((resolve, reject) => {
      try {
        if (attributesObj == "") {
          return resolve("ok");
        }
        JSON.parse(attributesObj);
        return resolve("ok");
      } catch (e) {
        reject(e);
      }
    });
  }),
];

const getAttributes = (req: Request, res: Response): void => {
  const _type = req.query._type.toString();
  if (!req.session.userData[_type] || !req.session.userData[_type].scores) {
    req.session.userData[_type] = {
      scores: {},
    };
  }
  const data = req.session.userData[_type];
  const form = {
    activityHistory: data.scores.activityHistory || "0",
    identityFraud: data.scores.identityFraud || "0",
    verification: data.scores.verification || "0",
  };
  delete data.scores;
  delete data.validation;
  form["attributesObj"] = JSON.stringify(data);
  req.session._type = _type;
  return res.render(template, {
    language: req.i18n.language,
    ...form,
    _type,
  });
};

const appendJsonData = async (req: Request): Promise<void> => {
  const _type = req.query._type.toString();
  const attributesObj = req.body["attributesObj"];
  const scores = {
    activityHistory: req.body["activityHistory"],
    identityFraud: req.body["identityFraud"],
    verification: req.body["verification"],
  };
  const attributes = JSON.parse(attributesObj);
  const allJson = {
    ...attributes,
    scores,
  };
  delete allJson["validation"];
  await postAttributesCall(allJson);
  req.session.userData[_type] = allJson;
};

const postAttributes = async (req: Request, res: Response): Promise<void> => {
  const errors = {};
  const attributesObj = req.body["attributesObj"];
  const scores = {
    activityHistory: req.body["activityHistory"],
    identityFraud: req.body["identityFraud"],
    verification: req.body["verification"],
  };
  try {
    if (attributesObj == "") {
      if ("button-continue" in req.body) {
        const engine = new Engine();
        engine.next("attributes", req, res);
        return;
      } else {
        return res.render(template, {
          language: req.i18n.language,
          attributesObj,
          ...scores,
          _type: req.session._type,
          errors,
        });
      }
    }
    await appendJsonData(req);
  } catch (e) {
    errors["attributesObj"] = {
      text: e,
      href: "#attributesObj",
    };
  }

  if ("button-continue" in req.body) {
    const engine = new Engine();
    engine.next("attributes", req, res);
    return;
  } else {
    return res.render(template, {
      language: req.i18n.language,
      attributesObj,
      ...scores,
      _type: req.session._type,
      errors,
    });
  }
};

const validationData = (session: Express.Session): any => {
  return {
    _type: session._type,
  };
};

@PageSetup.register
class SetupAttributesController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.ATTRIBUTES, getAttributes);
    router.post(
      pathName.public.ATTRIBUTES,
      attributesValidationMiddleware,
      validate(template, validationData),
      postAttributes
    );
    return router;
  }
}

export { SetupAttributesController, getAttributes };

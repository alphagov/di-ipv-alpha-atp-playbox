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
import { PageSetup } from "../../../../interfaces/PageSetup";
import { pathName } from "../../../../paths";

// This is the root route and will redirect back to the appropriate gov.uk start page
const postOAuthToken = (req: Request, res: Response): void => {
  if (
    req.body.code &&
    req.body.grant_type &&
    req.body.redirect_uri &&
    req.body.client_id &&
    req.body.client_secret &&
    req.body.code_verifier
  ) {
    const config = {
      client: {
        id: req.body.client_id,
        secret: req.body.client_secret,
      },
      auth: {
        tokenHost: "http://localhost:3000/",
      },
    };
    const { AuthorizationCode } = require("simple-oauth2");

    const run = async () => {
      const client = new AuthorizationCode(config);

      const authorizationUri = client.authorizeURL({
        redirect_uri: "http://localhost:3000/callback",
        state: req.session.oauth,
      });

      // Redirect example using Express (see http://expressjs.com/api.html#res.redirect)
      res.redirect(authorizationUri);
      console.log("authorizationUri", authorizationUri);
      const tokenParams = {
        code: req.query.code,
        redirect_uri: "http://localhost:3000/callback",
      };

      try {
        await client.getToken(tokenParams);
      } catch (error) {
        console.log("Access Token Error", error.message);
      }
    };

    run();
  } else {
    res.json({ error: "invalid" });
  }
};

@PageSetup.register
class SetupOAuthTokenController {
  initialise(): Router {
    const router = Router();
    router.post(pathName.public.OAUTH_TOKEN, postOAuthToken);

    return router;
  }
}

export { SetupOAuthTokenController, postOAuthToken };

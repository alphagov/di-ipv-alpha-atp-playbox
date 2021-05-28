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

import { Request, Response } from "express";
import { jwtSecret } from "../../../../../config";
import hashSessionId from "../../../../utils/hashSessionId";
import { getRedisClient } from "../../../../session";

const jwt = require("jsonwebtoken");
// This is the root route and will redirect back to the appropriate gov.uk start page
const postOAuthToken = (req: Request, res: Response): void => {
  if (
    req.body.code &&
    req.body.grant_type &&
    req.body.redirect_uri &&
    req.body.client_id
  ) {
    const redisClient = getRedisClient();
    // redisClient.set("test", "asofjadsfgsadoghsdoighfsdaif");
    /*
        copy from session -> against a user id
        map auth token to guid
        map access token against guid

        access token -> guid -> user data
     */
    // redisClient.get("sess:" + req.body.code, (err, value) => {
    //   console.log(value);
    // });
    // console.log(x);
    const access_token = jwt.sign(
      hashSessionId((Math.random() * 100000000).toString()),
      jwtSecret()
    );

    const refresh_token = jwt.sign(
      hashSessionId((Math.random() * 100000000).toString()),
      jwtSecret()
    );

    const authCode = req.body.code;
    redisClient.get("authcode:" + authCode, (err, userId) => {
      if (err) console.error(err);
      redisClient.set("accesstoken:" + access_token, userId);
    });

    const data = {
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires: "3600",
    };
    res.json(data);
  } else {
    res.json({
      error: "invalid_request",
      error_description: "Request was invalid.",
      error_uri:
        "See the full API docs at https://localhost:3000/docs/access_token",
    });
  }
};

export { postOAuthToken };

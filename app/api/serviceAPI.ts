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

import axios from "axios";
import { getServiceApiEndpoint, useAPI } from "../../config";
import Logger, { getLogLabel } from "../utils/logger";
import * as apiAuthentication from "./authentication";

let logger: Logger;

export function configure(config: { logger: Logger }): void {
  logger = config.logger;
}

export const getHeaders = (session_id: string): Record<string, string> => {
  if (useAPI()) {
    const authorization = apiAuthentication.getAuthorizationHeader();

    if (Object.keys(authorization).length === 0) {
      logger.error("Couldn't fetch auth header", getLogLabel(__filename), {
        session_id,
      });
    }

    return {
      "Content-Type": "application/json",
      ...authorization,
    };
  }
  return {
    "Content-Type": "application/json",
  };
};

export async function pingSevice(session_id: string): Promise<string> {
  if (useAPI()) {
    logger.info(`pinging service`, getLogLabel(__filename), { session_id });
    const result = await axios.get(`${getServiceApiEndpoint()}/ping`, {
      headers: await getHeaders(session_id),
    });
    return result.data;
  }
  throw Error("Cannot ping API");
}

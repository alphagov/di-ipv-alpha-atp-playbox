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

import Logger, { getLogLabel } from "../utils/logger";
import * as oidc from "openid-client";
import { Client, TokenSet } from "openid-client";
import { HealthCheckState } from "../health-check";
import {
  getDeclarationApiClientId,
  getDeclarationApiClientSecret,
  getDeclarationApiDiscoveryUri,
  useAPI,
} from "../../config";

let logger: Logger;
let apiTokenSet: TokenSet;
let count = 0;
let healthStatus: HealthCheckState;

export const getHealthState = async (): Promise<HealthCheckState> => {
  if (useAPI()) {
    if (healthStatus == HealthCheckState.UP) return HealthCheckState.UP;
    throw new Error("failed to fetch auth token more than 5 times");
  }
};

export const configure = (config: { logger: Logger }): void => {
  if (useAPI()) {
    healthStatus = HealthCheckState.DOWN;
    logger = config.logger;

    // set up a check to happen every minute
    const oneMinute = 60 * 1000;
    setInterval(refreshTokenIfRequired, oneMinute).unref();
  } else {
    healthStatus = HealthCheckState.UP;
  }
};

const tenMinutes = 10 * 60;
export const isTokenNullOrDueToExpire = (token: TokenSet): boolean =>
  !token || token.expires_in < tenMinutes;

export const getAuthorizationHeader = (): Record<string, string> => {
  if (useAPI()) {
    if (apiTokenSet && apiTokenSet.access_token) {
      return {
        Authorization: `Bearer ${apiTokenSet.access_token}`,
      };
    }
  }
  return {};
};

// Performs OIDC discovery
export const oidcDiscovery = async (): Promise<Client> => {
  if (useAPI) {
    // Increase the HTTP timeout to 10s and retry times to 5
    oidc.custom.setHttpOptionsDefaults({ timeout: 20000, retry: 3 });

    const discoveryUri = getDeclarationApiDiscoveryUri();
    const client_id = getDeclarationApiClientId();
    const client_secret = getDeclarationApiClientSecret();
    const issuer = await oidc.Issuer.discover(discoveryUri);

    return new issuer.Client({
      client_id,
      client_secret,
      response_types: ["code"],
    });
  }
  return null;
};

// Fetches a new token
const oidcFetchNewToken = async (oidcClient): Promise<TokenSet> => {
  if (useAPI()) {
    return await oidcClient.grant({
      grant_type: "client_credentials",
      scope: "declarations/user_write declarations/user_read",
    });
  }
  return null;
};

// Updates token with a new token and restores state
const updateNewToken = (retrievedTokenSet) => {
  if (useAPI()) {
    logger.info("Retrieved a token", "auth");
    // if successfully retrieved token, exit.
    if (retrievedTokenSet && !isTokenNullOrDueToExpire(retrievedTokenSet)) {
      // Update the token with the new token
      apiTokenSet = retrievedTokenSet;
      // restore the health state and the count
      healthStatus = HealthCheckState.UP;
      count = 0;
      return;
    }
    throw Error("retrieved token is null or due to expire");
  }
  return;
};

// check if process was unhealthy.
const checkIfUnhealthy = () => {
  if (useAPI()) {
    if (count >= 5) {
      // if attempted more than 5 times unsuccessfully, start responding down status.
      logger.warn(
        "Failed to fetch token 5 or more times, setting health check status to DOWN",
        getLogLabel(__filename)
      );
      healthStatus = HealthCheckState.DOWN;
    }
  }
};

export const refreshTokenIfRequired = async (): Promise<any> => {
  if (useAPI()) {
    if (!isTokenNullOrDueToExpire(apiTokenSet)) return;

    logger.info(
      "API auth token expired or due to expire - fetching new one",
      getLogLabel(__filename),
      {}
    );

    try {
      const oidcClient = await oidcDiscovery();
      const newToken = await oidcFetchNewToken(oidcClient);
      updateNewToken(newToken);
    } catch (error) {
      count++;
      logger.error("Failed to fetch a new token", getLogLabel(__filename), {
        error,
      });
    } finally {
      checkIfUnhealthy();
    }
  }
  return null;
};

export const setApiTokenSet = (tokenSet: TokenSet): TokenSet =>
  (apiTokenSet = tokenSet);

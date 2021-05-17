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

import * as authentication from "../authentication";
import { getAuthorizationHeader } from "../authentication";
import Logger from "../../utils/logger";
import { expect, sinon } from "../../../test/utils/testUtils";
import { Client, IdTokenClaims, Issuer, TokenSet } from "openid-client";
import { stubInterface } from "ts-sinon";
import Sinon, { SinonFakeTimers } from "sinon";
import { HealthCheckState } from "../../health-check";
import * as oidc from "openid-client";
import { useAPI } from "../../../config";

const inDateAccessToken: TokenSet = {
  claims(): IdTokenClaims {
    return undefined;
  },
  expired(): boolean {
    return false;
  },
  access_token: "some access token",
  expires_in: 3000,
};

describe("authentication", function () {
  if (!useAPI()) return;
  const logger: Logger = new Logger();
  let sandbox: sinon.SinonSandbox;
  let client: Client;
  let oidcDiscoveryStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    client = stubInterface<Client>();
  });

  afterEach(() => {
    if (oidcDiscoveryStub) oidcDiscoveryStub.restore();
    sandbox.restore();
  });

  describe("configure", () => {
    let clock: SinonFakeTimers;

    before("setup fake timers", () => {
      clock = sinon.useFakeTimers();
    });

    after("restore timers", () => {
      clock.restore();
    });

    it("should configure correctly", async () => {
      const refreshTokenStub = sandbox
        .stub(authentication, "refreshTokenIfRequired")
        .resolves();

      expect(clock.countTimers()).eql(0);

      authentication.configure({
        logger,
      });

      expect(refreshTokenStub).to.not.have.been.called;
      // assert that a timer was created
      expect(clock.countTimers()).eql(1);

      // move the clock forwards 1 minute
      clock.tick(60 * 1000);
      expect(refreshTokenStub).to.have.been.calledOnce;

      // move the clock forwards 1 minute again
      clock.tick(60 * 1000);
      expect(refreshTokenStub).to.have.been.calledTwice;
    });
  });

  describe("checkIfTokenExpired", () => {
    beforeEach("setup", () => {
      client.grant = sandbox
        .stub()
        .onCall(1)
        .rejects()
        .onCall(2)
        .rejects()
        .onCall(3)
        .rejects()
        .onCall(4)
        .rejects()
        .onCall(5)
        .rejects()
        .onCall(6)
        .resolves(inDateAccessToken);

      oidcDiscoveryStub = sandbox
        .stub(authentication, "oidcDiscovery")
        .resolves(client);

      authentication.configure({
        logger,
      });

      authentication.setApiTokenSet(undefined);
    });

    it("should do nothing if token is not null and not due to expire", async () => {
      const isTokenNullOrDueToExpireStub = sandbox
        .stub(authentication, "isTokenNullOrDueToExpire")
        .returns(false);

      await authentication.refreshTokenIfRequired();

      expect(isTokenNullOrDueToExpireStub).to.have.been.called;
      expect(client.grant).to.have.not.been.called;
    });

    it("should update the token with a new token if token is null", async () => {
      client.grant = sandbox.stub().returns(inDateAccessToken);

      await authentication.refreshTokenIfRequired();

      expect(client.grant).to.have.been.called;
      expect(await authentication.getHealthState()).eql(HealthCheckState.UP);
    });

    it("should set status to down if failing to fetch token", async () => {
      // first 4 tries should not set status to down.
      for (let i = 0; i < 4; i++) {
        await authentication.refreshTokenIfRequired();
        expect(client.grant).to.have.been.called;
      }

      // if failing 5 tries in a row, start panicking
      await authentication.refreshTokenIfRequired();
      expect(client.grant).to.have.been.called;

      try {
        await authentication.getHealthState();
      } catch (e) {
        expect(e.message).contain(
          "failed to fetch auth token more than 5 times"
        );
      }
    });

    it("should restore health state once successfully retrieved token", async () => {
      // failing first 4
      for (let i = 0; i < 6; i++) {
        await authentication.refreshTokenIfRequired();
        expect(client.grant).to.have.been.called;
      }

      // failing 5th try would set status to down
      try {
        await authentication.getHealthState();
      } catch (e) {
        expect(e.message).contain(
          "failed to fetch auth token more than 5 times"
        );
      }

      // recovering 6th try
      await authentication.refreshTokenIfRequired();
      expect(client.grant).to.have.been.called;
      expect(await authentication.getHealthState()).eql(HealthCheckState.UP);
    });
  });

  describe("getAuthorizationHeader", () => {
    beforeEach("setup", () => {
      authentication.configure({
        logger,
      });
      authentication.setApiTokenSet(undefined);
    });

    it("should return an authorization header", async () => {
      client.grant = sandbox.stub().returns(inDateAccessToken);
      oidcDiscoveryStub = sandbox
        .stub(authentication, "oidcDiscovery")
        .resolves(client);

      await authentication.refreshTokenIfRequired();

      expect(client.grant).to.have.been.called;
      const authHeader = await getAuthorizationHeader();
      expect(authHeader["Authorization"]).eql(
        "Bearer " + inDateAccessToken.access_token
      );
    });

    it("should return an error if token is null", async () => {
      try {
        await authentication.getAuthorizationHeader();
      } catch (e) {
        expect(e).eql("Token is null");
      }
    });
  });

  describe("oidcDiscovery", () => {
    let oidcSetHttpDefaultsStub;
    let clientStub: Sinon.SinonStubStatic;
    let oidcDiscoverStub: Sinon.SinonStub<[string], Promise<Issuer<Client>>>;

    before("setup", () => {
      oidcSetHttpDefaultsStub = sinon.stub(
        oidc.custom,
        "setHttpOptionsDefaults"
      );
      clientStub = sinon.stub().returns({
        get: sinon.stub(),
        set: sinon.stub().returns(true),
      } as Partial<Client>);
    });

    beforeEach(() => {
      oidcDiscoverStub = sandbox
        .stub(oidc.Issuer, "discover")
        .resolves({ Client: clientStub } as any);
    });

    afterEach(() => {
      if (oidcDiscoveryStub) oidcDiscoveryStub.restore();
    });

    it("should return with a valid client promise", async () => {
      const client = await authentication.oidcDiscovery();

      expect(oidcSetHttpDefaultsStub).to.have.been.called;
      expect(oidcDiscoverStub).to.have.been.called;
      expect(client).to.not.be.undefined;
    });

    it("should reject promise if discovery fails", async () => {
      oidcDiscoverStub.restore();
      oidcDiscoverStub = sinon
        .stub(oidc.Issuer, "discover")
        .rejects("failed to discover OIDC client");

      try {
        await authentication.oidcDiscovery();
      } catch (e) {
        expect(e.name).contain("failed to discover OIDC client");
      }

      expect(oidcSetHttpDefaultsStub).to.have.been.called;
      expect(oidcDiscoverStub).to.have.been.called;
    });

    it("should crash if a missing client secret in the process.env", async () => {
      process.env.DECLARATION_API_AUTH_CLIENT_ID = "test";
      process.env.DISCOVERY_ENDPOINT = "http://localhost";

      try {
        await authentication.oidcDiscovery();
      } catch (e) {
        expect(e.message).equals("Missing api client secret in env file");
      }
    });

    it("should crash if a missing client id in the process.env", async () => {
      process.env.DECLARATION_API_AUTH_CLIENT_SECRET = "test";
      process.env.DISCOVERY_ENDPOINT = "http://localhost";

      try {
        await authentication.oidcDiscovery();
      } catch (e) {
        expect(e.message).equals("Missing api client id in env file");
      }
    });
  });
});

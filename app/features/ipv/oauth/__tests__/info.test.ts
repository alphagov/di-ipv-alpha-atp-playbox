import { SetupOAuthTokenController, postOAuthToken } from "../token/index";
import { pathName } from "../../../../paths";
import { expect, sinon } from "../../../../../test/utils/testUtils";

const express = require("express");

describe("IPV Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("setupIPVController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupOAuthTokenController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.OAUTH_TOKEN,
        postOAuthToken
      );
    });
  });
});

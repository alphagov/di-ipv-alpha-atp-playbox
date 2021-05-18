import { SetupUserinfoController, getUserInfo } from "../controller";
import { pathName } from "../../../../paths";
import { expect, sinon } from "../../../../../test/utils/testUtils";

const express = require("express");

describe("userinfo Controller", function () {
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

      new SetupUserinfoController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.USER_INFO,
        getUserInfo
      );
    });
  });
});

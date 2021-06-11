import {
  SetupCurrentAccountLastOpenedController,
  getCurrentAccountLastOpened,
} from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Current Account Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("setupCurrentAccountController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupCurrentAccountLastOpenedController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.CURRENT_ACCOUNT_LAST_OPENED,
        getCurrentAccountLastOpened
      );
    });
  });
});

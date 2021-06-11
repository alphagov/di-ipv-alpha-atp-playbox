import {
  SetupbankAccountLastOpenedController,
  getbankAccountLastOpened,
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

  describe("setupbankAccountController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupbankAccountLastOpenedController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.CURRENT_ACCOUNT_CVV,
        getbankAccountLastOpened
      );
    });
  });
});

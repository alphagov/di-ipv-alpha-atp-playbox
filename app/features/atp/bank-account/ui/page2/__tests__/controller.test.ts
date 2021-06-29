import { SetupBankAccountCVVController, getBankAccountCVV } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Bank Account CVV Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("SetupBankAccountCVVController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupBankAccountCVVController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.CURRENT_ACCOUNT_CVV,
        getBankAccountCVV
      );
    });
  });
});

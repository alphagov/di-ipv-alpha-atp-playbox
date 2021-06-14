import { SetupBankAccountPostcodeController, getBankAccountPostcode } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Bank Account Postcode Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("SetupBankAccountPostcodeController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupBankAccountPostcodeController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.CURRENT_ACCOUNT_POSTCODE,
        getBankAccountPostcode
      );
    });
  });
});

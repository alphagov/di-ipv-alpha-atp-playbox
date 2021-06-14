import { SetupPassportController, getPassport } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Passport Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("SetupPassportController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupPassportController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.PASSPORT_START,
        getPassport
      );
    });
  });
});

import { SetupStartController, getStart } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Passport Start Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("setupStartController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupStartController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.PASSPORT_START,
        getStart
      );
    });
  });
});

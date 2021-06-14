import { SetupInfoController, getInfo } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Info Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("setupInfoController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupInfoController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.INFO,
        getInfo
      );
    });
  });
});

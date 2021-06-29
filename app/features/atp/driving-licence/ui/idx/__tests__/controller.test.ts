import { SetupDrivingLicenceController, getDrivingLicence } from "..";
import { pathName } from "../../../../../../paths";
import { expect, sinon } from "../../../../../../../test/utils/testUtils";

const express = require("express");

describe("Driving Licence Controller", function () {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    process.env.ENVIRONMENT = undefined;
    sandbox.restore();
  });

  describe("SetupDrivingLicenceController", () => {
    it("should setup the routes", () => {
      const routerGetStub: sinon.SinonStub = sandbox.stub(
        express.Router,
        "get"
      );

      new SetupDrivingLicenceController().initialise();
      expect(routerGetStub).to.have.been.calledWith(
        pathName.public.DRIVING_LICENCE_START,
        getDrivingLicence
      );
    });
  });
});

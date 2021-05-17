import * as declarationService from "../serviceAPI";
import * as authentication from "../authentication";
import Logger from "../../utils/logger";
import { expect, sinon } from "../../../test/utils/testUtils";
import { useAPI } from "../../../config";

describe("declarationsService", function () {
  if (!useAPI()) return;
  const logger: Logger = new Logger();
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getHeaders", () => {
    declarationService.configure({
      logger,
    });
    const authorization = {
      Authorization: "Bearer testToken",
    };
    const expectedHeaders = {
      "Content-Type": "application/json",
      ...authorization,
    };
    it("should resolve with correct headers", async () => {
      sandbox
        .stub(authentication, "getAuthorizationHeader")
        .returns(authorization);

      const returnedHeaders = await declarationService.getHeaders("session-id");
      expect(authentication.getAuthorizationHeader).to.have.been.calledOnce;
      expect(returnedHeaders, "headers match expected").eql(expectedHeaders);
    });
    it("throws error if headers failed to resolve", async () => {
      sandbox.stub(authentication, "getAuthorizationHeader").returns({});

      try {
        await declarationService.getHeaders("session-id");
      } catch (e) {
        expect(e.message).eql("Failed to fetch auth header");
        expect(authentication.getAuthorizationHeader).to.have.been.calledOnce;
      }
    });
  });
});

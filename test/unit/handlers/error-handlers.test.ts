import { NextFunction, Request, Response } from "express";
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "http-status-codes";

import {
  pageNotFoundHandler,
  serverErrorHandler,
} from "../../../app/handlers/error-handlers";
import { pathName } from "../../../app/paths";
import Logger from "../../../app/utils/logger";
import { expect, sinon } from "../../utils/testUtils";

describe("Error Handler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  const logger: Logger = new Logger();

  beforeEach(() => {
    req = {
      app: {
        locals: {
          logger,
        },
      } as any,
    } as Partial<Request>;
    req.sessionID = "session_id";
    res = {
      status: sinon.spy(),
      render: sinon.spy(),
      redirect: sinon.spy(),
      send: sinon.spy(),
      type: sinon.spy(),
    } as Partial<Response>;
  });

  describe("pageNotFoundHandler", () => {
    it("gives 404 page in HTML", () => {
      pageNotFoundHandler(req as Request, res as Response, next);

      expect(res.status).to.have.been.calledOnce.calledWith(NOT_FOUND);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        pathName.public.ERROR404
      );
    });
  });

  describe("serverErrorHandler", () => {
    it("gives 500 page in html", () => {
      req.headers = { accept: "text/html" };
      const err = new Error("Service is unavailable");

      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(
        INTERNAL_SERVER_ERROR
      );
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        pathName.public.ERROR500
      );
    });

    it("renders session-timeout page", () => {
      req.headers = { accept: "text/html" };
      const err = new Error("Service is unavailable");
      err["code"] = "EBADCSRFTOKEN";
      serverErrorHandler(err, req as Request, res as Response, next);
      expect(res.status).to.have.been.calledOnce.calledWith(OK);
      expect(res.redirect).to.have.been.calledOnce.calledWith(
        pathName.public.TIMEOUT
      );
    });
  });
});

export {};

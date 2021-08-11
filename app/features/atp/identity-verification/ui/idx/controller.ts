import { Request, Response, Router } from "express";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import Logger from "../../../../../utils/logger";

const template = "atp/identity-evidence/ui/idx/view.njk";
const logger: Logger = new Logger();

interface IdentityVerification {
  type: any;
  verificationData: any;
}

const getIdentityVerificationPage = (req: Request, res: Response): void => {
  return res.render(template, { language: req.i18n.language });
};

const getJsonFromString = (data: string): Record<string, any> => {
  try {
    return JSON.parse(data);
  } catch (e) {
    logger.warn(`Failed to parse json data: ${e}`, "failed-parsing-json");
    return {};
  }
};

const postIdentityVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const verificationData = getJsonFromString(req.body["verificationData"]);

  const identityVerification: IdentityVerification = {
    type: req.body["type"],
    verificationData: verificationData,
  };

  req.session.sessionData.identityVerification =
    req.session.sessionData.identityVerification || [];
  req.session.sessionData.identityVerification.push(identityVerification);
  res.redirect("/ipv/next?source=identity-verification");
};

@PageSetup.register
class SetupIdentityVerificationController {
  initialise(): Router {
    const router = Router();
    router.get(
      pathName.public.IDENTITY_VERIFICATION,
      getIdentityVerificationPage
    );
    router.post(
      pathName.public.IDENTITY_VERIFICATION,
      postIdentityVerification
    );
    return router;
  }
}

export { SetupIdentityVerificationController, getIdentityVerificationPage };

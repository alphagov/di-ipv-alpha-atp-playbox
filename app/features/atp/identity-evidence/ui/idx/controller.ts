import { Request, Response, Router } from "express";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import { postIdentityEvidenceToEvidenceAtp } from "../../api";
import * as jwt from "jsonwebtoken";
import Logger from "../../../../../utils/logger";

const template = "atp/identity-evidence/ui/idx/view.njk";
const logger: Logger = new Logger();

const getIdentityEvidencePage = (req: Request, res: Response): void => {
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

const postIdentityEvidence = async (
  req: Request,
  res: Response
): Promise<void> => {
  const attributes = getJsonFromString(req.body["attributes"]);
  const atpResponseJws = await postIdentityEvidenceToEvidenceAtp(attributes);

  const identityEvidence: IdentityEvidence = {
    type: req.body["type"],
    strength: req.body["strength"],
    validity: req.body["validity"],
    attributes: attributes,
    atpResponse: jwt.decode(atpResponseJws),
    jws: atpResponseJws,
  };

  req.session.sessionData.identityEvidence =
    req.session.sessionData.identityEvidence || [];
  req.session.sessionData.identityEvidence.push(identityEvidence);
  res.redirect("/ipv/next?source=identity-evidence");
};

@PageSetup.register
class SetupIdentityEvidenceController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.IDENTITY_EVIDENCE, getIdentityEvidencePage);
    router.post(pathName.public.IDENTITY_EVIDENCE, postIdentityEvidence);
    return router;
  }
}

export { SetupIdentityEvidenceController, getIdentityEvidencePage };

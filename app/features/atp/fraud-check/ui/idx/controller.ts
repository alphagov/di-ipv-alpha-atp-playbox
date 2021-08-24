import { Request, Response, Router } from "express";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import Logger from "../../../../../utils/logger";

const template = "atp/fraud-check/ui/idx/view.njk";
const logger: Logger = new Logger();

interface FraudCheck {
  fraudCheckScore?: any;
  fraudCheckData: any;
}

const getFraudCheckPage = (req: Request, res: Response): void => {
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

const postFraudCheck = async (req: Request, res: Response): Promise<void> => {
  const fraudCheckData = getJsonFromString(req.body["fraudCheckData"]);
  const fraudCheckScore = getJsonFromString(req.body["fraudCheckScore"]);

  const fraudCheck: FraudCheck = {
    fraudCheckData: fraudCheckData,
    fraudCheckScore: fraudCheckScore
  };

  req.session.sessionData.fraudChecks =
    req.session.sessionData.fraudChecks || [];
  req.session.sessionData.fraudChecks.push(fraudCheck);
  logger.info(
    "Pushed fraud check data to session data in redis",
    "fraud-check"
  );
  res.redirect("/ipv/next?source=fraud-check");
};

@PageSetup.register
class SetupFraudCheckController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.FRAUD_CHECK, getFraudCheckPage);
    router.post(pathName.public.FRAUD_CHECK, postFraudCheck);
    return router;
  }
}

export { SetupFraudCheckController, getFraudCheckPage };

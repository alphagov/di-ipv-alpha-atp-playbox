import { Request, Response, Router } from "express";
import { PageSetup } from "../../../../../interfaces/PageSetup";
import { pathName } from "../../../../../paths";
import Logger from "../../../../../utils/logger";

const template = "atp/activity-history/ui/idx/view.njk";
const logger: Logger = new Logger();

interface ActivityHistory {
  activityHistoryScore?: any;
  activityHistoryData: any;
}

const getActivityHistoryPage = (req: Request, res: Response): void => {
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

const postActivityHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const activityHistoryData = getJsonFromString(
    req.body["activityHistoryData"]
  );

  const activityHistoryScore = getJsonFromString(
    req.body["activityHistoryScore"]
  );

  const activityHistory: ActivityHistory = {
    activityHistoryScore: activityHistoryScore,
    activityHistoryData: activityHistoryData,
  };

  req.session.sessionData.activityChecks =
    req.session.sessionData.activityChecks || [];
  req.session.sessionData.activityChecks.push(activityHistory);
  logger.info(
    "Pushed activity history data to session data in redis",
    "activity-history"
  );
  res.redirect("/ipv/next?source=activity-history");
};

@PageSetup.register
class SetupActivityHistoryController {
  initialise(): Router {
    const router = Router();
    router.get(pathName.public.ACTIVITY_HISTORY, getActivityHistoryPage);
    router.post(pathName.public.ACTIVITY_HISTORY, postActivityHistory);
    return router;
  }
}

export { SetupActivityHistoryController, getActivityHistoryPage };

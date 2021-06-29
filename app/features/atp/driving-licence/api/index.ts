import axios from "axios";
import { getDrivingLicenceAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postDrivingLicenceAPI(data: any): Promise<any> {
  const result = await axios.post(getDrivingLicenceAPI(), data);
  const decoded = jwt.decode(result.data);
  // TODO: add this in the ATP
  data.validation = {
    genericDataVerified: decoded.genericDataVerified,
  };
  data.evidence = {
    strength: 2,
    validity: 2,
  };
  data.scores = {
    activityHistory: 0,
    identityFraud: 0,
    verification: 1,
  };
  return data;
}

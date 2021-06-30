import axios from "axios";
import { getPassportAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postPassportAPI(data: any): Promise<any> {
  const result = await axios.post(getPassportAPI(), data);
  const decoded = jwt.decode(result.data);
  data.validation = {
    ...decoded,
  };
  // TODO: add this in the ATP
  data.evidence = {
    strength: 4,
    validity: 4,
  };
  data.scores = {
    activityHistory: 1,
    identityFraud: 0,
    verification: 1,
  };
  return data;
}

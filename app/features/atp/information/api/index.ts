import axios from "axios";
import { getBasicInfoAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postBasicInfoJSON(data: any): Promise<any> {
  const result = await axios.post(getBasicInfoAPI(), data);
  const decoded = jwt.decode(result.data);
  data.validation = {
    genericDataVerified: decoded.genericDataVerified,
  };
  data.evidence = {
    strength: 1,
    validity: 1,
  };
  data.scores = {
    history: 0,
    fraud: 0,
    verification: 1,
  };
  return data;
}

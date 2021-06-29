import axios from "axios";
import { getGenericJSONAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postGenericJSON(data: any): Promise<any> {
  const result = await axios.post(getGenericJSONAPI(), data);
  const decoded = jwt.decode(result.data);
  data["validation"] = { genericDataVerified: decoded.genericDataVerified };
  return data;
}

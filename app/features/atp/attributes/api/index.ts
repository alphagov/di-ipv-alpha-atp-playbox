import axios from "axios";
import { getAttributesAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postAttributesCall(data: any): Promise<any> {
  const result = await axios.post(getAttributesAPI(), data);
  const decoded = jwt.decode(result.data);
  data["validation"] = { genericDataVerified: decoded.genericDataVerified };
  return data;
}

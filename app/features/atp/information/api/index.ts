import axios from "axios";
import { getBasicInfoAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postBasicInfoJSON(data: any): Promise<any> {
  const result = await axios.post(getBasicInfoAPI(), data);
  const decoded = jwt.decode(result.data);
  return result.data;
}

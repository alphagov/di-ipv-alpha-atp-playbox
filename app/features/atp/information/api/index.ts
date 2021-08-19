import axios from "axios";
import { getBasicInfoAPI } from "./config";

export async function postBasicInfoJSON(data: any): Promise<any> {
  const result = await axios.post(getBasicInfoAPI(), data);
  return result.data;
}

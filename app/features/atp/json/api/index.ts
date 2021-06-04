import axios from "axios";
import { getGenericJSONAPI } from "./config";

export async function postGenericJSON(data: any): Promise<any> {
  const result = await axios.post(getGenericJSONAPI(), data);
  return result.data;
}

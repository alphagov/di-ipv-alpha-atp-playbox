import axios from "axios";
import { getCurrentAccountAPI } from "./config";

export async function postCurrentAccountJSON(data: any): Promise<any> {
  const result = await axios.post(getCurrentAccountAPI(), data);
  return result.data;
}

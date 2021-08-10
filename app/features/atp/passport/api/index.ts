import axios from "axios";
import { getPassportAPI } from "./config";

export async function postPassportAPI(data: any): Promise<any> {
  const result = await axios.post(getPassportAPI(), data);
  return result.data;
}

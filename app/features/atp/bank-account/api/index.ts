import axios from "axios";
import { getbankAccountAPI } from "./config";

export async function postbankAccountJSON(data: any): Promise<any> {
  const result = await axios.post(getbankAccountAPI(), data);
  return result.data;
}

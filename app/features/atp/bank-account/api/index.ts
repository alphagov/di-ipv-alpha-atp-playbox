import axios from "axios";
import { getBankAccountAPI } from "./config";

export async function postBankAccountJSON(data: any): Promise<any> {
  const result = await axios.post(getBankAccountAPI(), data);
  return result.data;
}

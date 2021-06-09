import axios from "axios";
import { getDrivingLicenceAPI } from "./config";

export async function postDrivingLicence(data: any): Promise<any> {
  const result = await axios.post(getDrivingLicenceAPI(), data);
  return result.data;
}

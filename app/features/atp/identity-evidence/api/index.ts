import axios from "axios";
import { getGenericAtpServiceEndpoint } from "./config";

export const postIdentityEvidenceToEvidenceAtp = async (
  data: any
): Promise<any> => {
  const response = await axios.post(getGenericAtpServiceEndpoint(), data);
  return response.data;
};

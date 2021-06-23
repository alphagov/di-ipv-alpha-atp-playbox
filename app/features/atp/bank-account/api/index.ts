import axios from "axios";
import { getBankAccountAPI } from "./config";
const jwt = require("jsonwebtoken");

export async function postBankAccountJSON(data: any): Promise<any> {
  const result = await axios.post(getBankAccountAPI(), data);
  const decoded = jwt.decode(result.data);
  data["validation"] = {
    genericDataVerified: decoded.genericDataVerified,
  };
  switch (data.lastOpened) {
    case "moreThan5Years": {
      data["evidence"] = {
        strength: 3,
        validity: 3,
      };
      break;
    }
    case "between3And5Years": {
      data["evidence"] = {
        strength: 3,
        validity: 2,
      };
      break;
    }
    case "between1And3Years": {
      data["evidence"] = {
        strength: 2,
        validity: 2,
      };
      break;
    }
    case "lessThan1Year": {
      data["evidence"] = {
        strength: 1,
        validity: 1,
      };
      break;
    }
    case "never": {
      data["evidence"] = {
        strength: 0,
        validity: 0,
      };
      break;
    }
  }
  data["scores"] = {
    history: data.evidence.strength,
    fraud: 1,
    verification: 1,
  };
  return data;
}

/* eslint-disable no-console */
export class Engine extends Object {
  start = (req: Express.Request): string => {
    req.session.engine = {};
    const url = "/ipv/info";
    return url;
  };
  next = (source: string, values: any, req: Express.Request): string => {
    console.log("engine", req.session.engine);
    console.log("values", values);
    const url = "/passport";
    return url;
  };
}

import { NextFunction, Request, Response } from "express";
import { logEvents } from "../utils/logToFiles";
import {
  UserJwtPayload,
  UserRequest,
} from "../userRequestTypes/userRequest.types";
import jwt from "jsonwebtoken";

/**
 * Request handler middleware, which logs to a file all the request that are made by the users.
 * @param req
 * @param res
 * @param next
 */
export function requestHandler(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader: string =
    req.headers.authorization || (req.headers.Authorization as string);

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer" + " ")) {
    logEvents(
      `${req.method}\t${req.url}\t${req.headers.origin}\t${req.ip}`,
      "requestLogs.log"
    );
  } else {
    // get the access token from the authorization header. The authorization header must be of the form "Bearer" + " " + token
    const accessToken = authorizationHeader.split(" ")[1];

    // verify the access token and decode its signed/encrypted properties
    const decodedUserInformation = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as UserJwtPayload;

    // add the id and the roles of the user making the request to the request object.
    req.user_id = decodedUserInformation.user_id;
    req.user_roles = decodedUserInformation.user_roles;

    logEvents(
      `${req.method}\t${req.url}\t${req.headers.origin}\t${req.ip}\t${req.user_id}\t${req.user_roles}`,
      "requestLogs.log"
    );
  }

  next();
}

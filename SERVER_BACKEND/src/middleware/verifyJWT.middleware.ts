import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import {
  UserJwtPayload,
  UserRequest,
} from "../userRequestTypes/userRequest.types";

/**
 * Verifies if the access token (JSON Web Token (JWT)) is valid.
 * The access token signs/encrypts the id and the roles of the user making the request.
 * If the JWT is valid, the user is authorized to make the request, otherwise it is not authorized.
 */
export async function verifyJWT(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // verify authorization headers
    // consider both cases: sometimes the header is called `authorization`, sometimes the header is called `Authorization`
    const authorizationHeader: string =
      req.headers.authorization || (req.headers.Authorization as string);

    if (!authorizationHeader.startsWith("Bearer" + " ")) {
      return res.sendStatus(401);
    }

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

    // go to the next middleware in line(or to the next route)
    next();
  } catch (error) {
    console.log(error);

    res.sendStatus(403);
  }
}

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import validator from "validator";
import {
  getUserByRefreshTokenDB,
  getUserByEmailDB,
  saveUserDB,
  updateUserRefreshTokensDB,
  getUserByIdDB,
} from "../services/auth.service";
import { sanitizeUserInput } from "../utils/sanitizeUserInput";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserJwtPayload } from "../userRequestTypes/userRequest.types";

/**
 * @description Registers a user
 * @route POST /api/auth/register
 * @access public - user does not have to be logged in to access the route
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // get email and password from the user
    const userInput = sanitizeUserInput(req.body) as User;

    const email: string = userInput.email;
    const password: string = userInput.user_password;
    const userName: string = userInput.user_name;
    const realName: string = userInput.real_name;

    if (!email) {
      return res.status(400).json({ error: "Email is missing!" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is missing!" });
    }

    if (!userName) {
      return res.status(400).json({ error: "Username  is missing!" });
    }

    if (!realName) {
      return res.status(400).json({ error: "Real name  is missing!" });
    }

    // validate email and password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email is not valid!" });
    }

    if (password.length < 12) {
      return res.status(400).json({
        error: "Password must contain at least 12 characters!",
      });
    }

    // this validator allows passwords with only 8 characters
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must include small letters, capital letters, numbers and special characters!",
      });
    }

    const emailAlreadyExists = await getUserByEmailDB(email);
    if (emailAlreadyExists) {
      return res.status(409).json({ error: "Email alredy exists!" });
    }

    // hash the user password using bcrypt
    const salt: string = await bcrypt.genSalt(12);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    await saveUserDB(email, hashedPassword, userName, realName);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 * @description Allows a user to log in
 * @route POST /api/auth/login
 * @access public - user does not have to be logged in to access the route
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = req.cookies;

    // get email and password from the user
    const userInput = sanitizeUserInput(req.body) as User;
    const email: string = userInput.email;
    const password: string = userInput.user_password;

    if (!email) {
      return res.status(400).json({ error: "Email required!" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password required!" });
    }

    const user: User = await getUserByEmailDB(email);

    if (!user) {
      return res.status(401).json({ error: "Email does not exist!" });
    }

    // evaluate password match
    const passwordsMatch: boolean = await bcrypt.compare(
      password,
      user.user_password
    );

    if (!passwordsMatch) {
      return res.status(401).json({ error: "Wrong passoword!" });
    }

    // generate an access token and a refresh token
    const accessToken: string = generateAccessToken(user.user_id, user.roles);

    // generate a refresh token each time the user logs in on a device
    const newRefreshToken: string = generateRefreshToken(user.user_id);

    const newRefreshTokenArray = !cookies.refreshToken
      ? user.refresh_tokens
      : user.refresh_tokens.filter((rt: string) => rt !== cookies.refreshToken);

    if (cookies.refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.ENVIRONMENT === "production",
        // domain: "http://localhost:5173",
        // path: "/api/auth/login",
      });
    }
    const userRefreshTokens = [...newRefreshTokenArray, newRefreshToken];
    await updateUserRefreshTokensDB(userRefreshTokens, user.user_id);

    // Creates Secure Cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      secure: process.env.ENVIRONMENT === "production",
      httpOnly: true,
      sameSite: "strict",
      // domain: "http://localhost:5173/",
      // path: "api/auth/login",
      maxAge: 24 * 60 * 60 * 1000, // one day
    });

    // want to send all the user properties to the client except password and refresh tokens
    const { user_password, refresh_tokens, ...otherUserProperties } = user;

    // Send the user and the access token to client.
    res
      .status(200)
      .json({ user: otherUserProperties, accessToken: accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * @description Logs a user out (TODO: also clear accessToken on the client)
 * @route POST /api/auth/logout
 */
export async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cookies = req.cookies;
  // console.log(cookies); // Output: {refreshToken: "..."}
  if (!cookies.refreshToken) {
    // 204 status: the server has successfully processed the request, but it is not returning any content
    return res.sendStatus(204);
  }
  const refreshToken: string = cookies.refreshToken;

  try {
    // if refresh token is not in the db but we still have a cookie, delete the cookie
    const user: User = await getUserByRefreshTokenDB(refreshToken);
    if (!user) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.ENVIRONMENT === "production",
        // domain: "http://localhost:5173",
        // path: "/api/auth/logout",
      });

      // 204 status: the server has successfully processed the request, but it is not returning any content
      return res.sendStatus(204);
    }

    // Delete the current refreshToken from the db
    const userRefreshTokens: string[] = user.refresh_tokens.filter(
      (rt: string) => rt !== refreshToken
    );
    await updateUserRefreshTokensDB(userRefreshTokens, user.user_id);

    // Delete the current cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.ENVIRONMENT === "production",
      // domain: "http://localhost:5173",
      // path: "/api/auth/logout",
    });

    // res.status(200).json({message: "Cookie cleared!"});
    // 204 status: the server has successfully processed the request, but it is not returning any content
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}

/**
 *
 * @description if the access token is expired and the refresh token is not expired, it will create a new access token
 * @route GET /api/auth/refresh
 * @access public the user does not have to be logged in to access the route
 */
export async function refreshAccessToken(req: Request, res: Response) {
  const cookies = req.cookies;
  if (!cookies.refreshToken) {
    return res.sendStatus(401);
  }
  const refreshToken: string = cookies.refreshToken;
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  const user: User = await getUserByRefreshTokenDB(refreshToken);

  // Detected refresh token reuse!
  if (!user) {
    try {
      const decodedUserInfo = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as UserJwtPayload;
      console.log("attempted refresh token reuse!");
      const hackedUser = await getUserByIdDB(decodedUserInfo.userid);

      const userRefreshTokens: string[] = [];
      await updateUserRefreshTokensDB(userRefreshTokens, hackedUser.user_id);
    } catch (error) {
      return res.sendStatus(403);
    }
    return res.sendStatus(403); //Forbidden
  }

  const newRefreshTokenArray: string[] = user.refresh_tokens.filter(
    (rt: string) => rt !== refreshToken
  );

  // evaluate jwt
  try {
    const decodedUserInfo = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as UserJwtPayload;

    if (user.user_id !== decodedUserInfo.user_id) {
      return res.sendStatus(403);
    }

    // Refresh token was still valid
    const newAccessToken = generateAccessToken(user.user_id, user.roles);
    const newRefreshToken = generateRefreshToken(user.user_id);
    const userRefreshTokens = [...newRefreshTokenArray, newRefreshToken];

    // console.log("updating refresh tokens...");
    await updateUserRefreshTokensDB(userRefreshTokens, user.user_id);

    // Creates Secure Cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // want to send all the user properties to the client except password and refresh tokens
    const { user_password, refresh_tokens, ...otherUserProperties } = user;
    // send the user properties and the new access token
    res
      .status(200)
      .json({ user: otherUserProperties, newAccessToken: newAccessToken });
  } catch (error) {
    console.log("expired refresh token");
    const userRefreshTokens = [...newRefreshTokenArray];
    await updateUserRefreshTokensDB(userRefreshTokens, user.user_id);
    return res.sendStatus(403);
  }
}

/**
 *
 * @param userId the id of the user which logs in
 * @param roles the roles of the user which logs in
 * @returns a JSON Web Token (access token) that signs/encrypts a JSON object (the payload).
 * The object contains the id and the roles of the user making the request.
 * The access token is has a short live span and expires in 1 minute.
 *
 * IMPORTANT: make sure the UserJwtPayload interface must have the same properties as the payload object encrypted here!
 *
 */
function generateAccessToken(userId: string, roles: string[]): string {
  return jwt.sign(
    {
      user_id: userId,
      user_roles: roles,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "300s",
      // expiresIn: "10s",
    }
  );
}

/**
 *
 * @param userId the id of the user which logs in
 * @returns a JSON Web Token (refresh token) that signs/encrypts a JSON object (the payload).
 * The object contains the id of the user making the request.
 * The refresh token has a longer life span and expires in 1 day .
 *
 * IMPORTANT: make sure the UserJwtPayload interface must have the same properties as the payload object encrypted here!
 *
 */
function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      user_id: userId,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
      // expiresIn: "30s",
    }
  );
}

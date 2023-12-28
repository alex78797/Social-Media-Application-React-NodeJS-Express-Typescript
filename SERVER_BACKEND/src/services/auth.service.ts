import { pool } from "../config/postgreSQL.config";
import { User } from "../models/user.model";

/**
 * SQL code that retreives the user with the given email from the database
 * @param email the email of the user
 * @returns
 */
export async function getUserByEmailDB(email: string): Promise<User> {
  const sqlQuery = "SELECT * FROM users WHERE email = $1";
  const user = await pool.query(sqlQuery, [email]);
  return user.rows[0];
}

/**
 * SQL code that updates the refresh token array of the user with the given id
 * @param refreshTokens
 * @param userId
 */
export async function updateUserRefreshTokensDB(
  refreshTokens: string[],
  userId: string
): Promise<void> {
  const sqlQuery = "UPDATE users SET refresh_tokens = $1 WHERE user_id = $2 ";
  await pool.query(sqlQuery, [refreshTokens, userId]);
}

/**
 * SQL code that inserts a new user in the database
 * @param email
 * @param passoword
 * @param userName
 * @param realName
 */
export async function saveUserDB(
  email: string,
  passoword: string,
  userName: string,
  realName: string
): Promise<void> {
  const sqlQuery =
    "INSERT INTO users (email, user_password, user_name, real_name) VALUES ($1, $2, $3, $4)";
  await pool.query(sqlQuery, [email, passoword, userName, realName]);
}

/**
 * SQL code that retreives the user wtih the given refresh token from the database
 * @param refreshToken
 * @returns
 */
export async function getUserByRefreshTokenDB(
  refreshToken: string
): Promise<User> {
  const sqlQuery = "SELECT * FROM users WHERE $1 =  ANY(refresh_tokens)";
  const user = await pool.query(sqlQuery, [refreshToken]);
  return user.rows[0];
}

/**
 * SQL code that retreives the user with the given id from the database
 * @param userId 
 * @returns 
 */
export async function getUserByIdDB(userId: string): Promise<User> {
  const sqlQuery = "SELECT * FROM users WHERE user_id = $1";
  const user = await pool.query(sqlQuery, [userId]);
  return user.rows[0];
}

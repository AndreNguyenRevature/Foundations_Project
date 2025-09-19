import userDAO from "../repository/userDAO.js";
import bcrypt from "bcrypt";
import { logger } from "../util/logger.js";
import tryCatch from "../util/tryCatch.js";
import HttpError from "../util/error.js";
import jwt from "jsonwebtoken";
import key from "../util/key.js";

async function validateUserCreation(username) {
  const { data, err } = await tryCatch(getUserByName(username));
  if (err) throw err;

  if (data !== null) throw new HttpError("Username already taken!", 409);
  return true;
}

const checkRole = (role) => (role === "manager" ? "manager" : "employee");

async function createUser(user) {
  await validateUserCreation(user.username);

  const SALT_ROUNDS = 10;
  const { data: password, err } = await tryCatch(
    bcrypt.hash(user.password, SALT_ROUNDS)
  );
  if (err) throw err;

  const { data, err: error } = await tryCatch(
    userDAO.createUser({
      username: user.username,
      password,
      role: user.role,
    })
  );

  if (error) throw error;

  logger.info(`User created ${user.username}`);
  return data;
}

async function getUserByName(username) {
  if (!username) return null;

  const user = await userDAO.getUser(username);
  logger.info(user ? `User: ${username} Found.` : `Could not find ${username}`);
  return user || null;
}

async function deleteUser(username) {
  const result = await userDAO.deleteUser(username);
}

async function login(username, password) {
  if (!username || !password) {
    throw new HttpError("Login attempt with missing credentials", 400);
  }

  const user = await getUserByName(username);
  if (!user) {
    throw new HttpError(`Login failed: username not found`, 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new HttpError(`Login failed: incorrect password`, 401);
  }

  const token = jwt.sign(
    {
      username,
      role: user.role,
    },
    key,
    { expiresIn: "15m" }
  );

  logger.info(`Login successful for user "${username}"`);

  return token;
}

export default {
  createUser,
  getUserByName,
  deleteUser,
  login,
  checkRole,
};

import { jest } from "@jest/globals";
import userMiddleware from "../src/middleware/userMiddleware.js";

describe("userMiddleware.validateInput", () => {
  let next;
  let res;

  beforeEach(() => {
    next = jest.fn();
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  test("calls next with valid username and password", () => {
    const req = { body: { username: "user1", password: "pass123" } };
    userMiddleware.validateInput(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("returns 422 when username is missing", () => {
    const req = { body: { password: "pass123" } };
    userMiddleware.validateInput(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Username and password are required" });
  });

  test("returns 422 when password is missing", () => {
    const req = { body: { username: "user1" } };
    userMiddleware.validateInput(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Username and password are required" });
  });

  test("returns 422 when username or password contains spaces", () => {
    const req = { body: { username: "user 1", password: "pass123" } };
    userMiddleware.validateInput(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
  });

  test("returns 422 when username or password is empty string", () => {
    const req = { body: { username: "", password: "pass123" } };
    userMiddleware.validateInput(req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid username or password" });
  });
});

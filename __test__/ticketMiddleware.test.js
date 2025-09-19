import ticketMiddleware from "../src/middleware/ticketMiddleware.js";
import { jest } from '@jest/globals';

describe("Ticket Middleware Simple Tests", () => {
  const next = jest.fn();
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("validateTicket passes with valid input", () => {
    const req = { body: { amount: 100, description: "Valid description" } };
    ticketMiddleware.validateTicket(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("authorizeManager passes for manager role", () => {
    const req = { user: { role: "manager" } };
    ticketMiddleware.authorizeManager(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("authorizeEmployee passes for employee role", () => {
    const req = { user: { role: "employee" } };
    ticketMiddleware.authorizeEmployee(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("validateUpdate passes for approved action", () => {
    const req = { body: { action: "approved" } };
    ticketMiddleware.validateUpdate(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("validateUpdate passes for denied action", () => {
    const req = { body: { action: "denied" } };
    ticketMiddleware.validateUpdate(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

import express from "express";
import jwt from "jsonwebtoken";
import userService from "../service/userService.js";
import key from "../util/key.js";
import { logger } from "../util/logger.js";
import { authenticateToken } from "../middleware/jwt.js";
import tryCatch from "../util/tryCatch.js";
import ticketService from "../service/ticketService.js";

const router = express.Router();

function validateTicket(req, res, next) {
  const { amount, description } = req.body;

  if (amount === undefined || amount === null) {
    return res.status(422).json({ message: "Amount is required" });
  }

    if (!description) {
    return res.status(422).json({ message: "Description is required" });
  }

  const num = Number(amount);
  if (isNaN(num) || num <= 0)
    return res.status(400).json({ message: "Invalid Amount" });

  if (!description || description === "")
    return res.status(400).json({ message: "Invalid Description" });
  next();
}

function authorizeManager(req, res, next) {
  const { role } = req.user;

  if (role !== "manager")
    return res.status(403).json({
      message: "Forbidden, you are not authorized to update tickets.",
    });

  next();
}

function authorizeEmployee(req, res, next) {
  const { role } = req.user;

  if (role !== "employee")
    return res.status(403).json({
      message: "Forbidden, you are not authorized to post tickets.",
    });

  next();
}

function validateUpdate(req, res, next) {
  const { action } = req.body;
  if (!["approved", "denied"].includes(action))
    return res.status(422).json({ message: "Invalid action" });

  next();
}

router.post(
  "/tickets",
  validateTicket,
  authenticateToken,
  authorizeEmployee,
  async (req, res) => {
    const { amount, description } = req.body;
    const { username } = req.user;

    const { data, err } = await tryCatch(
      ticketService.createTicket({
        amount,
        description,
        employee_name: username,
      })
    );

    if (err) return res.status(err.statusCode).json({ message: err });

    res.status(201).json({ message: "Ticket Created", data });
  }
);

router.get("/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const { data, err } = await tryCatch(ticketService.getTicketById(id));
  if (err || data.$fault)
    return res.status(404).json({ message: data.message || err.message });

  res.status(200).json({ message: "Ticket found", data });
});

router.patch(
  "/tickets/:id",
  validateUpdate,
  authenticateToken,
  authorizeManager,
  async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    const { data, err } = await tryCatch(
      ticketService.updateStatus(id, action)
    );

    if (err) return res.status(404).json({ message: err.message });

    res.status(200).json({ message: `Ticket updated to ${action}`, data });
  }
);

router.get("/tickets/", authenticateToken, restrictEmployeeUsernameQuery, async (req, res) => {
  const { username:user, role } = req.user;
  const { status, username } = req.query;
  const { data, err } = await tryCatch(
    ticketService.getAllTickets(user, role, status, username)
  );

  if (err) return res.status(400).json({ message: err.message });

  res.status(200).json({ message: "tickets found", data });
});

function restrictEmployeeUsernameQuery(req, res, next) {
  const { role } = req.user;
  const { username } = req.query;

  if (role === "employee" && username) {
    return res.status(403).json({ message: "Employees cannot query tickets of other users" });
  }

  next();
}

export default router;

import express from "express";
import { authenticateToken } from "../middleware/jwt.js";
import tryCatch from "../util/tryCatch.js";
import ticketService from "../service/ticketService.js";
import ticketMiddleware from "../middleware/ticketMiddleware.js";

const router = express.Router();

router.post(
  "/tickets",
  ticketMiddleware.validateTicket,
  authenticateToken,
  ticketMiddleware.authorizeEmployee,
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
  ticketMiddleware.validateUpdate,
  authenticateToken,
  ticketMiddleware.authorizeManager,
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

router.get(
  "/tickets/",
  authenticateToken,
  ticketMiddleware.restrictEmployeeUsernameQuery,
  async (req, res) => {
    const { username: user, role } = req.user;
    const { status, username } = req.query;
    const { data, err } = await tryCatch(
      ticketService.getAllTickets(user, role, status, username)
    );

    if (err) return res.status(400).json({ message: err.message });

    res.status(200).json({ message: "tickets found", data });
  }
);

export default router;

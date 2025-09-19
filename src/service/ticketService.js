import ticketDAO from "../repository/ticketDAO.js";
import HttpError from "../util/error.js";
import { logger } from "../util/logger.js";
import tryCatch from "../util/tryCatch.js";
import userService from "./userService.js";

async function createTicket(ticket) {
  ticket.ticket_id = crypto.randomUUID();

  const { data, err } = await tryCatch(ticketDAO.createTicket(ticket));
  if (err) return err;
  logger.info(`Ticket #${ticket.ticket_id} Created By ${ticket.employee_name}`);

  return ticket;
}

async function getTicketById(ticket_id) {
  const { data, err } = await tryCatch(ticketDAO.getTicketById(ticket_id));
  if (err) return err;
  logger.info(`Ticket Found: ${data.ticket_id}`);
  return data;
}

async function updateStatus(ticket_id, action) {
  const { data: ticket, err: error } = await tryCatch(getTicketById(ticket_id));
  if (error) throw error;

  if (ticket.status !== "pending") throw new Error("Ticket already resolved");

  const { data: updated, err } = await tryCatch(
    ticketDAO.updateTicketStatus(ticket_id, action)
  );
  if (err) throw err;
  return updated;
}

async function getAllTicketsByEmployee(username) {
  const { data, err } = await tryCatch(
    ticketDAO.getAllTicketsByEmployee(username)
  );

  if (err) throw err;

  return data;
}

async function getTicketsOfStatus(status) {
  const { data, err } = await tryCatch(ticketDAO.getTicketsofStatus(status));

  if (err) throw err;

  return data;
}

async function getAllTickets(username, role, status, queryUsername) {
  if (role === "manager") {
    if (!status && !queryUsername) {
      const { data, err } = await tryCatch(ticketDAO.getAllTickets());
      if (err) return err;
      return data;
    }
    if (!validateStatus(status)) throw new HttpError("Unsupported Action", 422);

    if (queryUsername) {
      if (!(await userService.getUserByName(queryUsername)))
        throw new Error("Cannot find username");
    }

    if (status && queryUsername) {
      const { data, err } = await tryCatch(
        ticketDAO.getTicketsByEmployeeAndStatus(queryUsername, status)
      );
      if (err) throw err;
      return data;
    }

    if (status) {
      const { data, err } = await tryCatch(getTicketsOfStatus(status));
      if (err) throw err;
      return data;
    }

    if (queryUsername) {
      const { data, err } = await tryCatch(
        getAllTicketsByEmployee(queryUsername)
      );
      if (err) throw err;
      return data;
    }
  } else if (role === "employee") {
    if (!status) {
      const { data, err } = await tryCatch(getAllTicketsByEmployee(username));
      if (err) throw err;
      return data;
    }

    const { data, err } = await tryCatch(
      ticketDAO.getTicketsByEmployeeAndStatus(username, status)
    );
    if (err) throw err;
    return data;
  }
}

function validateStatus(status) {
  return ["pending", "approved", "denied"].includes(status);
}

export default {
  createTicket,
  getTicketById,
  updateStatus,
  getAllTickets,
  validateStatus,
};

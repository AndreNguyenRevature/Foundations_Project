import ticketService from "../src/service/ticketService.js";

test("ticketService.validateStatus returns correct boolean", () => {
  const validStatuses = ["pending", "approved", "denied"];
  const invalidStatuses = ["random", null];

  validStatuses.forEach((status) => {
    expect(ticketService.validateStatus(status)).toBe(true);
  });

  invalidStatuses.forEach((status) => {
    expect(ticketService.validateStatus(status)).toBe(false);
  });
});

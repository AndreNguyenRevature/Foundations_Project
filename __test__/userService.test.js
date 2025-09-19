import userService from "../src/service/userService.js";

test("userService.checkRole returns correct role", () => {
  const roles = {
    employeeInput: "employee",
    managerInput: "manager",
    nullInput: null,
  };

  expect(userService.checkRole(roles.nullInput)).toBe("employee");
  expect(userService.checkRole(roles.employeeInput)).toBe("employee");
  expect(userService.checkRole(roles.managerInput)).toBe("manager");
});



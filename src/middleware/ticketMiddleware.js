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

export default {
  validateTicket,
  validateUpdate,
  authorizeEmployee,
  authorizeManager,
};

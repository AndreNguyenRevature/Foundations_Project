import express from "express";
import userService from "../service/userService.js";
import tryCatch from "../util/tryCatch.js";
import userMiddleware from "../middleware/userMiddleware.js";

const router = express.Router();

router.post("/register", userMiddleware.validateInput, async (req, res) => {
  const { username, password, role } = req.body;

  const { data: user, err } = await tryCatch(
    userService.createUser({
      username,
      password,
      role,
    })
  );

  if (err) return res.status(err.statusCode).json({ message: err.message });

  if (user) {
    res.status(201).json({ message: "User Created" });
  } else {
    res.status(409).json({ message: "Username taken." });
  }
});

router.post("/login", userMiddleware.validateInput, async (req, res) => {
  const { username, password } = req.body;
  const { data, err } = await tryCatch(userService.login(username, password));

  if (err) return res.status(400).json({ message: err.message });

  res.status(200).json({ message: "Login Successful", data });
});

export default router;

import express from "express";
import userService from "../service/userService.js";
import tryCatch from "../util/tryCatch.js";

const router = express.Router();

router.post("/register", validateInput, async (req, res) => {
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

router.post("/login", validateInput, async (req, res) => {
  const { username, password } = req.body;
  const { data, err } = await tryCatch(userService.login(username, password));

  if (err) return res.status(400).json({ message: err.message });

  res.status(200).json({ message: "Login Successful", data });
});

function validateInput(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  
  if (
    username === undefined ||
    username === null ||
    password === undefined ||
    password === null
  ) {
    return res
      .status(422)
      .json({ message: "Username and password are required" });
  }

  const validLength = username?.length > 0 && password?.length > 0;
  const noSpaces = !username.includes(" ") && !password.includes(" ");
  const isValid = noSpaces && validLength;

  if (isValid) {
    next();
  } else {
    res.status(422).json({ message: "Invalid username or password" });
  }
}

export default router;

function validateInput(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

if (username === undefined || username === null || password === undefined || password === null) {
  return res.status(422).json({ message: "Username and password are required" });
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

export default {
    validateInput
}
import UsersModel from "../models/usersModel.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = new UsersModel({
    username,
    password: hashedPass,
    firstname,
    lastname,
  });

  await newUser
    .save()
    .then(() => res.status(200).json(newUser))
    .catch((err) => res.status(500).json({ message: err.message }));
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UsersModel.findOne({ username: username });

    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      validity
        ? res.status(200).json(user)
        : res.status(400).json("Wrong Password!");
    } else {
      res.status(404).json("User doesn't exist!");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

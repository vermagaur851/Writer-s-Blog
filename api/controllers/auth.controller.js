import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password == ""
  ) {
    next(errorHandler(400, "All fields are required !!"));
  }

  const hashed = bcrypt.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashed });

  try {
    await newUser.save();
    res.json("Signup Successfull");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password == "") {
    next(errorHandler(400, "All fields are required !!"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "user not found"));
    const validPAssword = bcrypt.compareSync(password, validUser.password);
    if (!validPAssword) {
      return next(errorHandler(400, "Invalid Password"));
    }
    const token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_SECRET
    );
    const {password, ...rest} = validUser._docs
    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

import { RequestHandler } from "express";
import { User, jobCategory, jobApplication } from "../models/schema";
import CustomAPIError from "../error/custom-error";
import { genSaltSync, hashSync, compareSync } from "bcrypt";
import Jwt from "jsonwebtoken";
import { sendEmails, sendEmailToOwner } from "../controllers/nodemailer";

export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const { name, gender, email, phone, password, jobApplied, jobInterest } =
      req.body;

    // input passed or not
    if (!name) throw new CustomAPIError("Name required.");
    if (!jobInterest) throw new CustomAPIError("Please specify job interest");
    if (!email) throw new CustomAPIError("Email required.");
    if (!password) throw new CustomAPIError("Password required.");
    if (!gender) throw new CustomAPIError("Phone number required.");

    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const pass: RegExp =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;

    // check input for correctness
    if (!pass.test(password.toString()))
      throw new CustomAPIError(
        "Enter valid password with uppercase, lowercase, number & @"
      );
    if (!expression.test(email.toString()))
      throw new CustomAPIError("Enter valid email");
    if (typeof phone !== "number" && ("" + phone).length !== 10)
      throw new CustomAPIError(
        "Phone number should only have 10 digits, No character allowed."
      );

    // checking if user already exist
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      throw new CustomAPIError("User already exists");
    }
    // password hashing and inserting data in Database
    const salt = genSaltSync(10);
    const hashPassword = hashSync(password.toString(), salt);
    await new User({
      name,
      jobInterest,
      email,
      phone,
      password: hashPassword,
      gender,
      imageUrl: " ",
      jobApplied: [],
    }).save();

    return res.status(200).json({ msg: "New user registered" });
  } catch (error) {
    next(error);
  }
};

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existinguser = await User.findOne({ email });
    //if user is not found
    if (!existinguser) {
      return res.status(407).json({ message: "User does not Exist" });
    }
    const isMatch = compareSync("" + password, existinguser.password);
    //if password doens't match
    if (!isMatch) {
      return res.status(407).json({ message: "Password not match" });
    }
    const id = existinguser._id;
    let refereshToken = "",
      AccessToken = "";
    let payload = { id: "1" };

    refereshToken = await Jwt.sign(
      { payload, id },
      process.env.JWT_REFRESH_SECRET_KEY!,
      {
        expiresIn: "2h",
        noTimestamp: true,
      }
    );
    console.log("pass2");
    AccessToken = await Jwt.sign({ payload, id }, process.env.JWT_SECRET_KEY!, {
      expiresIn: "30m",
      noTimestamp: true,
    });
    res.cookie("authToken", AccessToken, { httpOnly: true });
    res.cookie("refreshToken", refereshToken, { httpOnly: true });

    return res.status(201).json({
      refereshToken,
      AccessToken,
      message: "User logged in successfully",
    });
  } catch (err) {
    return res.status(407).json({ message: err });
  }
};

export const logout: RequestHandler = (req, res, next) => {
  try {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res
      .status(200)
      .json({ ok: true, message: "User has been logged out" });
  } catch (err) {
    next(err);
  }
};

export const addJobCategory: RequestHandler = async (req, res, next) => {
  try {
    const { field } = req.body;
    const userId = req.userId;
    const user: any = await User.findById(`${userId}`);

    await new jobCategory({
      field,
      createrJobEmail: user.email,
    }).save();

    return res.status(200).json({ msg: "New job category added" });
  } catch (err) {
    next(err);
  }
};

export const addJob: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.userId;
    let categoryExist: boolean = false;
    const user = await jobCategory.find().exec();
    for (var u of user) {
      if (u.field === category) categoryExist = true;
    }

    const all = await User.find({ jobInterest: { $all: [`${category}`] } });
    const userEmail = [];
    for (var people of all) {
      userEmail.push(people.email);
    }

    const ownerEmail: any = await User.findById(`${userId}`);

    if (categoryExist) {
      await sendEmails(userEmail);

      await new jobApplication({
        title,
        description,
        category,
        employerEmail: ownerEmail.email,
      }).save();
    } else throw new CustomAPIError("Job category does not exist.");

    return res.status(200).json({ msg: "New job post added" });
  } catch (err) {
    next(err);
  }
};

export const applyJob: RequestHandler = async (req, res, next) => {
  try {
    const { category } = req.body;
    const userId = req.userId;
    const isExist = await jobCategory.exists({ field: category });
    if (!isExist) {
      throw new CustomAPIError("Job category does not exist");
    }
    const ownerEmail: any = await jobCategory.findById(`${isExist._id}`);

    await sendEmailToOwner(ownerEmail.createrJobEmail, userId);
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: { jobApplied: category },
      }
    );

    return res.status(200).json({ msg: "Your job applied" });
  } catch (err) {
    next(err);
  }
};

export const getAllUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.find().exec();
    console.log(user);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(407).json({ message: err });
  }
};
export const getAllJob: RequestHandler = async (req, res, next) => {
  try {
    const user = await jobApplication.find().exec();
    console.log(user);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(407).json({ message: err });
  }
};

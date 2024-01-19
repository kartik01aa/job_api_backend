import { Schema, model } from "mongoose";

// Document interface
interface User {
  name: string;
  email: string;
  gender: string;
  password: string;
  phone: number;
  imageUrl: string;
  jobApplied: Array<string>;
  jobInterest: Array<string>;
}
interface jobCategory {
  field: string;
  createrJobEmail: string;
}

interface jobApplication {
  title: string;
  description: string;
  category: string;
  employerId: string;
}

// Schema user
const schema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  imageUrl: { type: String, required: false },
  jobApplied: { type: [String], required: false },
  jobInterest: { type: [String], required: true },
});

// Schema product
export const schema2 = new Schema<jobCategory>({
  field: { type: String, required: true },
  createrJobEmail: { type: String, required: false },
});

export const schema3 = new Schema<jobApplication>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  employerId: { type: String, required: false },
});
const User = model("User", schema);
const jobCategory = model("jobCategory", schema2);
const jobApplication = model("jobApplication", schema3);
export { User, jobCategory, jobApplication };

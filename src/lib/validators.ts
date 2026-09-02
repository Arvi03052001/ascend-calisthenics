import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Tell us what to call you").max(60),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});

export const onboardingSchema = z.object({
  sex: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string().min(1, "Enter your date of birth"),
  heightCm: z.coerce.number().min(120, "Height seems too low").max(230, "Height seems too high"),
  startWeightKg: z.coerce.number().min(35, "Weight seems too low").max(250, "Weight seems too high"),
  targetWeightKg: z.coerce.number().min(35, "Target seems too low").max(250, "Target seems too high"),
  experienceLevel: z.enum(["rookie", "beginner", "intermediate", "advanced"]),
  trainingDays: z.coerce.number().int().min(1, "At least 1 day").max(7, "Max 7 days"),
  goal: z.string().max(160).optional(),
}).refine((d) => {
  const dob = new Date(d.dateOfBirth);
  if (isNaN(dob.getTime())) return false;
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age >= 13 && age <= 100;
}, {
  message: "You must be at least 13 years old",
  path: ["dateOfBirth"],
}).refine((d) => Math.abs(d.targetWeightKg - d.startWeightKg) >= 0.5, {
  message: "Target and current weight should differ by at least 0.5kg",
  path: ["targetWeightKg"],
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;

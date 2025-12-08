import { ResumeData } from "@/types";
import jsonData from "./resume.json";

// Ép kiểu JSON về Interface ResumeData để đảm bảo type-safe
export const resumeData = jsonData as unknown as ResumeData;
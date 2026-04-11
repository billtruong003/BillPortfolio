import { PostManifest } from "@/types";
import jsonData from "./posts.json";

export const postManifest = jsonData as unknown as PostManifest;

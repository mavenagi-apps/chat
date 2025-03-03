import { defineConfig } from "vite";
import { createBaseConfig } from "./vite.config.base";

export default defineConfig(({ mode }) => createBaseConfig(mode));

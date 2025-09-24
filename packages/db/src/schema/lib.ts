import { z } from "zod/v4";

export const colorCodeSchema = z
  .string()
  .regex(/^#([0-9A-F]{3}|[0-9A-F]{6})$/i, {
    message:
      "Invalid color code. Must be a valid hex code like #FFF or #FFFFFF.",
  });

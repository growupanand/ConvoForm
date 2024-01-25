import { NextResponse } from "next/server";
import { z } from "zod";

export const sendErrorResponse = (error: any) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(error.formErrors, { status: 400 });
  }

  if (error.name === "Unauthorized") {
    return NextResponse.json(
      { nonFieldError: error.message || "You are not authorized." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      nonFieldError: error.message || "something went wrong",
      ...(error.cause?.errorCode && { errorCode: error.cause?.errorCode }),
    },
    { status: error.cause?.statusCode || 500 },
  );
};

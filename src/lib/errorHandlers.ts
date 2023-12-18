import { NextResponse } from "next/server";
import { z } from "zod";

export const sendErrorResponse = (error: any) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(error.formErrors, { status: 400 });
  }

  if (error.toString().includes("NEXT_REDIRECT")) {
    return NextResponse.json(
      { nonFieldError: "user not logged in" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      nonFieldError: error.message || "something went wrong",
      ...(error.cause?.errorCode && { errorCode: error.cause?.errorCode }),
    },
    { status: error.cause?.statusCode || 500 }
  );
};

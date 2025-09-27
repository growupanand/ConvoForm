import { NextResponse } from "next/server";
import { z } from "zod/v4";

export const sendErrorResponse = (error: any) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json(z.treeifyError(error), { status: 400 });
  }

  if (error.name === "Unauthorized") {
    return NextResponse.json(
      { nonFieldError: error.message || "You are not authorized." },
      { status: 400 },
    );
  }

  if (error.name === "TOO_MANY_REQUESTS") {
    return NextResponse.json(
      {
        nonFieldError: error.message || "Rate limit exceeded",
        ...error.cause,
      },
      {
        status: 429,
      },
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

export const sendErrorMessage = (message: string, status: number) => {
  return NextResponse.json({ nonFieldError: message }, { status });
};

import { NextResponse } from 'next/server';

type ErrorResponse = {
  message: string;
  status?: number;
  headers?: HeadersInit;
};

export const apiResponse = {
  error({ message, status = 500, headers }: ErrorResponse) {
    return NextResponse.json(
      { error: message },
      { status, headers }
    );
  },

  success<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
  },

  unauthorized() {
    return this.error({
      message: 'Session expired or unauthorized',
      status: 401,
      headers: {
        'WWW-Authenticate': 'Bearer error="invalid_token"'
      }
    });
  },

  notFound(message = 'Resource not found') {
    return this.error({ message, status: 404 });
  },

  badRequest(message: string) {
    return this.error({ message, status: 400 });
  },

  serverError(error: unknown) {
    console.error('Server error:', error);
    return this.error({ 
      message: 'Internal Server Error',
      status: 500 
    });
  }
};
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  success: false;
  data: null;
  message: string;
  errors: string[];
  statusCode: number;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, errors } = this.extractErrorDetails(exception);

    const path = request.url;
    const timestamp = new Date().toISOString();

    this.logger.error(
      `[${request.method}] ${path} → ${statusCode}: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body: ErrorResponse = {
      success: false,
      data: null,
      message,
      errors,
      statusCode,
      timestamp,
      path,
    };

    response.status(statusCode).json(body);
  }

  private extractErrorDetails(exception: unknown): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaKnownError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database validation error',
        errors: [exception.message.split('\n').pop() ?? 'Validation failed'],
      };
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected database error occurred',
        errors: ['Database request failed'],
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return { statusCode: status, message: exceptionResponse, errors: [exceptionResponse] };
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const message = (resp['message'] as string | string[]) ?? exception.message;
        const errors = Array.isArray(message) ? message : [message as string];
        return {
          statusCode: status,
          message: Array.isArray(message) ? 'Validation failed' : (message as string),
          errors,
        };
      }

      return { statusCode: status, message: exception.message, errors: [exception.message] };
    }

    if (exception instanceof Error) {
      this.logger.error('Unhandled exception', exception.stack);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errors: [exception.message],
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: ['An unexpected error occurred'],
    };
  }

  private handlePrismaKnownError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    switch (exception.code) {
      case 'P2002': {
        const fields = (exception.meta?.['target'] as string[]) ?? [];
        const fieldList = fields.join(', ');
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${fieldList} already exists`,
          errors: [`Unique constraint failed on: ${fieldList}`],
        };
      }
      case 'P2025': {
        const cause = (exception.meta?.['cause'] as string) ?? 'Record not found';
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: cause,
          errors: [cause],
        };
      }
      case 'P2003': {
        const field = (exception.meta?.['field_name'] as string) ?? 'unknown field';
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Foreign key constraint failed on: ${field}`,
          errors: [`Foreign key constraint violation on field: ${field}`],
        };
      }
      case 'P2014': {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The change you are trying to make would violate a required relation',
          errors: ['Required relation violation'],
        };
      }
      case 'P2016': {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Query interpretation error',
          errors: [exception.message],
        };
      }
      case 'P2000': {
        const column = (exception.meta?.['column_name'] as string) ?? 'unknown';
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `The provided value for the column '${column}' is too long`,
          errors: [`Value too long for column: ${column}`],
        };
      }
      default:
        this.logger.error(`Unhandled Prisma error code: ${exception.code}`, exception.message);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          errors: [exception.message],
        };
    }
  }
}

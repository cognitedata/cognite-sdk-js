// Copyright 2022 Cognite AS
class ErrorHandler extends Error {
    protected statusCode: number;
    protected errors: unknown[] = [];

    constructor(message: string, statusCode = 400) {
        super('exception');
        this.message = this.extractMessage(message);
        this.statusCode = statusCode;
    }

    setErrors(errors: unknown[]): ErrorHandler {
        this.errors = errors;
        return this;
    }

    getErrors(): unknown[] {
        return this.errors;
    }

    getStatusCode(): number {
        return this.statusCode;
    }

    getMessage(): string {
        return this.message;
    }

    extractMessage(message: any): string {
        if (typeof message === 'string') return message;

        if (typeof message === 'object')
            return `[${message.name}] ${message.message}`;

        return 'message format does not supported';
    }
}

export default ErrorHandler;

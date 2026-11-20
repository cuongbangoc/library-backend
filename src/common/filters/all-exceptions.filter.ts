import { ExceptionFilter, Logger, Catch, ArgumentsHost, HttpStatus, HttpException } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR; // default status 500
        let message = 'Lỗi hệ thống, vui lòng liên hệ admin'; // default message

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object') {
                const resObj = res as { message?: string };
                message = resObj.message || exception.message;
            }
        } else if (exception instanceof Error) {
            this.logger.error(
                `Unhandle error at ${request.method} ${request.url}: ${exception.message}`,
                exception.stack,
            );
        }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        })
    }
}
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BorrowStatus } from '../../common/enums/borrow-status.enum.js';

export class ReturnBorrowBookDto {
    @IsNotEmpty()
    @IsEnum(BorrowStatus)
    status: string;
}

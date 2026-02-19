
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateBetDto {
    @IsUUID()
    @IsNotEmpty()
    selectionId: string;

    @IsNumber()
    @Min(1) // Assuming min stake 1 for now, or use config env
    stake: number;
}

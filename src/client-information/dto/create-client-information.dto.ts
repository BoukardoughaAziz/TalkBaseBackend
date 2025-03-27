import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientInformationDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;
    
    @IsNotEmpty()
    @IsString()
    identifier: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @IsNotEmpty()
    @IsString()
    jobTitle: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
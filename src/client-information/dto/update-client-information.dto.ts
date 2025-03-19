import { PartialType } from '@nestjs/mapped-types';
import { CreateClientInformationDto } from './create-client-information.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateClientInformationDto extends PartialType(CreateClientInformationDto) {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsString()
    identifier?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}
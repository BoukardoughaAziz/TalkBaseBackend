import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientInformationService } from './client-information.service';
import { CreateClientInformationDto } from './dto/create-client-information.dto';
import { UpdateClientInformationDto } from './dto/update-client-information.dto';

@Controller('client-information')
export class ClientInformationController {
  constructor(private readonly clientInformationService: ClientInformationService) {}

  @Post('create-client')
  create(@Body() createClientInformationDto: CreateClientInformationDto) {
    return this.clientInformationService.create(createClientInformationDto);
  }
  @Get('find-client-by-identifier/:identifier')
  findByIdentifier(@Param('identifier') identifier: string) {
    console.log("thisis the identifier",identifier) 
    return this.clientInformationService.findByIdentifier(identifier);
  }
  @Get('find-all-clients')
  findAll() {
    return this.clientInformationService.findAll();
  }

  @Get('find-client/:id')
  findOne(@Param('id') id: string) {
    return this.clientInformationService.findOne(id);
  }

  @Patch('update-client/:id')
  update(@Body() updateClientInformationDto: UpdateClientInformationDto) {
    return this.clientInformationService.update(updateClientInformationDto.identifier, updateClientInformationDto);
  }

  @Delete('remove-client/:id')
  remove(@Param('id') id: string) {
    return this.clientInformationService.remove(id);
  }
 
}

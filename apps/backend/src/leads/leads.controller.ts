import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeadDto } from './dto-create-lead';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() body: CreateLeadDto) {
    return this.leadsService.createLead(body);
  }
}

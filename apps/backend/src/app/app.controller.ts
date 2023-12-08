import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as groningen from '../assets/topojson/groningen.topojson.json';

@Controller()
export class AppController {
  groningen = groningen;
  constructor(private readonly appService: AppService) {}

  @Get('geodata')
  getData() {
    return this.groningen;
  }
}

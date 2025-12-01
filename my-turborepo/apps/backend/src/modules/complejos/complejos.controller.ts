import { Controller, Get, Param } from '@nestjs/common';
import { ComplejosService } from './complejos.service.js';
import { Public } from '../auth/decorators/public.decorator.js';

@Controller('complejos')
@Public() // Todas las rutas de complejos son públicas
export class ComplejosController {
  constructor(private readonly complejosService: ComplejosService) {}

  @Get()
  findAll() {
    return this.complejosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.complejosService.findOne(id);
  }

  @Get(':id/deportes')
  getDeportes(@Param('id') id: string) {
    return this.complejosService.getDeportes(id);
  }
}
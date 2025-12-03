import { Test, TestingModule } from '@nestjs/testing';
import { TurnosFijosController } from './turnos-fijos.controller';

describe('TurnosFijosController', () => {
  let controller: TurnosFijosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurnosFijosController],
    }).compile();

    controller = module.get<TurnosFijosController>(TurnosFijosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

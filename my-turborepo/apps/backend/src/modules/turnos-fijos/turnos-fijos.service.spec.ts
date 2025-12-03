import { Test, TestingModule } from '@nestjs/testing';
import { TurnosFijosService } from './turnos-fijos.service';

describe('TurnosFijosService', () => {
  let service: TurnosFijosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TurnosFijosService],
    }).compile();

    service = module.get<TurnosFijosService>(TurnosFijosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

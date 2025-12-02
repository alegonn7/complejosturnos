import { Test, TestingModule } from '@nestjs/testing';
import { DeportesService } from './deportes.service';

describe('DeportesService', () => {
  let service: DeportesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeportesService],
    }).compile();

    service = module.get<DeportesService>(DeportesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

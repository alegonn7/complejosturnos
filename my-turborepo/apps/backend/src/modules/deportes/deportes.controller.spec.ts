import { Test, TestingModule } from '@nestjs/testing';
import { DeportesController } from './deportes.controller';

describe('DeportesController', () => {
  let controller: DeportesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeportesController],
    }).compile();

    controller = module.get<DeportesController>(DeportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PricingsController } from './pricings.controller';
import { PricingsService } from './pricings.service';

describe('PricingsController', () => {
  let controller: PricingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricingsController],
      providers: [PricingsService],
    }).compile();

    controller = module.get<PricingsController>(PricingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

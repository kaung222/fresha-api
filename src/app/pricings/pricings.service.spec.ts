import { Test, TestingModule } from '@nestjs/testing';
import { PricingsService } from './pricings.service';

describe('PricingsService', () => {
  let service: PricingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingsService],
    }).compile();

    service = module.get<PricingsService>(PricingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

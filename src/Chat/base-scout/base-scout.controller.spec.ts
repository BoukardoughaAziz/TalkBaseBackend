import { Test, TestingModule } from '@nestjs/testing';
import { BaseScoutController } from './base-scout.controller';
import { BaseScoutService } from './base-scout.service';

describe('BaseScoutController', () => {
  let controller: BaseScoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseScoutController],
      providers: [BaseScoutService],
    }).compile();

    controller = module.get<BaseScoutController>(BaseScoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InterpretersController } from './interpreters.controller';
import { InterpretersService } from './interpreters.service';

describe('InterpretersController', () => {
  let controller: InterpretersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterpretersController],
      providers: [InterpretersService],
    }).compile();

    controller = module.get<InterpretersController>(InterpretersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

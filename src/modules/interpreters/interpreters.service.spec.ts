import { Test, TestingModule } from '@nestjs/testing';
import { InterpretersService } from './interpreters.service';

describe('InterpretersService', () => {
  let service: InterpretersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterpretersService],
    }).compile();

    service = module.get<InterpretersService>(InterpretersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

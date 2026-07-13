import { Injectable } from '@nestjs/common';

type HealthResponse = {
  status: 'ok';
  service: 'payflow-back';
  timestamp: string;
};

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'payflow-back',
      timestamp: new Date().toISOString(),
    };
  }
}

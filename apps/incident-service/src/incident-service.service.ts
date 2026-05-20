import { Injectable } from '@nestjs/common';

@Injectable()
export class IncidentServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

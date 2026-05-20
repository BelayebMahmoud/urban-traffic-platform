import { Injectable } from '@nestjs/common';

@Injectable()
export class TrafficServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

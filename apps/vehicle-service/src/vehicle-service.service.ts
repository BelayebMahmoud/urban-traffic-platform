import { Injectable } from '@nestjs/common';

@Injectable()
export class VehicleServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

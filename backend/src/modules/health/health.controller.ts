import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MongooseHealthIndicator } from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private mongoose: MongooseHealthIndicator,
    ) { }

    @Get()
    @HealthCheck()
    @Public()
    check() {
        return this.health.check([
            () => this.mongoose.pingCheck('mongoose'),
            // () => this.http.pingCheck('frontend', 'http://localhost:3000'), // Optional
        ]);
    }
}

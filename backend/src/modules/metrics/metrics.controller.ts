import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Response } from 'express';
import { PrometheusController } from '@willsoto/nestjs-prometheus';

@Controller('metrics')
export class MetricsController extends PrometheusController {
    @Get()
    @Public()
    async index(@Res() response: Response) {
        return super.index(response);
    }
}

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from '../common/errors/http-error.filter.js';
import { HealthModule } from '../modules/health/health.module.js';

@Module({
  imports: [HealthModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],
})
export class AppModule {}

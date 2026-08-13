import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpErrorFilter } from '../common/errors/http-error.filter.js';
import { AppConfigModule } from '../config/app-config.module.js';
import type { AppConfig } from '../config/configuration.js';
import { DatabaseModule } from '../database/database.module.js';
import { HealthModule } from '../modules/health/health.module.js';

@Module({})
export class AppModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [AppConfigModule.forRoot(config), DatabaseModule, HealthModule],
      providers: [
        {
          provide: APP_FILTER,
          useClass: HttpErrorFilter,
        },
      ],
    };
  }
}

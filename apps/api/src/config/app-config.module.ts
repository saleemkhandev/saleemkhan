import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './configuration.js';
import type { AppConfig } from './configuration.js';

@Global()
@Module({})
export class AppConfigModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppConfigModule,
      providers: [{ provide: APP_CONFIG, useValue: config }],
      exports: [APP_CONFIG],
    };
  }
}

/**
 * WebSocket 模块
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WebSocketSchedulerService } from './websocket-scheduler.service';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { WsJwtAuthGuard } from '@/common/guards/ws-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [
    AppWebSocketGateway,
    WebSocketService,
    WebSocketSchedulerService,
    WsJwtAuthGuard,
  ],
  exports: [WebSocketService],
})
export class WebSocketModule {}


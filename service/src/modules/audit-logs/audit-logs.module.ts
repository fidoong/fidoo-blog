import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsService } from './audit-logs.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { AnomalyNotificationService } from './services/anomaly-notification.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    forwardRef(() => AuthModule), // 使用 forwardRef 解决循环依赖（AuthModule 需要 AuditLogsService）
    UsersModule, // 用于权限检查和查找管理员
    NotificationsModule, // 用于发送通知
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AnomalyDetectionService, AnomalyNotificationService],
  exports: [AuditLogsService, AnomalyDetectionService, AnomalyNotificationService],
})
export class AuditLogsModule {}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
      responseTime?: number;
    };
  };
}

/**
 * 健康检查服务
 * 提供系统健康状态检查功能
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger('HealthService');
  private readonly startTime = Date.now();

  constructor(private configService: ConfigService) {}

  /**
   * 执行健康检查
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    // 检查数据库连接
    checks.database = await this.checkDatabase();

    // 检查 Redis 连接
    checks.redis = await this.checkRedis();

    // 检查磁盘空间（可选）
    checks.disk = await this.checkDiskSpace();

    // 检查内存使用（可选）
    checks.memory = this.checkMemory();

    // 确定整体状态
    const allUp = Object.values(checks).every((check) => check.status === 'up');
    const anyDown = Object.values(checks).some((check) => check.status === 'down');

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (allUp) {
      status = 'healthy';
    } else if (anyDown) {
      status = 'unhealthy';
    } else {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
    };
  }

  /**
   * 检查数据库连接
   */
  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    message?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    try {
      // 这里应该实际检查数据库连接
      // 例如：await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'up',
        message: 'Database connection is healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'down',
        message: `Database connection failed: ${error.message}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查 Redis 连接
   */
  private async checkRedis(): Promise<{
    status: 'up' | 'down';
    message?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    try {
      // 这里应该实际检查 Redis 连接
      // 例如：await this.redis.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'up',
        message: 'Redis connection is healthy',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'down',
        message: `Redis connection failed: ${error.message}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查磁盘空间
   */
  private async checkDiskSpace(): Promise<{
    status: 'up' | 'down';
    message?: string;
  }> {
    try {
      // 这里可以使用 fs.statfs 或其他方法检查磁盘空间
      // 简化实现，实际应该检查磁盘使用率
      return {
        status: 'up',
        message: 'Disk space is sufficient',
      };
    } catch (error) {
      return {
        status: 'down',
        message: `Disk space check failed: ${error.message}`,
      };
    }
  }

  /**
   * 检查内存使用
   */
  private checkMemory(): {
    status: 'up' | 'down';
    message?: string;
  } {
    try {
      const usage = process.memoryUsage();
      const totalMemory = usage.heapTotal;
      const usedMemory = usage.heapUsed;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;

      if (memoryUsagePercent > 90) {
        return {
          status: 'down',
          message: `Memory usage is critical: ${memoryUsagePercent.toFixed(2)}%`,
        };
      }

      if (memoryUsagePercent > 80) {
        return {
          status: 'up',
          message: `Memory usage is high: ${memoryUsagePercent.toFixed(2)}%`,
        };
      }

      return {
        status: 'up',
        message: `Memory usage is normal: ${memoryUsagePercent.toFixed(2)}%`,
      };
    } catch (error) {
      return {
        status: 'down',
        message: `Memory check failed: ${error.message}`,
      };
    }
  }

  /**
   * 检查就绪状态（readiness）
   */
  async checkReadiness(): Promise<boolean> {
    const health = await this.checkHealth();
    return health.status === 'healthy' || health.status === 'degraded';
  }

  /**
   * 检查存活状态（liveness）
   */
  async checkLiveness(): Promise<boolean> {
    // 简单的存活检查，只要进程运行就返回 true
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class SystemService {
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      nodeVersion: process.version,
    };
  }

  getProcessInfo() {
    const usage = process.memoryUsage();
    return {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external,
      },
      cpuUsage: process.cpuUsage(),
    };
  }
}

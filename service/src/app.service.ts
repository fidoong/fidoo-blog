import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  getInfo() {
    return {
      name: 'Fidoo Blog API',
      version: '1.0.0',
      description: '企业级博客系统 RESTful API',
      docs: '/api/docs',
    };
  }
}

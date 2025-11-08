import { Injectable, Logger } from '@nestjs/common';

/**
 * 批量处理服务
 * 提供批量操作的工具方法
 */
@Injectable()
export class BatchService {
  private readonly logger = new Logger('BatchService');

  /**
   * 批量处理数据
   * @param items 要处理的数据数组
   * @param processor 处理函数
   * @param batchSize 每批处理的数量
   * @param concurrency 并发数
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    concurrency: number = 3,
  ): Promise<R[]> {
    const results: R[] = [];
    const batches = this.chunkArray(items, batchSize);

    this.logger.log(
      `Processing ${items.length} items in ${batches.length} batches (batch size: ${batchSize}, concurrency: ${concurrency})`,
    );

    // 并发处理批次
    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        concurrentBatches.map((batch) => this.processBatch(batch, processor)),
      );

      results.push(...batchResults.flat());
    }

    return results;
  }

  /**
   * 处理单个批次
   */
  private async processBatch<T, R>(batch: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    return Promise.all(batch.map(processor));
  }

  /**
   * 将数组分块
   */
  chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * 批量插入数据（带错误处理）
   */
  async batchInsert<T>(
    items: T[],
    inserter: (batch: T[]) => Promise<void>,
    batchSize: number = 100,
    onError?: (error: Error, batch: T[]) => void,
  ): Promise<{ success: number; failed: number }> {
    const batches = this.chunkArray(items, batchSize);
    let success = 0;
    let failed = 0;

    for (const batch of batches) {
      try {
        await inserter(batch);
        success += batch.length;
      } catch (error) {
        failed += batch.length;
        this.logger.error(`Batch insert failed: ${error.message}`);
        if (onError) {
          onError(error as Error, batch);
        }
      }
    }

    return { success, failed };
  }

  /**
   * 批量更新数据
   */
  async batchUpdate<T>(
    items: T[],
    updater: (item: T) => Promise<void>,
    batchSize: number = 100,
  ): Promise<void> {
    await this.batchProcess(items, updater, batchSize);
  }

  /**
   * 批量删除数据
   */
  async batchDelete<T>(
    items: T[],
    deleter: (item: T) => Promise<void>,
    batchSize: number = 100,
  ): Promise<void> {
    await this.batchProcess(items, deleter, batchSize);
  }

  /**
   * 并行处理（限制并发数）
   */
  async parallelProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number = 5,
  ): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<void>[] = [];

    for (const item of items) {
      const promise = processor(item).then((result) => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1,
        );
      }
    }

    await Promise.all(executing);
    return results;
  }
}

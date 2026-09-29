import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
}

export abstract class SearchService {
  abstract searchEntities<T>(
    collectionName: string,
    searchColumns: string[],
    options: SearchOptions,
  ): Promise<SearchResult<T>>;
}

@Injectable()
export class DatabaseSearchService implements SearchService {
  private readonly logger = new Logger(DatabaseSearchService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async searchEntities<T>(
    collectionName: string,
    searchColumns: string[],
    options: SearchOptions,
  ): Promise<SearchResult<T>> {
    const { query, limit = 20, offset = 0 } = options;
    const sanitized = query.trim();

    if (!sanitized) {
      return { items: [], total: 0 };
    }

    try {
      const collection = this.connection.collection(collectionName);
      const regex = new RegExp(sanitized, 'i');
      const filter = {
        $or: searchColumns.map((col) => ({ [col]: regex })),
      };

      const [items, total] = await Promise.all([
        collection.find(filter).skip(offset).limit(limit).toArray() as unknown as Promise<T[]>,
        collection.countDocuments(filter),
      ]);

      return { items, total };
    } catch (err: any) {
      this.logger.warn(`Search fallback error on collection "${collectionName}": ${err.message}`);
      return { items: [], total: 0 };
    }
  }
}

import { createHash, randomBytes } from 'node:crypto';
import type { RedisClientType } from 'redis';
import type { BffSessionStore, LoginTransaction, StoredBffSession } from './types';

const LOGIN_TRANSACTION_TTL_SECONDS = 300;
const SESSION_TTL_SECONDS = 8 * 60 * 60;

export class RedisBffSessionStore implements BffSessionStore {
  constructor(private readonly redis: RedisClientType, private readonly prefix = 'ford:bff:') {}

  async saveLoginTransaction(state: string, transaction: LoginTransaction): Promise<void> {
    await this.redis.set(this.transactionKey(state), JSON.stringify(transaction), { EX: LOGIN_TRANSACTION_TTL_SECONDS });
  }

  async consumeLoginTransaction(state: string): Promise<LoginTransaction | null> {
    const raw = await this.redis.getDel(this.transactionKey(state));
    if (!raw) return null;
    try {
      const transaction = JSON.parse(raw) as LoginTransaction;
      if (transaction.state !== state || Date.now() - transaction.createdAt > LOGIN_TRANSACTION_TTL_SECONDS * 1000) return null;
      return transaction;
    } catch {
      return null;
    }
  }

  async createSession(session: StoredBffSession): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const id = randomBytes(32).toString('base64url');
      const inserted = await this.redis.set(this.sessionKey(id), JSON.stringify(session), {
        EX: SESSION_TTL_SECONDS,
        NX: true,
      });
      if (inserted === 'OK') return id;
    }
    throw new Error('Could not allocate a unique BFF session');
  }

  async getSession(id: string): Promise<StoredBffSession | null> {
    if (!id || id.length > 128) return null;
    const raw = await this.redis.get(this.sessionKey(id));
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as StoredBffSession;
      if (!session.accessToken || !session.refreshToken || !session.profile?.operatorId) return null;
      return session;
    } catch {
      return null;
    }
  }

  async updateSession(id: string, session: StoredBffSession): Promise<boolean> {
    if (!id || id.length > 128) return false;
    const result = await this.redis.set(this.sessionKey(id), JSON.stringify(session), {
      EX: SESSION_TTL_SECONDS,
      XX: true,
    });
    return result === 'OK';
  }

  async deleteSession(id: string): Promise<void> {
    if (!id || id.length > 128) return;
    await this.redis.del(this.sessionKey(id));
  }

  private transactionKey(state: string): string {
    return `${this.prefix}oauth-state:${sha256(state)}`;
  }

  private sessionKey(id: string): string {
    return `${this.prefix}session:${sha256(id)}`;
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

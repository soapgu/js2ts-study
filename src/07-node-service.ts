// 目标：接口隔离与依赖倒置。练习：增加 update，并处理不存在的实体。
interface Entity { id: string }
interface Repository<T extends Entity> {
  findById(id: string): Promise<T | undefined>;
  save(entity: T): Promise<void>;
}

class MemoryRepository<T extends Entity> implements Repository<T> {
  readonly #items = new Map<string, T>();
  async findById(id: string): Promise<T | undefined> { return this.#items.get(id); }
  async save(entity: T): Promise<void> { this.#items.set(entity.id, entity); }
}

interface User extends Entity { name: string }

async function register(repo: Repository<User>, user: User): Promise<User> {
  if (await repo.findById(user.id)) throw new Error("用户已存在");
  await repo.save(user);
  return user;
}

const repo = new MemoryRepository<User>();
console.log("07", await register(repo, { id: "u1", name: "Ada" }));

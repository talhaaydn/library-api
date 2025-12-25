import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export class UserRepository {
  constructor(private readonly repository: Repository<User>) {
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<User | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }
}

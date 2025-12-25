import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';

export class BookRepository {
  constructor(private readonly repository: Repository<Book>) {
  }

  async findAll(): Promise<Book[]> {
    return this.repository.find();
  }

  async findByName(name: string): Promise<Book | null> {
    return this.repository.findOne({ where: { name } });
  }

  async create(data: Partial<Book>): Promise<Book> {
    const book = this.repository.create(data);
    return this.repository.save(book);
  }
}


import { Repository, IsNull, Not } from 'typeorm';
import { UserBook } from '../entities/user-book.entity';

export class UserBookRepository {
  constructor(private readonly repository: Repository<UserBook>) {
  }

  async findActiveBorrowing(userId: number, bookId: number): Promise<UserBook | null> {
    return this.repository.findOne({
      where: {
        userId,
        bookId,
        returnedAt: IsNull()
      }
    });
  }

  async findActiveByBook(bookId: number): Promise<UserBook | null> {
    return this.repository.findOne({
      where: {
        bookId,
        returnedAt: IsNull()
      }
    });
  }

  async findActiveByUser(userId: number): Promise<UserBook[]> {
    return this.repository.find({
      where: {
        userId,
        returnedAt: IsNull()
      },
      relations: ['book']
    });
  }

  async findHistoryByUser(userId: number): Promise<UserBook[]> {
    return this.repository.find({
      where: {
        userId,
        returnedAt: Not(IsNull())
      },
      relations: ['book'],
      order: {
        returnedAt: 'DESC'
      }
    });
  }

  async create(data: Partial<UserBook>): Promise<UserBook> {
    const userBook = this.repository.create(data);
    return this.repository.save(userBook);
  }

  async save(userBook: UserBook): Promise<UserBook> {
    return this.repository.save(userBook);
  }
}


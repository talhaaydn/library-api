import { Repository, IsNull } from 'typeorm';
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

  async create(data: Partial<UserBook>): Promise<UserBook> {
    const userBook = this.repository.create(data);
    return this.repository.save(userBook);
  }

  async save(userBook: UserBook): Promise<UserBook> {
    return this.repository.save(userBook);
  }

  async findAllByUser(userId: number): Promise<UserBook[]> {
    return this.repository.find({
      where: {
        userId
      },
      relations: ['book']
    });
  }

  async getAverageScoreByBook(bookId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('ub')
      .select('AVG(ub.score)', 'average')
      .where('ub.bookId = :bookId', { bookId })
      .andWhere('ub.returnedAt IS NOT NULL')
      .andWhere('ub.score IS NOT NULL')
      .getRawOne();

    if (!result || result.average === null) {
      return -1;
    }

    return Math.round(parseFloat(result.average) * 100) / 100;
  }
}


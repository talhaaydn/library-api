import { UserBookRepository } from '../repositories/user-book.repository';
import { ConflictError } from '../../../common/errors/app.error';
import { UserBook } from '../entities/user-book.entity';

export class BorrowingService {
  constructor(private readonly userBookRepository: UserBookRepository) {
  }

  async createBorrowing(userId: number, bookId: number): Promise<UserBook> {
    const bookBorrowedByAnyone = await this.userBookRepository.findActiveByBook(bookId);
    if (bookBorrowedByAnyone) {
      throw new ConflictError('This book is currently borrowed by another user');
    }

    return this.userBookRepository.create({
      userId,
      bookId,
      borrowedAt: new Date(),
      returnedAt: null,
      score: null
    });
  }

  async returnBorrowing(userId: number, bookId: number, score: number): Promise<UserBook> {
    const borrowing = await this.userBookRepository.findActiveBorrowing(userId, bookId);
    if (!borrowing) {
      throw new ConflictError('No active borrowing found for this book');
    }

    borrowing.returnedAt = new Date();
    borrowing.score = score;

    return this.userBookRepository.save(borrowing);
  }

  async getActiveByUser(userId: number): Promise<UserBook[]> {
    return this.userBookRepository.findActiveByUser(userId);
  }

  async getHistoryByUser(userId: number): Promise<UserBook[]> {
    return this.userBookRepository.findHistoryByUser(userId);
  }
}


import { UserBookRepository } from '../repositories/user-book.repository';
import { ConflictError } from '../../../common/errors/app.error';
import { UserBook } from '../entities/user-book.entity';
import { BookRepository } from '../../books/repositories/book.repository';

export class BorrowingService {
  constructor(
    private readonly userBookRepository: UserBookRepository,
    private readonly bookRepository: BookRepository
  ) {
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

    const result = await this.userBookRepository.save(borrowing);

    const average = await this.userBookRepository.getAverageScoreByBook(bookId);
    await this.bookRepository.updateAverageScore(bookId, average);

    return result;
  }

  async getAllBooksByUser(userId: number): Promise<{ past: UserBook[], present: UserBook[] }> {
    const allBorrowings = await this.userBookRepository.findAllByUser(userId);
    
    const past = allBorrowings.filter(ub => ub.returnedAt !== null);
    const present = allBorrowings.filter(ub => ub.returnedAt === null);
    
    return { past, present };
  }
}


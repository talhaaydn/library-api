import { BorrowingService } from '../services/borrowing.service';
import { UserBookRepository } from '../repositories/user-book.repository';
import { BookRepository } from '../../books/repositories/book.repository';
import { MockFactory } from '../../../test/helpers/mock-factories';
import { ConflictError } from '../../../common/errors/app.error';

describe('BorrowingService', () => {
  let borrowingService: BorrowingService;
  let userBookRepository: jest.Mocked<UserBookRepository>;
  let bookRepository: jest.Mocked<BookRepository>;

  beforeEach(() => {
    userBookRepository = {
      findActiveByBook: jest.fn(),
      findActiveBorrowing: jest.fn(),
      findAllByUser: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      getAverageScoreByBook: jest.fn(),
    } as any;

    bookRepository = {
      updateAverageScore: jest.fn(),
    } as any;

    borrowingService = new BorrowingService(userBookRepository, bookRepository);
  });

  describe('createBorrowing', () => {
    it('should create a borrowing successfully when book is available', async () => {
      const mockBorrowing = MockFactory.createUserBook({
        userId: 1,
        bookId: 1,
        returnedAt: null,
      });

      userBookRepository.findActiveByBook.mockResolvedValue(null);
      userBookRepository.create.mockResolvedValue(mockBorrowing);

      const result = await borrowingService.createBorrowing(1, 1);

      expect(result.userId).toBe(1);
      expect(result.bookId).toBe(1);
      expect(result.returnedAt).toBeNull();
      expect(userBookRepository.findActiveByBook).toHaveBeenCalledWith(1);
      expect(userBookRepository.create).toHaveBeenCalledWith({
        userId: 1,
        bookId: 1,
        borrowedAt: expect.any(Date),
        returnedAt: null,
        score: null,
      });
    });

    it('should throw ConflictError when book is already borrowed', async () => {
      const activeBorrowing = MockFactory.createUserBook({
        userId: 2,
        bookId: 1,
        returnedAt: null,
      });

      userBookRepository.findActiveByBook.mockResolvedValue(activeBorrowing);

      await expect(borrowingService.createBorrowing(1, 1)).rejects.toThrow(ConflictError);
      await expect(borrowingService.createBorrowing(1, 1)).rejects.toThrow(
        'This book is currently borrowed by another user'
      );
      expect(userBookRepository.findActiveByBook).toHaveBeenCalledWith(1);
      expect(userBookRepository.create).not.toHaveBeenCalled();
    });

    it('should allow borrowing a book that was previously returned', async () => {
      const mockBorrowing = MockFactory.createUserBook({
        userId: 1,
        bookId: 1,
        returnedAt: null,
      });

      userBookRepository.findActiveByBook.mockResolvedValue(null);
      userBookRepository.create.mockResolvedValue(mockBorrowing);

      await borrowingService.createBorrowing(1, 1);

      expect(userBookRepository.create).toHaveBeenCalled();
    });
  });

  describe('returnBorrowing', () => {
    it('should return a book with score and update average', async () => {
      const mockBorrowing = MockFactory.createUserBook({
        id: 1,
        userId: 1,
        bookId: 1,
        score: null,
        returnedAt: null,
      });

      const returnedBorrowing = {
        ...mockBorrowing,
        score: 8,
        returnedAt: new Date(),
      };

      userBookRepository.findActiveBorrowing.mockResolvedValue(mockBorrowing);
      userBookRepository.save.mockResolvedValue(returnedBorrowing);
      userBookRepository.getAverageScoreByBook.mockResolvedValue(8.5);
      bookRepository.updateAverageScore.mockResolvedValue(undefined);

      const result = await borrowingService.returnBorrowing(1, 1, 8);

      expect(result.score).toBe(8);
      expect(result.returnedAt).toBeInstanceOf(Date);
      expect(userBookRepository.findActiveBorrowing).toHaveBeenCalledWith(1, 1);
      expect(userBookRepository.save).toHaveBeenCalled();
      expect(userBookRepository.getAverageScoreByBook).toHaveBeenCalledWith(1);
      expect(bookRepository.updateAverageScore).toHaveBeenCalledWith(1, 8.5);
    });

    it('should throw ConflictError when no active borrowing exists', async () => {
      userBookRepository.findActiveBorrowing.mockResolvedValue(null);

      await expect(borrowingService.returnBorrowing(1, 1, 8)).rejects.toThrow(ConflictError);
      await expect(borrowingService.returnBorrowing(1, 1, 8)).rejects.toThrow(
        'No active borrowing found for this book'
      );
      expect(userBookRepository.findActiveBorrowing).toHaveBeenCalledWith(1, 1);
      expect(userBookRepository.save).not.toHaveBeenCalled();
    });

    it('should handle different score values correctly', async () => {
      const mockBorrowing = MockFactory.createUserBook({
        userId: 1,
        bookId: 1,
        returnedAt: null,
      });

      userBookRepository.findActiveBorrowing.mockResolvedValue(mockBorrowing);
      userBookRepository.save.mockResolvedValue({ ...mockBorrowing, score: 10 });
      userBookRepository.getAverageScoreByBook.mockResolvedValue(10);

      await borrowingService.returnBorrowing(1, 1, 10);

      expect(userBookRepository.save).toHaveBeenCalled();
      expect(bookRepository.updateAverageScore).toHaveBeenCalledWith(1, 10);
    });

    it('should update average score correctly after multiple returns', async () => {
      const mockBorrowing = MockFactory.createUserBook({
        userId: 1,
        bookId: 1,
        returnedAt: null,
      });

      userBookRepository.findActiveBorrowing.mockResolvedValue(mockBorrowing);
      userBookRepository.save.mockResolvedValue({ ...mockBorrowing, score: 7 });
      userBookRepository.getAverageScoreByBook.mockResolvedValue(7.5);

      await borrowingService.returnBorrowing(1, 1, 7);

      expect(bookRepository.updateAverageScore).toHaveBeenCalledWith(1, 7.5);
    });
  });

  describe('getAllBooksByUser', () => {
    it('should return past and present borrowings separately', async () => {
      const pastBorrowing1 = MockFactory.createUserBook({
        id: 1,
        userId: 1,
        bookId: 1,
        score: 8,
        returnedAt: new Date('2024-01-01'),
      });

      const pastBorrowing2 = MockFactory.createUserBook({
        id: 2,
        userId: 1,
        bookId: 2,
        score: 9,
        returnedAt: new Date('2024-01-15'),
      });

      const presentBorrowing = MockFactory.createUserBook({
        id: 3,
        userId: 1,
        bookId: 3,
        score: null,
        returnedAt: null,
      });

      userBookRepository.findAllByUser.mockResolvedValue([
        pastBorrowing1,
        pastBorrowing2,
        presentBorrowing,
      ]);

      const result = await borrowingService.getAllBooksByUser(1);

      expect(result.past).toHaveLength(2);
      expect(result.present).toHaveLength(1);
      expect(result.past[0].returnedAt).not.toBeNull();
      expect(result.present[0].returnedAt).toBeNull();
      expect(userBookRepository.findAllByUser).toHaveBeenCalledWith(1);
    });

    it('should return empty arrays when user has no borrowings', async () => {
      userBookRepository.findAllByUser.mockResolvedValue([]);

      const result = await borrowingService.getAllBooksByUser(1);

      expect(result.past).toEqual([]);
      expect(result.present).toEqual([]);
      expect(userBookRepository.findAllByUser).toHaveBeenCalledWith(1);
    });

    it('should return only past borrowings when all books are returned', async () => {
      const pastBorrowings = [
        MockFactory.createUserBook({
          id: 1,
          userId: 1,
          bookId: 1,
          score: 7,
          returnedAt: new Date(),
        }),
        MockFactory.createUserBook({
          id: 2,
          userId: 1,
          bookId: 2,
          score: 8,
          returnedAt: new Date(),
        }),
      ];

      userBookRepository.findAllByUser.mockResolvedValue(pastBorrowings);

      const result = await borrowingService.getAllBooksByUser(1);

      expect(result.past).toHaveLength(2);
      expect(result.present).toHaveLength(0);
    });

    it('should return only present borrowings when no books are returned yet', async () => {
      const presentBorrowings = [
        MockFactory.createUserBook({
          id: 1,
          userId: 1,
          bookId: 1,
          returnedAt: null,
        }),
        MockFactory.createUserBook({
          id: 2,
          userId: 1,
          bookId: 2,
          returnedAt: null,
        }),
      ];

      userBookRepository.findAllByUser.mockResolvedValue(presentBorrowings);

      const result = await borrowingService.getAllBooksByUser(1);

      expect(result.past).toHaveLength(0);
      expect(result.present).toHaveLength(2);
    });
  });
});


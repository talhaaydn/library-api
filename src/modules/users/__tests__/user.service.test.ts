import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { BorrowingService } from '../../borrowings/services/borrowing.service';
import { BookRepository } from '../../books/repositories/book.repository';
import { MockFactory } from '../../../test/helpers/mock-factories';
import { NotFoundError, ConflictError } from '../../../common/errors/app.error';
import { CreateUserDto } from '../dto/create-user.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let borrowingService: jest.Mocked<BorrowingService>;
  let bookRepository: jest.Mocked<BookRepository>;

  beforeEach(() => {
    userRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
    } as any;

    borrowingService = {
      getAllBooksByUser: jest.fn(),
      createBorrowing: jest.fn(),
      returnBorrowing: jest.fn(),
    } as any;

    bookRepository = {
      findById: jest.fn(),
    } as any;

    userService = new UserService(userRepository, borrowingService, bookRepository);
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = MockFactory.createUsers(3);
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toHaveLength(3);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return empty array when no users exist', async () => {
      userRepository.findAll.mockResolvedValue([]);

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserById', () => {
    it('should return user with borrowing details', async () => {
      const mockUser = MockFactory.createUser({ id: 1, name: 'John Doe' });
      const mockPastBorrowing = MockFactory.createUserBook({
        id: 1,
        userId: 1,
        bookId: 1,
        score: 8,
        returnedAt: new Date(),
      });
      const mockPresentBorrowing = MockFactory.createUserBook({
        id: 2,
        userId: 1,
        bookId: 2,
        score: null,
        returnedAt: null,
      });

      userRepository.findById.mockResolvedValue(mockUser);
      borrowingService.getAllBooksByUser.mockResolvedValue({
        past: [mockPastBorrowing],
        present: [mockPresentBorrowing],
      });

      const result = await userService.getUserById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('John Doe');
      expect(result.books.past).toHaveLength(1);
      expect(result.books.present).toHaveLength(1);
      expect(result.books.past[0].userScore).toBe(8);
      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(borrowingService.getAllBooksByUser).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow(NotFoundError);
      await expect(userService.getUserById(999)).rejects.toThrow('User not found');
      expect(userRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = { name: 'Jane Doe' };
      const mockUser = MockFactory.createUser({ id: 1, name: 'Jane Doe' });

      userRepository.findByName.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserDto);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Jane Doe');
      expect(userRepository.findByName).toHaveBeenCalledWith('Jane Doe');
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictError when user with same name exists', async () => {
      const createUserDto: CreateUserDto = { name: 'Existing User' };
      const existingUser = MockFactory.createUser({ name: 'Existing User' });

      userRepository.findByName.mockResolvedValue(existingUser);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(ConflictError);
      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        'User with this name already exists'
      );
      expect(userRepository.findByName).toHaveBeenCalledWith('Existing User');
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('borrowBook', () => {
    it('should allow user to borrow a book successfully', async () => {
      const mockUser = MockFactory.createUser({ id: 1 });
      const mockBook = MockFactory.createBook({ id: 1 });

      userRepository.findById.mockResolvedValue(mockUser);
      bookRepository.findById.mockResolvedValue(mockBook);
      borrowingService.createBorrowing.mockResolvedValue({} as any);

      await userService.borrowBook(1, 1);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bookRepository.findById).toHaveBeenCalledWith(1);
      expect(borrowingService.createBorrowing).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.borrowBook(999, 1)).rejects.toThrow(NotFoundError);
      await expect(userService.borrowBook(999, 1)).rejects.toThrow('User not found');
      expect(borrowingService.createBorrowing).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when book does not exist', async () => {
      const mockUser = MockFactory.createUser({ id: 1 });
      userRepository.findById.mockResolvedValue(mockUser);
      bookRepository.findById.mockResolvedValue(null);

      await expect(userService.borrowBook(1, 999)).rejects.toThrow(NotFoundError);
      await expect(userService.borrowBook(1, 999)).rejects.toThrow('Book not found');
      expect(borrowingService.createBorrowing).not.toHaveBeenCalled();
    });
  });

  describe('returnBook', () => {
    it('should allow user to return a book with score', async () => {
      const mockUser = MockFactory.createUser({ id: 1 });
      const mockBook = MockFactory.createBook({ id: 1 });

      userRepository.findById.mockResolvedValue(mockUser);
      bookRepository.findById.mockResolvedValue(mockBook);
      borrowingService.returnBorrowing.mockResolvedValue({} as any);

      await userService.returnBook(1, 1, 8);

      expect(userRepository.findById).toHaveBeenCalledWith(1);
      expect(bookRepository.findById).toHaveBeenCalledWith(1);
      expect(borrowingService.returnBorrowing).toHaveBeenCalledWith(1, 1, 8);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.returnBook(999, 1, 8)).rejects.toThrow(NotFoundError);
      await expect(userService.returnBook(999, 1, 8)).rejects.toThrow('User not found');
      expect(borrowingService.returnBorrowing).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when book does not exist', async () => {
      const mockUser = MockFactory.createUser({ id: 1 });
      userRepository.findById.mockResolvedValue(mockUser);
      bookRepository.findById.mockResolvedValue(null);

      await expect(userService.returnBook(1, 999, 8)).rejects.toThrow(NotFoundError);
      await expect(userService.returnBook(1, 999, 8)).rejects.toThrow('Book not found');
      expect(borrowingService.returnBorrowing).not.toHaveBeenCalled();
    });
  });
});


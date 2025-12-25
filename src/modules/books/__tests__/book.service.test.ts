import { BookService } from '../services/book.service';
import { BookRepository } from '../repositories/book.repository';
import { MockFactory } from '../../../test/helpers/mock-factories';
import { NotFoundError, ConflictError } from '../../../common/errors/app.error';
import { CreateBookDto } from '../dto/create-book.dto';

describe('BookService', () => {
  let bookService: BookService;
  let bookRepository: jest.Mocked<BookRepository>;

  beforeEach(() => {
    bookRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      updateAverageScore: jest.fn(),
    } as any;

    bookService = new BookService(bookRepository);
  });

  describe('getAllBooks', () => {
    it('should return all books', async () => {
      const mockBooks = MockFactory.createBooks(5);
      bookRepository.findAll.mockResolvedValue(mockBooks);

      const result = await bookService.getAllBooks();

      expect(result).toHaveLength(5);
      expect(bookRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return empty array when no books exist', async () => {
      bookRepository.findAll.mockResolvedValue([]);

      const result = await bookService.getAllBooks();

      expect(result).toEqual([]);
      expect(bookRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBookById', () => {
    it('should return book details with average score', async () => {
      const mockBook = MockFactory.createBook({
        id: 1,
        name: 'The Great Gatsby',
        averageScore: 8.5,
      });
      bookRepository.findById.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('The Great Gatsby');
      expect(result.score).toBe(8.5);
      expect(bookRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return book with -1 score when not rated', async () => {
      const mockBook = MockFactory.createBook({
        id: 1,
        name: 'New Book',
        averageScore: -1,
      });
      bookRepository.findById.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(1);

      expect(result.score).toBe(-1);
    });

    it('should throw NotFoundError when book does not exist', async () => {
      bookRepository.findById.mockResolvedValue(null);

      await expect(bookService.getBookById(999)).rejects.toThrow(NotFoundError);
      await expect(bookService.getBookById(999)).rejects.toThrow('Book not found');
      expect(bookRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('createBook', () => {
    it('should create a new book successfully', async () => {
      const createBookDto: CreateBookDto = { name: '1984' };
      const mockBook = MockFactory.createBook({ id: 1, name: '1984' });

      bookRepository.findByName.mockResolvedValue(null);
      bookRepository.create.mockResolvedValue(mockBook);

      const result = await bookService.createBook(createBookDto);

      expect(result.id).toBe(1);
      expect(result.name).toBe('1984');
      expect(bookRepository.findByName).toHaveBeenCalledWith('1984');
      expect(bookRepository.create).toHaveBeenCalledWith(createBookDto);
    });

    it('should throw ConflictError when book with same name exists', async () => {
      const createBookDto: CreateBookDto = { name: 'Existing Book' };
      const existingBook = MockFactory.createBook({ name: 'Existing Book' });

      bookRepository.findByName.mockResolvedValue(existingBook);

      await expect(bookService.createBook(createBookDto)).rejects.toThrow(ConflictError);
      await expect(bookService.createBook(createBookDto)).rejects.toThrow(
        'Book with this name already exists'
      );
      expect(bookRepository.findByName).toHaveBeenCalledWith('Existing Book');
      expect(bookRepository.create).not.toHaveBeenCalled();
    });

    it('should trim and validate book name', async () => {
      const createBookDto: CreateBookDto = { name: '  Brave New World  ' };
      const mockBook = MockFactory.createBook({ id: 1, name: '  Brave New World  ' });

      bookRepository.findByName.mockResolvedValue(null);
      bookRepository.create.mockResolvedValue(mockBook);

      await bookService.createBook(createBookDto);

      expect(bookRepository.findByName).toHaveBeenCalledWith('  Brave New World  ');
    });
  });
});


import { Request, Response, NextFunction } from 'express';
import { BookController } from '../controllers/book.controller';
import { BookService } from '../services/book.service';
import { BadRequestError, NotFoundError } from '../../../common/errors/app.error';
import { BookResponseDto } from '../dto/book-response.dto';
import { BookDetailResponseDto } from '../dto/book-detail-response.dto';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: jest.Mocked<BookService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    bookService = {
      getAllBooks: jest.fn(),
      getBookById: jest.fn(),
      createBook: jest.fn(),
    } as any;

    bookController = new BookController(bookService);

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('getAll', () => {
    it('should return all books', async () => {
      const mockBooks = [
        new BookResponseDto(1, 'Book 1'),
        new BookResponseDto(2, 'Book 2'),
        new BookResponseDto(3, 'Book 3'),
      ];

      bookService.getAllBooks.mockResolvedValue(mockBooks);

      await bookController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBooks);
    });

    it('should return empty array when no books exist', async () => {
      bookService.getAllBooks.mockResolvedValue([]);

      await bookController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getById', () => {
    it('should return book by id with score', async () => {
      mockRequest.params = { id: '1' };
      const mockBookDetail = new BookDetailResponseDto(1, 'The Great Gatsby', 8.5);

      bookService.getBookById.mockResolvedValue(mockBookDetail);

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(bookService.getBookById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBookDetail);
    });

    it('should return book with -1 score when not rated', async () => {
      mockRequest.params = { id: '1' };
      const mockBookDetail = new BookDetailResponseDto(1, 'New Book', -1);

      bookService.getBookById.mockResolvedValue(mockBookDetail);

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith(mockBookDetail);
    });

    it('should throw BadRequestError for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await bookController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(bookService.getBookById).not.toHaveBeenCalled();
    });

    it('should handle NotFoundError when book does not exist', async () => {
      mockRequest.params = { id: '999' };
      const error = new NotFoundError('Book not found');
      bookService.getBookById.mockRejectedValue(error);

      try {
        await bookController.getById(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });

  describe('create', () => {
    it('should create a new book', async () => {
      mockRequest.body = { name: '1984' };
      const mockBook = new BookResponseDto(1, '1984');

      bookService.createBook.mockResolvedValue(mockBook);

      await bookController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(bookService.createBook).toHaveBeenCalledWith({ name: '1984' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockBook);
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { name: '' };
      const error = new BadRequestError('Validation failed');
      bookService.createBook.mockRejectedValue(error);

      try {
        await bookController.create(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it('should handle conflict errors for duplicate books', async () => {
      mockRequest.body = { name: 'Existing Book' };
      const error = new BadRequestError('Book with this name already exists');
      bookService.createBook.mockRejectedValue(error);

      try {
        await bookController.create(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it('should create book with trimmed name', async () => {
      mockRequest.body = { name: '  Brave New World  ' };
      const mockBook = new BookResponseDto(1, '  Brave New World  ');

      bookService.createBook.mockResolvedValue(mockBook);

      await bookController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(bookService.createBook).toHaveBeenCalledWith({ 
        name: '  Brave New World  ' 
      });
    });
  });
});


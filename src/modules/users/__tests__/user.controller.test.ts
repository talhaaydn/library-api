import { Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { BadRequestError, NotFoundError } from '../../../common/errors/app.error';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserDetailResponseDto } from '../dto/user-detail-response.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    userService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
    } as any;

    userController = new UserController(userService);

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
    it('should return all users', async () => {
      const mockUsers = [
        new UserResponseDto(1, 'User 1'),
        new UserResponseDto(2, 'User 2'),
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

  });

  describe('getById', () => {
    it('should return user by id with borrowing details', async () => {
      mockRequest.params = { id: '1' };
      const mockUserDetail = new UserDetailResponseDto(1, 'John Doe', {
        past: [{ name: 'Book 1', userScore: 8 }],
        present: [{ name: 'Book 2' }],
      });

      userService.getUserById.mockResolvedValue(mockUserDetail);

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUserDetail);
    });

    it('should throw BadRequestError for invalid id', async () => {
      mockRequest.params = { id: 'invalid' };

      await userController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it('should handle NotFoundError when user does not exist', async () => {
      mockRequest.params = { id: '999' };
      const error = new NotFoundError('User not found');
      userService.getUserById.mockRejectedValue(error);

      try {
        await userController.getById(
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
    it('should create a new user', async () => {
      mockRequest.body = { name: 'New User' };
      const mockUser = new UserResponseDto(1, 'New User');

      userService.createUser.mockResolvedValue(mockUser);

      await userController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.createUser).toHaveBeenCalledWith({ name: 'New User' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { name: '' };
      const error = new BadRequestError('Validation failed');
      userService.createUser.mockRejectedValue(error);

      try {
        await userController.create(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });

  describe('borrowBook', () => {
    it('should allow user to borrow a book', async () => {
      mockRequest.params = { userId: '1', bookId: '2' };
      userService.borrowBook.mockResolvedValue(undefined);

      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.borrowBook).toHaveBeenCalledWith(1, 2);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid userId', async () => {
      mockRequest.params = { userId: 'invalid', bookId: '2' };

      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(userService.borrowBook).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid bookId', async () => {
      mockRequest.params = { userId: '1', bookId: 'invalid' };

      await userController.borrowBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(userService.borrowBook).not.toHaveBeenCalled();
    });
  });

  describe('returnBook', () => {
    it('should allow user to return a book with score', async () => {
      mockRequest.params = { userId: '1', bookId: '2' };
      mockRequest.body = { score: 8 };
      userService.returnBook.mockResolvedValue(undefined);

      await userController.returnBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.returnBook).toHaveBeenCalledWith(1, 2, 8);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid userId', async () => {
      mockRequest.params = { userId: 'invalid', bookId: '2' };
      mockRequest.body = { score: 8 };

      await userController.returnBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(userService.returnBook).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid bookId', async () => {
      mockRequest.params = { userId: '1', bookId: 'invalid' };
      mockRequest.body = { score: 8 };

      await userController.returnBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(userService.returnBook).not.toHaveBeenCalled();
    });

    it('should handle score validation', async () => {
      mockRequest.params = { userId: '1', bookId: '2' };
      mockRequest.body = { score: 10 };
      userService.returnBook.mockResolvedValue(undefined);

      await userController.returnBook(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userService.returnBook).toHaveBeenCalledWith(1, 2, 10);
    });
  });
});


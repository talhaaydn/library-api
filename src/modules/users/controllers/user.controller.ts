import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../../../common/middlewares/async-handler.middleware';
import { BadRequestError } from '../../../common/errors/app.error';

export class UserController {
  constructor(private readonly userService: UserService) {
  }

  public getAll = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await this.userService.getAllUsers();
    res.json(users);
  });

  public getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid user ID');
    }
    const user = await this.userService.getUserById(id);
    res.json(user);
  });

  public create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(user);
  });

  public borrowBook = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = parseInt(req.params.userId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    
    if (isNaN(userId)) {
      throw new BadRequestError('Invalid user ID');
    }
    if (isNaN(bookId)) {
      throw new BadRequestError('Invalid book ID');
    }

    await this.userService.borrowBook(userId, bookId);
    res.status(204).send();
  });

  public returnBook = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = parseInt(req.params.userId, 10);
    const bookId = parseInt(req.params.bookId, 10);
    const { score } = req.body;
    
    if (isNaN(userId)) {
      throw new BadRequestError('Invalid user ID');
    }
    if (isNaN(bookId)) {
      throw new BadRequestError('Invalid book ID');
    }

    await this.userService.returnBook(userId, bookId, score);
    res.status(204).send();
  });
}


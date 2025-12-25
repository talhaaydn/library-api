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
}


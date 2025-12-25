import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { asyncHandler } from '../../../common/middlewares/async-handler.middleware';
import { BadRequestError } from '../../../common/errors/app.error';

export class BookController {
  constructor(private readonly bookService: BookService) {
  }

  public getAll = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const books = await this.bookService.getAllBooks();
    res.json(books);
  });

  public getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new BadRequestError('Invalid book ID');
    }
    const book = await this.bookService.getBookById(id);
    res.json(book);
  });

  public create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const book = await this.bookService.createBook(req.body);
    res.status(201).json(book);
  });
}


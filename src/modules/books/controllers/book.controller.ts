import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { asyncHandler } from '../../../common/middlewares/async-handler.middleware';

export class BookController {
  constructor(private readonly bookService: BookService) {
  }

  public getAll = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const books = await this.bookService.getAllBooks();
    res.json(books);
  });

  public create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const book = await this.bookService.createBook(req.body);
    res.status(201).json(book);
  });
}


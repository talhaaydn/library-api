import { Router } from 'express';
import { BookController } from './controllers/book.controller';
import { BookService } from './services/book.service';
import { BookRepository } from './repositories/book.repository';
import { validationMiddleware } from '../../common/middlewares/validation.middleware';
import { CreateBookDto } from './dto/create-book.dto';
import { AppDataSource } from '../../config/database.config';
import { Book } from './entities/book.entity';

const router = Router();

// Dependency injection setup
const bookRepository = new BookRepository(AppDataSource.getRepository(Book));
const bookService = new BookService(bookRepository);
const bookController = new BookController(bookService);

router.get('/', bookController.getAll);
router.post('/', validationMiddleware(CreateBookDto), bookController.create);

export default router;


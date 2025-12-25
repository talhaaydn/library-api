import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { validationMiddleware } from '../../common/middlewares/validation.middleware';
import { CreateUserDto } from './dto/create-user.dto';
import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';
import { BorrowingService } from '../borrowings/services/borrowing.service';
import { UserBookRepository } from '../borrowings/repositories/user-book.repository';
import { UserBook } from '../borrowings/entities/user-book.entity';
import { BookRepository } from '../books/repositories/book.repository';
import { Book } from '../books/entities/book.entity';
import { ReturnBookDto } from '../borrowings/dto/return-book.dto';

const router = Router();

const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userBookRepository = new UserBookRepository(AppDataSource.getRepository(UserBook));
const bookRepository = new BookRepository(AppDataSource.getRepository(Book));

const borrowingService = new BorrowingService(userBookRepository, bookRepository);
const userService = new UserService(userRepository, borrowingService, bookRepository);

const userController = new UserController(userService);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validationMiddleware(CreateUserDto), userController.create);
router.post('/:userId/borrow/:bookId', userController.borrowBook);
router.post('/:userId/return/:bookId', validationMiddleware(ReturnBookDto), userController.returnBook);

export default router;

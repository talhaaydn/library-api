import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { validationMiddleware } from '../../common/middlewares/validation.middleware';
import { CreateUserDto } from './dto/create-user.dto';
import { AppDataSource } from '../../config/database.config';
import { User } from './entities/user.entity';

const router = Router();

// Dependency injection setup
const userRepository = new UserRepository(AppDataSource.getRepository(User));
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validationMiddleware(CreateUserDto), userController.create);

export default router;

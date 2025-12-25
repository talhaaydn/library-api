import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserDetailResponseDto } from '../dto/user-detail-response.dto';
import { ConflictError, NotFoundError } from '../../../common/errors/app.error';
import { UserMapper } from '../mappers/user.mapper';
import { BorrowingService } from '../../borrowings/services/borrowing.service';
import { BookRepository } from '../../books/repositories/book.repository';

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly borrowingService: BorrowingService,
    private readonly bookRepository: BookRepository
  ) {
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseDtoList(users);
  }

  async getUserById(id: number): Promise<UserDetailResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { past: pastBorrowings, present: presentBorrowings } = 
      await this.borrowingService.getAllBooksByUser(id);
    
    const past = pastBorrowings.map(ub => ({
      name: ub.book.name,
      userScore: ub.score as number
    }));

    const present = presentBorrowings.map(ub => ({
      name: ub.book.name
    }));

    return new UserDetailResponseDto(user.id, user.name, { past, present });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByName(createUserDto.name);
    if (existingUser) {
      throw new ConflictError('User with this name already exists');
    }

    const user = await this.userRepository.create(createUserDto);
    return UserMapper.toResponseDto(user);
  }

  async borrowBook(userId: number, bookId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    await this.borrowingService.createBorrowing(userId, bookId);
  }

  async returnBook(userId: number, bookId: number, score: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    await this.borrowingService.returnBorrowing(userId, bookId, score);
  }
}

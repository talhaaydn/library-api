import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { ConflictError, NotFoundError } from '../../../common/errors/app.error';
import { UserMapper } from '../mappers/user.mapper';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return UserMapper.toResponseDtoList(users);
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserMapper.toResponseDto(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByName(createUserDto.name);
    if (existingUser) {
      throw new ConflictError('User with this name already exists');
    }

    const user = await this.userRepository.create(createUserDto);
    return UserMapper.toResponseDto(user);
  }
}

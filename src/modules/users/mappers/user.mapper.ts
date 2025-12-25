import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

export class UserMapper {
  static toResponseDto(user: User): UserResponseDto {
    return new UserResponseDto(user.id, user.name);
  }

  static toResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponseDto(user));
  }
}


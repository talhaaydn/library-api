import { Book } from '../entities/book.entity';
import { BookResponseDto } from '../dto/book-response.dto';

export class BookMapper {
  static toResponseDto(book: Book): BookResponseDto {
    return new BookResponseDto(book.id, book.name);
  }

  static toResponseDtoList(books: Book[]): BookResponseDto[] {
    return books.map(book => this.toResponseDto(book));
  }
}


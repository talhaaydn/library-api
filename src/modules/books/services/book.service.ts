import { BookRepository } from '../repositories/book.repository';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookResponseDto } from '../dto/book-response.dto';
import { BookDetailResponseDto } from '../dto/book-detail-response.dto';
import { ConflictError, NotFoundError } from '../../../common/errors/app.error';
import { BookMapper } from '../mappers/book.mapper';

export class BookService {
  constructor(
    private readonly bookRepository: BookRepository
  ) {
  }

  async getAllBooks(): Promise<BookResponseDto[]> {
    const books = await this.bookRepository.findAll();
    return BookMapper.toResponseDtoList(books);
  }

  async getBookById(id: number): Promise<BookDetailResponseDto> {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Book not found');
    }

    return new BookDetailResponseDto(book.id, book.name, book.averageScore);
  }

  async createBook(createBookDto: CreateBookDto): Promise<BookResponseDto> {
    const existingBook = await this.bookRepository.findByName(createBookDto.name);
    if (existingBook) {
      throw new ConflictError('Book with this name already exists');
    }

    const book = await this.bookRepository.create(createBookDto);
    return BookMapper.toResponseDto(book);
  }
}


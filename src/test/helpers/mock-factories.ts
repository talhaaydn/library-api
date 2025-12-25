import { User } from '../../modules/users/entities/user.entity';
import { Book } from '../../modules/books/entities/book.entity';
import { UserBook } from '../../modules/borrowings/entities/user-book.entity';

export class MockFactory {
  static createUser(overrides?: Partial<User>): User {
    const user = new User();
    user.id = 1;
    user.name = 'Test User';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return { ...user, ...overrides };
  }

  static createUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) => 
      this.createUser({ id: i + 1, name: `Test User ${i + 1}` })
    );
  }

  static createBook(overrides?: Partial<Book>): Book {
    const book = new Book();
    book.id = 1;
    book.name = 'Test Book';
    book.averageScore = -1;
    book.createdAt = new Date();
    book.updatedAt = new Date();
    return { ...book, ...overrides };
  }

  static createBooks(count: number): Book[] {
    return Array.from({ length: count }, (_, i) => 
      this.createBook({ id: i + 1, name: `Test Book ${i + 1}` })
    );
  }

  static createUserBook(overrides?: Partial<UserBook>): UserBook {
    const userBook = new UserBook();
    userBook.id = 1;
    userBook.userId = 1;
    userBook.bookId = 1;
    userBook.score = null;
    userBook.borrowedAt = new Date();
    userBook.returnedAt = null;
    userBook.user = this.createUser({ id: 1 });
    userBook.book = this.createBook({ id: 1 });
    return { ...userBook, ...overrides };
  }

  static createUserBooks(count: number): UserBook[] {
    return Array.from({ length: count }, (_, i) => 
      this.createUserBook({ id: i + 1, userId: 1, bookId: i + 1 })
    );
  }
}


interface PastBook {
  name: string;
  userScore: number;
}

interface PresentBook {
  name: string;
}

interface UserBooks {
  past: PastBook[];
  present: PresentBook[];
}

export class UserDetailResponseDto {
  id: number;
  name: string;
  books: UserBooks;

  constructor(id: number, name: string, books: UserBooks) {
    this.id = id;
    this.name = name;
    this.books = books;
  }
}


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { Genre } from './entity/genre.entity';
import { CreateGenre } from './dto/create-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}


  //------------------ GET all genres ------------------//

  findAll(): Promise<Genre[]> {
    return this.genreRepository.find({
      order: {
        genre_name: 'ASC',
      },
    });
  }


  //------------------ POST new genre ------------------//

  async create(dto: CreateGenre): Promise<Genre> {
    const genre = this.genreRepository.create({
      genre_pk: randomUUID().replace(/-/g, ''),
      genre_name: dto.name,
    });

    return this.genreRepository.save(genre);
  }
}
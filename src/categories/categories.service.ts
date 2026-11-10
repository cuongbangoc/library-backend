import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name
      },
    });

    if (category) {
      throw new BadRequestException('Category exists');
    }

    const newCategory = this.categoryRepository.create({
      name: createCategoryDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.categoryRepository.save(newCategory);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existsCategory = await this.categoryRepository.findOne({
      where: {
        name: updateCategoryDto.name,
        id: Not(id)
      }
    });

    if (existsCategory) {
      throw new BadRequestException('Name exists');
    }

    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    category.name = updateCategoryDto.name || category.name;
    category.updatedAt = new Date();
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return this.categoryRepository.remove(category);
  }
}

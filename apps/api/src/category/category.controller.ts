import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from '@tkat-backend/category';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@tkat-backend/shared';
import { Permissions } from '../auth/permission.decorator';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Permissions('CATEGORY:CREATE')
  @Post()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<CategoryDto> {
    return this.categoryService.createCategory(createCategoryDto);
  }

  @Permissions('CATEGORY:LIST')
  @Get()
  async getCategories(): Promise<CategoryDto[]> {
    return this.categoryService.findAllCategories();
  }

  @Permissions('CATEGORY:LIST')
  @Get('department/:departmentId')
  async findCategoriesByDepartmentId(
    @Param('departmentId') departmentId: string
  ): Promise<CategoryDto[]> {
    return this.categoryService.findCategoriesByDepartmentId(departmentId);
  }

  @Permissions('CATEGORY:LIST')
  @Get(':id')
  async getCategoryById(
    @Param('id') id: string
  ): Promise<CategoryDto | undefined> {
    return this.categoryService.findCategoryById(id);
  }

  @Permissions('CATEGORY:UPDATE')
  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryDto> {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Permissions('CATEGORY:DELETE')
  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoryService.deleteCategory(id);
  }
}

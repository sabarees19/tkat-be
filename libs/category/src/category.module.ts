import { forwardRef, Module } from '@nestjs/common';
import { DepartmentLibModule } from '@tkat-backend/department';
import {
  categoryApproverModelProvider,
  categoryModelProvider,
} from '@tkat-backend/shared';
import { UserLibModule } from '@tkat-backend/user';
import { UtilsModule } from '@tkat-backend/utils';
import { CategoryApproverRepository } from './category-approver.repository';
import { CategoryApproverService } from './category-approver.service';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { TemplateLibModule } from '@tkat-backend/template';

@Module({
  imports: [UtilsModule, DepartmentLibModule, UserLibModule, forwardRef(() => TemplateLibModule)],
  providers: [
    CategoryService,
    CategoryRepository,
    categoryModelProvider,
    CategoryApproverService,
    CategoryApproverRepository,
    categoryApproverModelProvider,
  ],
  exports: [CategoryService, CategoryApproverService],
})
export class CategoryLibModule {}

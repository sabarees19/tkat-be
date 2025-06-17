import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateQuestionDto, CreateTemplateDto, UpdateQuestionDto, UpdateTemplateDto } from "@tkat-backend/shared";
import { QuestionService, ResponseService, TemplateService } from "@tkat-backend/template";
import { Permissions } from "../auth/permission.decorator";

@Controller()
export class TemplateController {
  constructor(private readonly templateService: TemplateService, private readonly questionService: QuestionService, private readonly responseService: ResponseService) {}

  @Permissions('TEMPLATE:LIST')
  @Get('template')
  async getTemplates() {
      return this.templateService.findAllTemplates();
  }

  @Permissions('TEMPLATE:LIST')
  @Get('template/:id')
  async getTemplate(@Param('id') id: string) {
      return this.templateService.findTemplateById(id);
  }

  @Permissions('TEMPLATE:CREATE')
  @Post('template')
  async createTemplate(@Body() template: CreateTemplateDto) {
      return this.templateService.createTemplate(template);
  }

  @Permissions('TEMPLATE:UPDATE')
  @Patch('template/:id')
  async updateTemplate(@Param('id') id: string, @Body() template: UpdateTemplateDto) {
      return this.templateService.updateTemplate(id, template);
  }

  @Permissions('TEMPLATE:DELETE')
  @Delete('template/:id')
  async deleteTemplate(@Param('id') id: string) {
      return this.templateService.deleteTemplate(id);
  }

  @Permissions('TEMPLATE:LIST')
  @Get('question/template/:id')
  async getQuestionsByTemplateId(@Param('id') id: string) {
      return this.questionService.findQuestionsByTemplateId(id);
  }

  @Permissions('TEMPLATE:CREATE')
  @Post('question')
  async createQuestion(@Body() question: CreateQuestionDto) {
      return this.questionService.createQuestion(question);
  }

  @Permissions('TEMPLATE:UPDATE')
  @Patch('question/:id')
  async updateQuestion(@Param('id') id: string, @Body() question: UpdateQuestionDto) {
      return this.questionService.updateQuestion(id, question);
  }

  @Permissions('TEMPLATE:UPDATE')
  @Delete('question/:id')
  async deleteQuestion(@Param('id') id: string) {
      return this.questionService.deleteQuestion(id);
  }
}

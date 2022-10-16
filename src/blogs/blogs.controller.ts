import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('blogs')
export class BlogsController {
  @Get()
  @UseGuards(JwtAuthGuard)
  hello() {
    return 'hello';
  }
}

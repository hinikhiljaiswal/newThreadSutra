import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsOptional()
  @IsString()
  loginId?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('demo')
  demo() {
    return this.auth.demoInfo();
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    const user = this.auth.verify(authorization);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

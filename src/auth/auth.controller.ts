import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { AdminPasscodeSignupDto } from './dto/admin-passcode-signup.dto';
import { AdminPasscodeLoginDto } from './dto/admin-passcode-login.dto';
import { SuperadminPasscodeSignupDto } from './dto/superadmin-passcode-signup.dto';
import { CustomerPasscodeSignupDto } from './dto/customer-passcode-signup.dto';
import { CustomerPasscodeLoginDto } from './dto/customer-passcode-login.dto';

@Throttle({ default: { limit: 30, ttl: 60_000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('superadmin/bootstrap-available')
  superadminBootstrapAvailable() {
    return this.auth.isSuperadminBootstrapAvailable();
  }

  @Public()
  @Post('admin/passcode/signup')
  signupAdminWithPasscode(@Body() dto: AdminPasscodeSignupDto) {
    return this.auth.signupAdminWithPasscode({
      phone: dto.phone,
      countryCode: dto.countryCode,
      passcode: dto.passcode,
      confirmPasscode: dto.confirmPasscode,
      fullName: dto.fullName ?? null,
      email: dto.email ?? null,
    });
  }

  @Public()
  @Post('admin/passcode/login')
  loginAdminWithPasscode(@Body() dto: AdminPasscodeLoginDto) {
    return this.auth.loginAdminWithPasscode({
      phone: dto.phone,
      countryCode: dto.countryCode,
      passcode: dto.passcode,
    });
  }

  @Public()
  @Post('superadmin/passcode/signup')
  signupSuperadminWithPasscode(@Body() dto: SuperadminPasscodeSignupDto) {
    return this.auth.signupSuperadminWithPasscode({
      phone: dto.phone,
      countryCode: dto.countryCode,
      passcode: dto.passcode,
      confirmPasscode: dto.confirmPasscode,
      fullName: dto.fullName,
      email: dto.email,
    });
  }

  @Public()
  @Post('customer/passcode/signup')
  signupCustomerWithPasscode(@Body() dto: CustomerPasscodeSignupDto) {
    return this.auth.signupCustomerWithPasscode({
      phone: dto.phone,
      countryCode: dto.countryCode,
      passcode: dto.passcode,
      confirmPasscode: dto.confirmPasscode,
      fullName: dto.fullName ?? null,
      email: dto.email ?? null,
      profession: dto.profession ?? null,
      deliveryAddress: dto.deliveryAddress ?? null,
    });
  }

  @Public()
  @Post('customer/passcode/login')
  loginCustomerWithPasscode(@Body() dto: CustomerPasscodeLoginDto) {
    return this.auth.loginCustomerWithPasscode({
      phone: dto.phone,
      countryCode: dto.countryCode,
      passcode: dto.passcode,
    });
  }
}

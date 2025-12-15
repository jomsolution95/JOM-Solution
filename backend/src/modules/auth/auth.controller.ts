import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { AccessTokenGuard } from './guards/at.guard';
import { RefreshTokenGuard } from './guards/rt.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('emergency-fix')
    async emergencyFix() {
        return this.authService.forceResetSuperAdmin();
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.register(dto);
        this.setRefreshTokenCookie(res, tokens.refresh_token);
        return { access_token: tokens.access_token };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto);
        this.setRefreshTokenCookie(res, result.refresh_token);
        return { access_token: result.access_token, user: result.user };
    }

    @UseGuards(AccessTokenGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@GetUser('sub') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(userId);
        res.clearCookie('Refresh');
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        const tokens = await this.authService.refreshTokens(userId, refreshToken);
        this.setRefreshTokenCookie(res, tokens.refresh_token);
        return { access_token: tokens.access_token };
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('Refresh', token, {
            httpOnly: true,
            secure: true, // Should be true in production
            sameSite: 'lax',
            path: '/',
        });
    }

    // --- Social Login ---

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        const { access_token, refresh_token } = req.user;
        this.setRefreshTokenCookie(res, refresh_token);
        res.redirect(`http://localhost:5173/social-callback?token=${access_token}`);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
        const { access_token, refresh_token } = req.user;
        this.setRefreshTokenCookie(res, refresh_token);
        res.redirect(`http://localhost:5173/social-callback?token=${access_token}`);
    }

    @Get('linkedin')
    @UseGuards(AuthGuard('linkedin'))
    async linkedinAuth() { }

    @Get('linkedin/callback')
    @UseGuards(AuthGuard('linkedin'))
    async linkedinAuthRedirect(@Req() req: any, @Res() res: Response) {
        const { access_token, refresh_token } = req.user;
        this.setRefreshTokenCookie(res, refresh_token);
        res.redirect(`http://localhost:5173/social-callback?token=${access_token}`);
    }
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: { token: string; email: string; password: string }) {
        return this.authService.resetPassword(dto.token, dto.email, dto.password);
    }
}

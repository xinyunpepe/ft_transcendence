import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FtAuthGuard } from './guards/42auth.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService
	) {}
	/*
	** GET /auth/login
	** The route to authenticate login
	*/
	@UseGuards(FtAuthGuard)
	@Get('login')
	login() {
		return;
	}

	/*
	** GET /auth/redirect
	** The redirect URL the OAuth provider will call
	*/
	@UseGuards(FtAuthGuard)
	@Get('redirect')
	async redirect(@Req() req, @Res() res) {
		if (req.user) {
			console.log('Start creating token');
			const token = await this.authService.login(req.user);
			// console.log('token: ', token);
			res.cookie('access_token', token.access_token)
		}
		// console.log('user: ', req.user);
		res.status(302).redirect('http://localhost:8080/dashboard');
	}
}

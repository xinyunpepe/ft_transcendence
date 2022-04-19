import { Body, Controller, Get, Post, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { TwoFactorAuthDto } from './dto/2fa.dto';
import { TwoFactorGuard } from './guards/2fa.guard';
import { FtAuthGuard } from './guards/42auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

/*
** the user logs in using 42 auth, and we respond with a JWT token,
** 	- if the 2FA is turned off, we give full access to the user,
** 	- if the 2FA is turned on, we provide the access just to the /2fa/authenticate endpoint,
** 	the user looks up Google Authenticator code and sends it to the /2fa/authenticate endpoint,
** 	we respond with a new JWT token with full access.
*/

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}
	/*
	** GET /auth/login
	** The route to 42 authenticate login
	*/
	@UseGuards(FtAuthGuard)
	@Get('login')
	login() {
		return;
	}

	/*
	** GET /auth/redirect
	** The redirect URL once 42auth is done
	** Generate jwt token and save it to cookie
	** If 2FA is disabled, set user status to 'online'(?) and redirect to frontend dashboard
	** If 2FA is enabled, redirect to frontend 2fa/authenticate(?)
	*/
	@UseGuards(FtAuthGuard)
	@Get('redirect')
	// @Redirect('http://localhost:3030/dashboard')
	async redirect(
		@Req() req,
		@Res() res
	) {
		const user = req.user;
		if (user) {
			// console.log(`${ user.login } is ${ user.status } now`);
			const token = await this.authService.login(user);
			res.cookie('accessToken', token.access_token);
		}
		const currentUser = await this.userService.findOneUser(user.login);
		if (currentUser.isTwoFactorAuthEnabled === true) {
			res.redirect('http://localhost:3030/2fa/authenticate');
			return ;
		}
		await this.userService.updateUserStatus(user.login, 'online');
		res.redirect('http://localhost:3030/dashboard');
	}

	/*
	** POST /auth/2fa/authenticate
	** Authenticate the code from Google Authenticator
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/authenticate')
	async authenticate(
		@Req() req,
		@Res() res,
		@Body() { twoFactorAuthCode }: TwoFactorAuthDto
	){
		console.log('Authenticating 2FA');
		const currentUser = await this.userService.findOneUser(req.user.login);
		const isValid = this.authService.isTwoFactorAuthCodeValid(twoFactorAuthCode, currentUser);
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		const token = await this.authService.loginWithTwoFactorAuth(currentUser, true);
		res.clearCookie('accessToken');
		res.cookie('accessToken', token.access_token);
		await this.userService.updateUserStatus(currentUser.login, 'online');
		res.redirect('http://localhost:3030/dashboard');
	}

	/*
	** POST /auth/2fa/generate
	** Generate QRcode for 2FA
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/generate')
	async generateTwoFactorAuthQrCode(
		@Req() req,
		@Res() res
	) {
		console.log('Creating Qrcode');
		const otpauthUrl = await this.authService.generateTwoFactorAuthSecret(req.user);
		return this.authService.pipeQrCodeStream(res, otpauthUrl);
	}

	/*
	** POST /auth/2fa/turn-on
	** Activate 2FA and set isTwoFactorAuthEnabled to true
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/turn-on')
	async turnOnTwoFactorAuth(
		@Req() req,
		@Body() { twoFactorAuthCode }: TwoFactorAuthDto
	){
		console.log('Turning on 2FA');
		const currentUser = await this.userService.findOneUser(req.user.login);
		console.log(currentUser);
		const isValid = this.authService.isTwoFactorAuthCodeValid(twoFactorAuthCode, currentUser);
		console.log(isValid)
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		await this.userService.turnOnTwoFactorAuth(currentUser.login);
	}

	/*
	** POST /auth/2fa/turn-off
	** Set isTwoFactorAuthEnabled to false
	*/
	@UseGuards(TwoFactorGuard)
	@Post('2fa/turn-off')
	async turnOffTwoFactorAuth(@Req() req) {
		console.log('Turning off 2FA');
		await this.userService.turnOffTwoFactorAuth(req.user.login);
	}

	/*
	** POST /auth/logout
	** Log user out
	** Set user status to 'offline'
	** Clear accessToken cookie
	** Redirect to frontend
	*/
	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(
		@Req() req,
		@Res() res
	) {
		console.log('Start logging out');
		await this.userService.updateUserStatus(req.user.login, 'offline');
		res.clearCookie('accessToken');
		res.redirect('http://localhost:3030');
	}
}

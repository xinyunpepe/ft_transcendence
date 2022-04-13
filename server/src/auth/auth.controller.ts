import { Body, Controller, Get, Post, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { TwoFactorAuthDto } from './dto/2fa.dto';
import { FtAuthGuard } from './guards/42auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

/*
**	the user logs in using 42 auth, and we respond with a JWT token,
**		- if the 2FA is turned off, we give full access to the user,
**		- if the 2FA is turned on, we provide the access just to the /2fa/authenticate endpoint,
**		the user looks up the Authenticator application code and sends it to the /2fa/authenticate endpoint,
**		we respond with a new JWT token with full access.
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
	** Set user status to 'online'?
	** Generate jwt token and save it to cookie
	** Redirect to frontend
	*/
	@UseGuards(FtAuthGuard)
	@Get('redirect')
	@Redirect('http://localhost:3030/dashboard')
	async redirect(
		@Req() req,
		@Res() res
	) {
		const user = req.user;
		if (user) {
			await this.userService.updateUserStatus(user.login, 'online');
			// console.log(`${ user.login } is ${ user.status } now`);
			const token = await this.authService.login(user);
			res.cookie('accessToken', token.access_token);
		}
		if (user.isTwoFactorAuthEnabled) {
			return ;
		}
		return user;
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
		if (!isValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		const token = await this.authService.loginWithTwoFactorAuth(currentUser, true);
		res.cookie('accessToken', token.access_token);
		return currentUser;
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
		const isVallid = this.authService.isTwoFactorAuthCodeValid(twoFactorAuthCode, currentUser);
		console.log(isVallid)
		if (!isVallid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFactorAuth(currentUser.login);
	}

	/*
	** POST /auth/2fa/turn-off
	** Set isTwoFactorAuthEnabled to false
	*/
	@UseGuards(JwtAuthGuard)
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
		res.cookie('accessToken', '');
		res.redirect('http://localhost:3030');
	}
}

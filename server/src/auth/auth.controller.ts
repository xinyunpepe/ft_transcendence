import { Body, Controller, Get, Post, Put, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { join } from 'path';
import { of } from 'rxjs';
import { UserI, UserStatus } from 'src/user/model/user/user.interface';
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
	async redirect(
		@Req() req,
		@Res() res
	) {
		const user: UserI = req.user;
		if (user) {
			// console.log(`${ user.login } is ${ user.status } now`);
			const token = await this.authService.login(user);
			res.cookie('accessToken', token.access_token);
		}
		const currentUser = await this.userService.findUserByLogin(user.login);
		if (currentUser.isTwoFactorAuthEnabled === true) {
			res.redirect('http://localhost:4200/2fa/authenticate');
			return ;
		}
		await this.userService.onlineStatus(user.id, UserStatus.ON);
		res.redirect(`http://localhost:4200/private/profile`);
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
		const currentUser = await this.userService.findUserByLogin(req.user.login);
		const isValid = this.authService.isTwoFactorAuthCodeValid(twoFactorAuthCode, currentUser);
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		const token = await this.authService.loginWithTwoFactorAuth(currentUser, true);
		res.clearCookie('accessToken');
		res.cookie('accessToken', token.access_token);
		await this.userService.onlineStatus(currentUser.id, UserStatus.ON);
		res.redirect(`http://localhost:4200/private/profile`);
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
		return this.authService.pipeQrCodeStream(otpauthUrl);
	}

	@Get('2fa/qrcode')
	async getQrCode(
		@Res() res
	) {
		return of(res.sendFile(join(process.cwd(), 'src/uploads/qrcode/qrcode.png')));
	}

	/*
	** POST /auth/2fa/turn-on
	** Activate 2FA and set isTwoFactorAuthEnabled to true
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/turn-on')
	async turnOnTwoFactorAuth(
		@Req() req,
	){
		console.log('Turning on 2FA');
		const user = await this.userService.findUserById(req.user.id);
		const isValid = this.authService.isTwoFactorAuthCodeValid(req.body.code, req.body.user);
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		await this.userService.turnOnTwoFactorAuth(user.id);
	}

	/*
	** POST /auth/2fa/turn-off
	** Set isTwoFactorAuthEnabled to false
	*/
	// @UseGuards(TwoFactorGuard)
	@UseGuards(JwtAuthGuard)
	@Post('2fa/turn-off')
	async turnOffTwoFactorAuth(
		@Req() req
	) {
		console.log('Turning off 2FA');
		const user = await this.userService.findUserById(req.user.id);
		const isValid = this.authService.isTwoFactorAuthCodeValid(req.body.code, req.body.user);
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		await this.userService.turnOffTwoFactorAuth(user.id);
	}

	/*
	** POST /auth/logout
	** Log user out
	** Set user status to 'offline'
	** Clear accessToken cookie
	** Redirect to frontend
	*/
	@UseGuards(JwtAuthGuard)
	@Put('logout')
	async logout(
		@Body() user: UserI,
		@Res() res
	) {
		console.log('Start logging out');
		await this.userService.offlineStatus(user.id, UserStatus.OFF);
		res.clearCookie('accessToken');
		// res.redirect('http://localhost:4200/public/login');
	}
}

import { Body, Controller, Get, Post, Put, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { join } from 'path';
import { of } from 'rxjs';
import { UserI, UserStatus } from 'src/user/model/user/user.interface';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { TwoFactorGuard } from './guards/2fa.guard';
import { FtAuthGuard } from './guards/42auth.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

/*
** the user logs in using 42 auth, and we respond with a JWT token,
** 	- if the 2FA is turned off, we give full access to the user,
** 	- if the 2FA is turned on, we provide the access just to the /2fa/authenticate endpoint,
** 	the user looks up Google Authenticator code and sends it to the /2fa/authenticate endpoint,
** 	we respond with a another JWT token with full access.
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
	** GET /auth/call-back
	** The redirect URL once 42auth is done
	** Send user info and access token back to front and save token to local storage
	** If 2FA is disabled, set user status to 'online' and redirect to profile page(front)
	** If 2FA is enabled, redirect to 2fa auth page(front)
	*/
	@UseGuards(FtAuthGuard)
	@Get('redirect/call-back')
	async redirect(
		@Req() req,
		@Res() res
	) {
		const login = await this.authService.login(req.user);
		const user = await this.userService.findUserById(req.user.id);
		const sendback = {
			id: user.id,
			isTwofactorAuthEnabled: user.isTwoFactorAuthEnabled,
			token: login.access_token,
		}
		try {
			res.send(JSON.stringify(sendback));
		}
		catch (err) {
			res.redirect('http://localhost:4200');
		}
	}

	/*
	** POST /auth/2fa/authenticate
	** Authenticate the code from Google Authenticator
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/authenticate')
	async authenticate(
		@Req() req
	){
		const user = await this.userService.findUserById(req.user.id);
		const isValid = this.authService.isTwoFactorAuthCodeValid(req.body.code, req.body.user);
		if (!isValid)
			throw new UnauthorizedException('Wrong authentication code');
		const token = await this.authService.loginWithTwoFactorAuth(user, true);
		await this.userService.onlineStatus(user.id, UserStatus.ON);
		return JSON.stringify(token);
	}

	/*
	** POST /auth/2fa/generate
	** Generate QRcode for 2FA
	*/
	@UseGuards(JwtAuthGuard)
	@Post('2fa/generate')
	async generateTwoFactorAuthQrCode(
		@Req() req
	) {
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
	** Clear tokens from localstorage(front)
	*/
	@UseGuards(JwtAuthGuard)
	@Put('logout')
	async logout(
		@Body() user: UserI
	) {
		// TODO -1?
		await this.userService.offlineStatus(user.id, UserStatus.OFF);
	}
}

import { Controller, Get, Response, UseGuards } from "@nestjs/common";
import { FtAuthGuard } from "./utils/42auth.guard";

@Controller('auth')
export class FtAuthController {

	/*
	** GET /auth/login
	** The route to authenticate login
	*/
	@UseGuards(FtAuthGuard)
	@Get('login')
	login() {
		return { message: "login" };
	}

	/*
	** GET /auth/redirect
	** The redirect URL the OAuth provider will call
	*/
	@UseGuards(FtAuthGuard)
	@Get('redirect')
	redirect(@Response() res) {
		res.redirect('http://localhost:8080/dashboard');
	}
}

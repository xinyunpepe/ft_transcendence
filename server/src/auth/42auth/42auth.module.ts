import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { FtAuthController } from "./42auth.controller";
import { FtAuthStrategy } from "./utils/42auth.strategy";
import { SessionSerializer } from "./utils/session.serializer";

@Module({
	imports: [
		UserModule
	],
	providers: [FtAuthStrategy, UserService, SessionSerializer],
	controllers: [FtAuthController]
})
export class FtAuthModule {}

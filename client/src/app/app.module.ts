import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './public/components/login/login.component';
import { JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function tokenGetter() {
	return localStorage.getItem('access_token');
}

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		JwtModule.forRoot({
			config: {
				tokenGetter: tokenGetter,
				allowedDomains: ['localhost:3000']
			}
		})
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtHelperService, JWT_OPTIONS  } from '@auth0/angular-jwt';
import { NavbarComponent } from './public/components/navbar/navbar.component';

@NgModule({
	declarations: [
		AppComponent,
		NavbarComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule
	],
	providers: [
		{ provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
		JwtHelperService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

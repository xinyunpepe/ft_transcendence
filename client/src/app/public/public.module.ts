import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PublicRoutingModule } from './public-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TwoFactorAuthComponent } from './components/two-factor-auth/two-factor-auth.component';
import { CallBackComponent } from './components/call-back/call-back.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
	declarations: [
		LoginComponent,
		PageNotFoundComponent,
		TwoFactorAuthComponent,
		CallBackComponent
	],
	imports: [
		CommonModule,
		PublicRoutingModule,
		MatButtonModule,
		MatInputModule,
		MatCardModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class PublicModule { }

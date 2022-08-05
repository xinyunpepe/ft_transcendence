import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PublicRoutingModule } from './public-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TwoFactorAuthComponent } from './components/two-factor-auth/two-factor-auth.component';
import { CallBackComponent } from './components/call-back/call-back.component';

@NgModule({
	declarations: [
		PageNotFoundComponent,
		TwoFactorAuthComponent,
		CallBackComponent
	],
	imports: [
		CommonModule,
		PublicRoutingModule,
		MatButtonModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class PublicModule { }

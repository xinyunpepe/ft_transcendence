import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallBackComponent } from './components/call-back/call-back.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TwoFactorAuthComponent } from './components/two-factor-auth/two-factor-auth.component';

const routes: Routes = [
	{ path: 'two-factor-auth', component: TwoFactorAuthComponent },
	{ path: 'call-back', component: CallBackComponent },
	{ path: 'login', component: LoginComponent },
	// { path: '**', component: PageNotFoundComponent },
	{ path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
  })
export class PublicRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	// { path: '**', component: PageNotFoundComponent },
	{ path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
  })
export class PublicRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../public/components/page-not-found/page-not-found.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
	{ path: 'profile',
		children: [
			// { path: '', component: ProfileComponent},
			{ path: ':login', component: ProfileComponent}
		]  },
	{ path: '**', component: PageNotFoundComponent },
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PrivateRoutingModule { }

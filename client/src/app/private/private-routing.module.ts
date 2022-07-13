import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from '../public/components/page-not-found/page-not-found.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DashboardChannelComponent } from './components/dashboard-channel/dashboard-channel.component';
import { CreateChannelComponent } from './components/create-channel/create-channel.component';
import { GameComponent } from './components/game/game.component';

const routes: Routes = [
	{ path: 'profile',
		children: [
			{ path: '', component: ProfileComponent},
			// { path: ':userLogin', component: ProfileComponent}
		]
	},
	{ path: 'dashboard-channel', component: DashboardChannelComponent },
	{ path: 'create-channel', component: CreateChannelComponent },
	{ path: 'game', component: GameComponent },
	{ path: 'logout', component: LogoutComponent },
	{ path: '**', component: PageNotFoundComponent },
];

@NgModule({
	declarations: [],
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PrivateRoutingModule { }

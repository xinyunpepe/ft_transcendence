import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DashboardChannelComponent } from './components/dashboard-channel/dashboard-channel.component';
import { CreateChannelComponent } from './components/create-channel/create-channel.component';
import { GameComponent } from './components/game/game.component';
import { EditChannelComponent } from './components/edit-channel/edit-channel.component';
import { ExploreChannelComponent } from './components/explore-channel/explore-channel.component';
import { ProfileUserComponent } from './components/profile-user/profile-user.component';
import { ProfileSettingComponent } from './components/profile-setting/profile-setting.component';
import { EnableTwoFactorComponent } from './components/enable-two-factor/enable-two-factor.component';
import { DisableTwoFactorComponent } from './components/disable-two-factor/disable-two-factor.component';

const routes: Routes = [
	{ path: 'profile',
		children: [
			{ path: '', component: ProfileComponent },
			{ path: ':id', component: ProfileUserComponent }
		]
	},
	{ path: 'dashboard-channel', component: DashboardChannelComponent },
	{ path: 'explore-channel', component: ExploreChannelComponent },
	{ path: 'create-channel', component: CreateChannelComponent },
	{ path: 'edit-channel/:id', component: EditChannelComponent },
	{ path: 'profile-setting', component: ProfileSettingComponent },
	{ path: 'enable-two-factor', component: EnableTwoFactorComponent },
	{ path: 'disable-two-factor', component: DisableTwoFactorComponent },
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

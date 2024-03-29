import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './components/profile/profile.component';
import { PrivateRoutingModule } from './private-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LogoutComponent } from './components/logout/logout.component';
import { DashboardChannelComponent } from './components/dashboard-channel/dashboard-channel.component';
import { CreateChannelComponent } from './components/create-channel/create-channel.component';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SelectUsersChannelComponent } from './components/select-users-channel/select-users-channel.component';
import { ChatChannelComponent } from './components/chat-channel/chat-channel.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { GameComponent } from './components/game/game.component';
import { EditChannelComponent } from './components/edit-channel/edit-channel.component';
import { ExploreChannelComponent } from './components/explore-channel/explore-channel.component';
import { JoinChannelComponent } from './components/join-channel/join-channel.component';
import { ProfileUserComponent } from './components/profile-user/profile-user.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ProfileSettingComponent } from './components/profile-setting/profile-setting.component';
import { EnableTwoFactorComponent } from './components/enable-two-factor/enable-two-factor.component';
import { DisableTwoFactorComponent } from './components/disable-two-factor/disable-two-factor.component';
import { FriendSettingComponent } from './components/friend-setting/friend-setting.component';

@NgModule({
	declarations: [
		NavbarComponent,
		ProfileComponent,
		LogoutComponent,
		DashboardChannelComponent,
		CreateChannelComponent,
		SelectUsersChannelComponent,
		ChatChannelComponent,
		ChatMessageComponent,
		GameComponent,
		EditChannelComponent,
		ExploreChannelComponent,
		JoinChannelComponent,
		ProfileUserComponent,
		PageNotFoundComponent,
		ProfileSettingComponent,
		EnableTwoFactorComponent,
		DisableTwoFactorComponent,
		FriendSettingComponent
	],
	imports: [
		CommonModule,
		PrivateRoutingModule,
		MatListModule,
		MatPaginatorModule,
		MatCardModule,
		MatDialogModule,
		MatButtonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatRadioModule,
		MatInputModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatIconModule,
		FormsModule,
		MatSlideToggleModule,
		MatStepperModule,
		MatSidenavModule
	]
})
export class PrivateModule { }

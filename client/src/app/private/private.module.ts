import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './components/profile/profile.component';
import { PrivateRoutingModule } from './private-routing.module';

@NgModule({
	declarations: [
		ProfileComponent
	],
	imports: [
		CommonModule,
		PrivateRoutingModule
	]
})
export class PrivateModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PublicRoutingModule } from './public-routing.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
	declarations: [
		PageNotFoundComponent
	],
	imports: [
		CommonModule,
		PublicRoutingModule,
		MatButtonModule
	]
})
export class PublicModule { }

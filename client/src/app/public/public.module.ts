import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PublicRoutingModule } from './public-routing.module';

@NgModule({
	declarations: [
		PageNotFoundComponent
	],
	imports: [
		CommonModule,
		PublicRoutingModule
	]
})
export class PublicModule { }

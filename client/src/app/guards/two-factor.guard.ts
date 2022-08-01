import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";
import { AuthService } from '../public/services/auth/auth.service';

@Injectable({
	providedIn: 'root'
})
export class TwoFactorGuard implements CanActivate {

	constructor(
		private router: Router,
		private authService: AuthService
	) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const helper = new JwtHelperService();

		// TODO 
		if (helper.isTokenExpired(this.authService.getAccessToken())) {
			this.router.navigate(['']);
			return false;
		}
		else {
			return true;
		}
	}
}

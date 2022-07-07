import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { UserI } from 'src/app/model/user.interface';
import { ChatService } from '../../services/chat/chat.service';

@Component({
	selector: 'app-create-channel',
	templateUrl: './create-channel.component.html',
	styleUrls: ['./create-channel.component.css']
})
export class CreateChannelComponent implements OnInit {

	radiocheck: boolean = true;
	beforeType: string = 'public';

	form: FormGroup = new FormGroup({
		name: new FormControl(null, [Validators.required]),
		users: new FormArray([], [Validators.required]),
		type: new FormControl({ value: 'public', disabled: false }, [Validators.required]),
		password: new FormControl({ value: '', disabled: true }),
		// type: new FormControl({ value: 'public' }, [Validators.required]),
		// admin: new FormArray([]),
		// muted: new FormArray([]),
	});

	constructor(
		private chatService: ChatService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	ngOnInit(): void {
	}

	create() {
		// if (this.form.valid) {
		// 	this.chatService.createChannel(this.form.getRawValue());
		// 	this.router.navigate(['../dashboard-channel'], { relativeTo: this.activatedRoute });
		// }
	}

	initUser(user: UserI) {
		return new FormControl({
			id: user.id,
			login: user.login,
			username: user.username
		});
	}

	addUser(userFormControl: FormControl) {
		this.users.push(userFormControl);
	}

	get name(): FormControl {
		return this.form.get('name') as FormControl;
	}

	get users(): FormArray {
		return this.form.get('users') as FormArray;
	}

	removeUser(userId: number) {
		this.users.removeAt(this.users.value.findIndex((user: UserI) => user.id === userId));
	}

	radioType($event: MatRadioChange) {
		if ($event.value == 'public') {
			this.form.get('type')!.setValue('public');
			this.beforeType = 'public';
		}
		else {
			this.form.get('type')!.setValue('private');
			this.beforeType = 'private';
		}
	}

	radioPassword($event: MatRadioChange) {
		if ($event.value == 'no') {
			this.form.get('password')!.clearValidators();
			this.form.get('password')!.disable();
			this.form.get('password')!.setValue('');
			this.form.get('type')!.setValue(this.beforeType);
		}
		else {
			this.form.get('password')!.setValidators([Validators.required]);
			this.form.get('password')!.enable();
			this.form.get('type')!.setValue('protected');
		}
	}
}

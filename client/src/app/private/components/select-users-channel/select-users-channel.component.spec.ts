import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUsersChannelComponent } from './select-users-channel.component';

describe('SelectUsersChannelComponent', () => {
  let component: SelectUsersChannelComponent;
  let fixture: ComponentFixture<SelectUsersChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUsersChannelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectUsersChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

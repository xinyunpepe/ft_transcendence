import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendSettingComponent } from './friend-setting.component';

describe('FriendSettingComponent', () => {
  let component: FriendSettingComponent;
  let fixture: ComponentFixture<FriendSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FriendSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

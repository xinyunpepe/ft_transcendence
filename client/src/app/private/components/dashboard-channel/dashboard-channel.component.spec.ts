import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChannelComponent } from './dashboard-channel.component';

describe('ChatComponent', () => {
  let component: DashboardChannelComponent;
  let fixture: ComponentFixture<DashboardChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardChannelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

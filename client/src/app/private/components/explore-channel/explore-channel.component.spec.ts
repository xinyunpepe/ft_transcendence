import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreChannelComponent } from './explore-channel.component';

describe('ExploreChannelComponent', () => {
  let component: ExploreChannelComponent;
  let fixture: ComponentFixture<ExploreChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreChannelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

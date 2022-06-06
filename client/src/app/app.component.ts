import { Component } from '@angular/core';
import { TestService } from 'src/services/test.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'client';

  testValue = this.service.getTest();

  constructor(private service: TestService) {}
}

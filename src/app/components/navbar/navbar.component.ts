import { Component } from '@angular/core';
import {SwitchThemeComponent} from '../switch-theme/switch-theme.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    SwitchThemeComponent,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}

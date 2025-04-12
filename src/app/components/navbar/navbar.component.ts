import { Component } from '@angular/core';
import {SwitchThemeComponent} from '../switch-theme/switch-theme.component';

@Component({
  selector: 'app-navbar',
  imports: [
    SwitchThemeComponent
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}

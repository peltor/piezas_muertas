import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {initFlowbite} from 'flowbite';
import {NavbarComponent} from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
     initFlowbite()
  }
  title = 'Piezas-muertas';
}

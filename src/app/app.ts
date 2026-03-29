import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Import your components (adjust paths if they are in different folders)
import { HeaderComponent } from './shared/components/header/header.component'; 
@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Add them to the imports array here
  imports: [RouterOutlet, HeaderComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'ShopEase';
}
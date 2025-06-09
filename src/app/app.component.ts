import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isDarkTheme = false;
  currentYear = new Date().getFullYear();
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // S'abonner aux changements de thème
    this.themeService.isDarkTheme$.subscribe((isDark: boolean) => {
      this.isDarkTheme = isDark;
    });
  }
  
  // Basculer entre le thème clair et sombre
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

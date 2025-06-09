import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreathAnimationComponent } from '../../components/breath-animation/breath-animation.component';
import { SessionControlsComponent } from '../../components/session-controls/session-controls.component';
import { SoundSelectorComponent } from '../../components/sound-selector/sound-selector.component';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, BreathAnimationComponent, SessionControlsComponent, SoundSelectorComponent],
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent {
  constructor(private router: Router) {}

  // Naviguer vers la page d'accueil
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}

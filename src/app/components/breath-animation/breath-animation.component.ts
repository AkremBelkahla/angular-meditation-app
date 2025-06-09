import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SessionService } from '../../services/session.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-breath-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breath-animation.component.html',
  styleUrls: ['./breath-animation.component.scss']
})
export class BreathAnimationComponent implements OnInit, OnDestroy {
  breathPhase: 'inhale' | 'exhale' = 'inhale';
  private breathSubscription: Subscription | null = null;

  constructor(
    private sessionService: SessionService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.breathSubscription = this.sessionService.breathPhase$.subscribe(phase => {
      this.breathPhase = phase;
    });
  }

  ngOnDestroy(): void {
    if (this.breathSubscription) {
      this.breathSubscription.unsubscribe();
    }
  }
}

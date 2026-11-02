import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-replay-files-link',
  templateUrl: './replay-files-link.component.html',
  styleUrls: ['./replay-files-link.component.css']
})
export class ReplayFilesLinkComponent {

  @Input() matchId: string;

  fileLink: string;


  ngOnInit() {
    this.fileLink = `/api/schedule/matchfiles?match=${this.matchId}`;
  }
}


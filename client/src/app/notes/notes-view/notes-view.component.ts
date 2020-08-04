import { Component, OnInit, Input } from '@angular/core';
import { NotesService } from 'src/app/services/notes.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { initial } from 'lodash';

@Component({
  selector: "app-notes-view",
  templateUrl: "./notes-view.component.html",
  styleUrls: ["./notes-view.component.css"],
})
export class NotesViewComponent implements OnInit {
  constructor(private notesServ: NotesService, public util:UtilitiesService) {}

  idValue
  @Input() set id(val){
    if(val){
      this.idValue = val;
      this.init();
    }
  };

  notes = [];

  collapsed = true;

  init(){
        this.notesServ.getNotes(this.idValue).subscribe(
      res=>{
        this.notes = res;
      },
      err=>{
        console.log(err);
      }
    );
  }
  ngOnInit(): void {

  }
}

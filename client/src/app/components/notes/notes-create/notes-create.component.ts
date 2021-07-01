import { Component, OnInit, Input } from '@angular/core';
import { NotesService } from 'src/app/services/notes.service';

@Component({
  selector: 'app-notes-create',
  templateUrl: './notes-create.component.html',
  styleUrls: ['./notes-create.component.css']
})
export class NotesCreateComponent implements OnInit {

  constructor(private notesService:NotesService) { }

  @Input() id;

  note:string='';

  ngOnInit(): void {
  }

  submitNote(){
    this.notesService.createNote(this.id, this.note, Date.now()).subscribe(
      res=>{

      },
      err=>{
        console.warn(err);
      }
    )

  }

}

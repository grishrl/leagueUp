import { Injectable } from '@angular/core';
import { HttpService } from "./http.service";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: "root",
})
export class NotesService {
  constructor(private http: HttpService, private auth:AuthService) {}

  // getTeamNotes(id) {
  //   let url = "admin/notes/fetch/team";
  //   return this.http.httpGet(url, [{ subjectId: id }]);
  // }

  getNotes(id) {
    let url = "admin/notes/fetch/user";
    return this.http.httpGet(url, [{ subjectId: id }]);
  }

  createNote(subjectId, note, timeStamp) {
    let url = "admin/notes/create/user";
    return this.http.httpPost(url, { subjectId, authorId:this.auth.getUserId(), note, timeStamp });
  }

  // createNoteTeam(subjectId, authorId, note, timeStamp) {
  //   let url = "admin/notes/create/team";
  //   return this.http.httpPost(url, { subjectId, authorId, note, timeStamp });
  // }

  deleteNote(noteId) {
    let url = "admin/notes/delete";
    return this.http.httpPost(url, { noteId });
  }
}

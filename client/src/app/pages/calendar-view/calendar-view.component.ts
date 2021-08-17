import { Component,ChangeDetectionStrategy,ViewChild,TemplateRef, OnInit} from '@angular/core';
import { startOfDay, endOfDay, subDays,addDays,endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, collapseAnimation } from 'angular-calendar';
import { ScheduleService } from '../../services/schedule.service';
import { EventModalComponent } from './event-modal/event-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { UtilitiesService } from '../../services/utilities.service';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { find } from 'lodash';
import { CalendarCacheService } from './calendar-cache.service';
import { DivisionService } from '../../services/division.service';



@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css'],
  animations: [collapseAnimation]
})

export class CalendarViewComponent implements OnInit {


colors: {
[key:string]:Event
} = {};

  sortOrder = (a,b)=>{
    return a.value.sortOrder > b.value.sortOrder ? 1 : 0;
  }

  seasonVal;
  list = new Map<String, [object]>();

  tournamentRefs;

  constructor(private cache:CalendarCacheService, private matches: ScheduleService, public dialog: MatDialog, private router:Router, private eventService:EventsService, public util: UtilitiesService,
    public teamServ:TeamService, public auth:AuthService, private scheduleService:ScheduleService, private Division:DivisionService) { }

  showCasterNameUrl(match) {
    let ret = false;
    if (this.util.returnBoolByPath(match, 'casterName')) {
      if (match.casterName.length > 0) {
        ret = true;
      } else {
        ret = false;
      }
    } else {
      ret = false;
    }
    return ret;
  }

  shouldShowTimeInEventTitle() : boolean
  {
    return this.view == CalendarView.Month;
  }

  asIsOrder(a,b){
    return 0;
  }

  isLoaded = false;

  calendarInfo = 'calendarInfo';
  listInfo = 'listInfo';

  _matches = [];
  ngOnInit(){
    let cache = this.cache.getCache(this.calendarInfo);
    let listCache = this.cache.getCache(this.listInfo);
    this.Division.getDivisionInfo().subscribe(
      res=>{
        res.forEach( (v)=>{
          this.colors[v.divisionConcat] = {
            primary:`#${v.divColor}`,
            secondary:'',
            name:v.displayName,
            sortOrder:v.sortOrder
          }
        });
        this.colors['event']={
          primary: "#FF851B",
          name: "NGS Event",
          secondary:'',
          sortOrder: Object.keys(this.colors).length
        };
        this.colors['tournament']={
          primary: "#E5D800",
          name: "Tournament",
          secondary:'',
          sortOrder: Object.keys(this.colors).length
        };
      },
      err=>{
        console.warn(err);
      }
    )
    if(cache=='getNewData' || cache == null){
      this.initEvents();
    }else{
      this.isLoaded = true;
      this.events = cache;
      this.list = listCache;
      this.refresh.next();
    }

  }

  private initEvents() {
    this.list = new Map<String, [object]>();
    this.isLoaded = false;
    this.matches.getAllMatchesWithStartTime().subscribe(
      res => {
        let matches = res;
        this._matches = res;

        matches = this.util.sortMatchesByTime(matches);

        let now = Date.now();

        let weekAway = now * 2* 7 * 24 * 60 * 60 * 1000;

        let tournamentRefs = [];

        matches.forEach(match => {
          if (!match.divisionConcat && match.challonge_tournament_ref) {
            if (tournamentRefs.indexOf(match.challonge_tournament_ref) == -1) {
              tournamentRefs.push(match.challonge_tournament_ref);
            }
          }
        });

        this.matches.getTournamentsByIds(tournamentRefs).subscribe(
          res => {
            this.tournamentRefs = res;
            matches.forEach((match) => {
              let startDate: Date = new Date(
                parseInt(match.scheduledTime.startTime)
              );
              let endDate: Date = new Date(
                parseInt(match.scheduledTime.startTime) + 1
              );

              let event: CalendarEvent = {
                start: startDate,
                end: endDate,
                title: this.returnName(match),
                meta: { id: match.matchId, type: "match", obj:match },
              };

              if (this.showCasterNameUrl(match)) {
                event["meta"].casted = true;
              }

              if (this.shouldShowTimeInEventTitle()) {
                event["title"] =
                  this.util.getFormattedDate(startDate, "hh:mm A zz") +
                  ": " +
                  event["title"];
              }

              event["color"] = this.returnColor(match);

              this.events.push(event);

              if (
                now <= match.scheduledTime.startTime &&
                match.scheduledTime.startTime < weekAway
              ) {
                let formatDate = this.util.getFormattedDate(
                  match.scheduledTime.startTime,
                  "dddd MMM D"
                );

                if (this.list.has(formatDate)) {
                  let tempArr = this.list.get(formatDate);
                  tempArr.push(match);
                  this.list.set(formatDate, tempArr);
                  // this.list[formatDate].push(match);
                } else {
                  this.list.set(formatDate, [match]);
                }
              }
            });
             this.eventService.getAll().subscribe(
               (reply) => {
                 reply.forEach((rep) => {
                   let event: CalendarEvent = {
                     start: new Date(parseInt(rep.eventDate)),
                     title: rep.eventName,
                     meta: { id: rep.uuid, type: "event", obj:rep },
                   };

                   event["color"] = this.colors.event;
                   this.events.push(event);
                 });

                 this.events = this.events.sort((a, b) => {
                   let retVal = 0;
                   if (a.start > b.start) {
                     retVal = 1;
                   } else {
                     retVal = -1;
                   }
                   return retVal;
                 });
                 this.cache.setCache(this.calendarInfo, this.events);
                 this.cache.setCache(this.listInfo, this.list);
                 this.isLoaded = true;
                 this.refresh.next();
               },
               (err) => {
                 console.warn(err);
               }
             );
          }
        );




      },
      err => {
        console.warn(err);
      }
    );
  }

  private returnColor(match){
    let ret = { primary: "#FFFFFF", secondary: "#FFFFFF" };

    if (match.divisionConcat) {
          ret = this.colors[match.divisionConcat] ? this.colors[match.divisionConcat] : { primary: "#FFFFFF", secondary: "#FFFFFF"  };
    }else if (match.type == "tournament" || match.type == "grandfinal") {
      ret = this.colors["tournament"];
    }

    return ret;
  }

  private returnName(match):string{
    let retStr = '';

    if(match.divisionConcat){
      retStr += this.colors[match.divisionConcat] ? this.colors[match.divisionConcat].name : "matchErr";
      retStr += ": ";
      retStr += this.util.returnBoolByPath(match, "home.teamName") ? match.home.teamName : "TBD";
      retStr +=" vs " ;
      retStr += this.util.returnBoolByPath(match, "away.teamName") ? match.away.teamName : "TBD";
    }else{
      retStr = '';
      let t = find(this.tournamentRefs.tournInfo, (itr)=>{
        if(itr.challonge_ref==match.challonge_tournament_ref){
          return true;
        }
      });

      if (match.type == "grandfinal" && match.title) {
        retStr += `${match.title}: `;
      }else{
        retStr += this.util.returnBoolByPath(t, "name")
          ? `${this.util.returnByPath(t, "name")}: `
          : "Tournament: ";
      }


      retStr += (this.util.returnBoolByPath(match, "home.teamName")
        ? match.home.teamName
        : "TBD") +
      " vs " +
      (this.util.returnBoolByPath(match, "away.teamName")
        ? match.away.teamName
        : "TBD");

        if(match.type == 'grandfinal' && match.title){

        }

  }
  return retStr;
}

  @ViewChild('modalContent', { static: false })
  modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }

  openDialog(match): void {

    const dialogRef = this.dialog.open(EventModalComponent, {
      width:'700px',
      data: match
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {

    this.eventService.setLocalEvent(event.meta);
    let url = '';
    if(event.meta.type == 'match'){
      this.router.navigate(["event/match/",event.meta.id]);
      url = this.router.serializeUrl(this.router.createUrlTree(["event/match/", event.meta.id]));
    }else{
      this.router.navigate(["event/event/", event.meta.id]);
      url = this.router.serializeUrl(
        this.router.createUrlTree(["event/event/", event.meta.id])
      );
    }

  }


}

export interface Event{
  primary:string,
  secondary:string,
  name:string,
  sortOrder:number
}

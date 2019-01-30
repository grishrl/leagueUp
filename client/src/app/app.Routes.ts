import { HomeComponent } from "./home/home.component";
import { DirectoryComponent } from "./directory/directory.component";
import { RouterModule, Routes } from '@angular/router';
import { NgModule, Component } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ProfileEditComponent } from "./profile-edit/profile-edit.component";
import { TeamProfileComponent } from "./team-profile/team-profile.component";
import { DivisionComponent } from "./division/division.component";
import { OutreachEmailResponseComponent } from "./outreach-email-response/outreach-email-response.component";
import { BlogListComponent } from "./blog-list/blog-list.component";
import { BlogViewComponent } from "./blog-view/blog-view.component";
import { LogoutComponent } from "./logout/logout.component";
import { CreateTeamComponent } from "./create-team/create-team.component";
import { ApproveMemberComponent } from "./admin/approve-member/approve-member.component";
import { DeleteMemberComponent } from "./admin/delete-member/delete-member.component";
import { ManageSelectTeamComponent } from "./admin/manage-team/manage-select-team.component";
import { DivisionManagementComponent } from "./admin/division-management/division-management.component";
import { ScheduleViewComponent } from "./schedule/schedule-view/schedule-view.component";
import { MatchScheduleComponent } from "./schedule/match-schedule/match-schedule.component";
import { TeamScheduleComponent } from "./schedule/team-schedule/team-schedule.component";
import { ReportingComponent } from "./reporting/reporting.component";
import { DashboardComponent } from "./admin/dashboard/dashboard.component";
import { CasterDashboardComponent } from "./caster-tools/caster-dashboard/caster-dashboard.component";
import { MatchManagementComponent } from "./admin/match-management/match-management.component";
import { MatchEditComponent } from "./admin/match-management/match-edit/match-edit.component";
import { AdminAclManagementComponent } from './admin/admin-acl-management/admin-acl-management.component';
import { UpdateRolesComponent } from "./admin/admin-acl-management/update-roles/update-roles.component";
import { ManageTeamViewComponent } from './admin/manage-team/manage-team-view/manage-team-view.component';
import { AuthGuardService } from "./services/auth-guard.service";
import { NoAccessComponent } from "./no-access/no-access.component";
import { SessionTimeoutComponent } from "./session-timeout/session-timeout.component";
import { CalendarViewComponent } from "./calendar-view/calendar-view.component";
import { EventLargeComponent } from "./calendar-view/event-large/event-large.component";
import { SetDeadlineComponent } from "./admin/match-management/set-deadline/set-deadline.component";
import { UserMessageCenterComponent } from "./messageCenter/user-message-center/user-message-center.component";
import { RulesComponent } from "./rules/rules.component";
import { TeamMarketComponent } from "./marketplace/team-market/team-market.component";
import { UserMarketplaceComponent } from "./marketplace/user-marketplace/user-marketplace.component";
import { GenerateSeasonComponent } from "./admin/match-management/generate-season/generate-season.component";
import { TournamentGeneratorComponent } from "./admin/match-management/tournament-generator/tournament-generator.component";

const APP_ROUTES: Routes = [
  { path: 'directory', component: DirectoryComponent},
  { path:'', component: HomeComponent},
  { path: 'login', component: LoginComponent },
  { path: 'rules', component: RulesComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'login/:token', component: LoginComponent},
  { path: 'profile/:id', component: ProfileEditComponent},
  { path: 'teamProfile/:id', component: TeamProfileComponent},
  { path: 'teamCreate', component: CreateTeamComponent},
  { path: 'division/:division', component: DivisionComponent, runGuardsAndResolvers:'paramsChange' },
  { path: 'email/invite/:id', component:OutreachEmailResponseComponent },
  { path: 'blog', component:BlogListComponent },
  { path: 'blog/:id', component:BlogViewComponent },
  { path: '_admin/approveTeamQueue', component:ApproveMemberComponent, canActivate:[AuthGuardService], data:{role:'team'} },
  { path: '_admin/deleteUser', component: DeleteMemberComponent, canActivate: [AuthGuardService], data: { role: 'user' } },
  { path: '_admin/manageTeam', component: ManageSelectTeamComponent, canActivate: [AuthGuardService], data: { role: 'team' } },
  { path: '_admin/manageTeam/:id', component: ManageTeamViewComponent, canActivate: [AuthGuardService], data: { role: 'team' } },
  { path: '_admin/divisionMgmt', component: DivisionManagementComponent, canActivate: [AuthGuardService], data: { role: 'division' } },
  { path: '_admin/matchMgmt', component: MatchManagementComponent, canActivate: [AuthGuardService], data: { role: 'match' } },
  { path: '_admin/matchMgmt/match/:id', component: MatchEditComponent, canActivate: [AuthGuardService], data: { role: 'match' } },
  { path: '_admin/userACLMgmt', component: AdminAclManagementComponent, canActivate: [AuthGuardService], data: { role: 'acl' } },
  { path: '_admin/userACLMgmt/:id', component: UpdateRolesComponent, canActivate: [AuthGuardService], data: { role: 'acl' } },
  { path: '_admin/scheduleGenerator', component: GenerateSeasonComponent, canActivate: [AuthGuardService], data: { role: 'schedulegen' } },
  { path: '_admin/tournamentGenerator', component: TournamentGeneratorComponent, canActivate: [AuthGuardService], data: { role: 'schedulegen' } },
  { path: 'schedule/scheduleMatch/:id', component:MatchScheduleComponent},
  { path: 'schedule/teamSchedule', component: TeamScheduleComponent },
  { path: 'schedule/teamSchedule/:id', component:TeamScheduleComponent}, //accepts team name as url parameter
  { path: 'reporting/:id', component:ReportingComponent}, //accepts team name as url parameter
  { path: '_admin/dashboard', component: DashboardComponent, canActivate: [AuthGuardService]},
  { path: '_casterDashboard', component: CasterDashboardComponent, canActivate: [AuthGuardService], data: { role: 'caster' }},
  { path: 'noAccess/:id', component:NoAccessComponent},
  { path: 'sessionTimeOut', component: SessionTimeoutComponent},
  { path: 'calendar' , component:CalendarViewComponent },
  { path: 'event/:id' , component:EventLargeComponent},
  { path: '_admin/matchMgmt/weekDeadline', component: SetDeadlineComponent, canActivate: [AuthGuardService], data: { role: 'match' }},
  { path: 'messageCenter', component:UserMessageCenterComponent},
  { path: 'findTeams', component:TeamMarketComponent},
  { path: 'findPlayers', component:UserMarketplaceComponent}
]

@NgModule({
  imports: [ RouterModule.forRoot(APP_ROUTES, {onSameUrlNavigation:'reload', scrollPositionRestoration:'enabled'})],
  exports : [ RouterModule ]
})

export class AppRoutingModule{}
/*
, children: [
      { path: 'approveTeamQueue', component: ApproveMemberComponent },
      { path: 'deleteUser', component: DeleteMemberComponent },
      { path: 'manageTeam', component: DeleteTeamComponent },
      { path: 'divisionMgmt', component: DivisionManagementComponent }
    ]
*/

import { HomeComponent } from "./home/home.component";
import { DirectoryComponent } from "./directory/directory.component";
import { RouterModule, Routes } from '@angular/router';
import { NgModule, Component } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ProfileEditComponent } from "./player/profile-edit/profile-edit.component";
import { TeamProfileComponent } from "./team/team-profile/team-profile.component";
import { DivisionComponent } from "./division/division.component";
import { OutreachEmailResponseComponent } from "./outreach-email-response/outreach-email-response.component";
import { BlogListComponent } from "./blog/blog-list/blog-list.component";
import { BlogViewComponent } from "./blog/blog-view/blog-view.component";
import { LogoutComponent } from "./logout/logout.component";
import { CreateTeamComponent } from "./create-team/create-team.component";
import { ApproveMemberComponent } from "./admin/approve-member/approve-member.component";
import { ManageMemberComponent } from "./admin/manage-member/manage-member.component";
import { ManageSelectTeamComponent } from "./admin/manage-team/manage-select-team.component";
import { DivisionManagementComponent } from "./admin/division-management/division-management.component";
import { MatchSchedulerComponent } from "./schedule/match-scheduler/match-scheduler.component";
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
import { TeamMarketComponent } from "./marketplace/team-market/team-market.component";
import { UserMarketplaceComponent } from "./marketplace/user-marketplace/user-marketplace.component";
import { GenerateSeasonComponent } from "./admin/match-management/generate-season/generate-season.component";
import { TournamentGeneratorComponent } from "./admin/match-management/tournament-generator/tournament-generator.component";
import { ReplayBrowserComponent } from "./replay-browser/replay-browser.component";
import { TeamScheduleComboComponent } from "./schedule/team-schedule-combo/team-schedule-combo.component";
import { EventCreateComponent } from './admin/events/event-create/event-create.component';
import { EventListComponent } from './admin/events/event-list/event-list.component';
import { StaticHtmlLoaderComponent } from './static-html-loader/static-html-loader.component';
import { ApprovePendingAvatarComponent } from "./admin/approve-pending-avatar/approve-pending-avatar.component";
import { AllTeamsComponent } from "./team/all-teams/all-teams.component";
import { MatchResultsViewComponent } from './match/match-results-view/match-results-view.component';
import { ChallongeTournComponent } from "./challonge-tourn/challonge-tourn.component";
import { SeasonInfoManagerComponent } from "./admin/season-info-manager/season-info-manager.component";
import { PastSeasonsComponent } from "./past-seasons/past-seasons.component";
import { AuthorPageComponent } from "./blog/author-page/author-page.component";
import { CasterPageComponent } from "./caster-tools/caster-page/caster-page.component";
import { LogsViewerComponent } from './admin/logs-viewer/logs-viewer.component';
import { MatchupHistoryComponent } from './match/matchup-history/matchup-history.component';
import { PotgPageComponent } from "./potg-page/potg-page.component";
import { MvpPageComponent } from "./mvp-page/mvp-page.component";
import { StreamManagerComponent } from './admin/stream-manager/stream-manager.component';
import { ArchiveSeasonComponent } from './admin/archive-season/archive-season.component';
import { ActiveTournamentViewerComponent } from "./active-tournament-viewer/active-tournament-viewer.component";
import { GrandFinalGeneratorComponent } from './admin/grand-final-generator/grand-final-generator.component';

const APP_ROUTES: Routes = [
  { path: "challonge", component: ChallongeTournComponent },
  { path: "directory", component: DirectoryComponent },
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  {
    path: "rules",
    component: BlogViewComponent,
    data: { slug: "rules", headerText: "Community Rules" },
  },
  {
    path: "volunteers",
    component: BlogViewComponent,
    data: { slug: "volunteers", headerText: "Community Volunteers" },
  },
  { path: "logout", component: LogoutComponent },
  {
    path: "faq",
    component: BlogViewComponent,
    data: {
      slug: "frequently-asked-questions",
      headerText: "Frequently Asked Questions",
    },
  },
  { path: "login/:token", component: LoginComponent },
  { path: "profile/:id", component: ProfileEditComponent },
  { path: "teamProfile/:id", component: TeamProfileComponent },
  { path: "teamProfile/:id/:season", component: TeamProfileComponent },
  { path: "allTeams", component: AllTeamsComponent },
  { path: "pastSeasons", component: PastSeasonsComponent },
  { path: "teamCreate", component: CreateTeamComponent },
  {
    path: "division/:division",
    component: DivisionComponent,
    runGuardsAndResolvers: "paramsChange",
  },
  { path: "email/invite/:id", component: OutreachEmailResponseComponent },
  { path: "blog", component: BlogListComponent },
  { path: "blog/:id", component: BlogViewComponent },
  { path: "blog/author/:id", component: AuthorPageComponent },
  { path: "match/view/:id", component: MatchResultsViewComponent },
  { path: "_admin/seasonInfo", component: SeasonInfoManagerComponent },
  {
    path: "_admin/logs",
    component: LogsViewerComponent,
    canActivate: [AuthGuardService],
    data: { role: "logs" },
  },
  {
    path: "_admin/approveTeamQueue",
    component: ApproveMemberComponent,
    canActivate: [AuthGuardService],
    data: { role: "team" },
  },
  {
    path: "_admin/approveAvatarQueue",
    component: ApprovePendingAvatarComponent,
    canActivate: [AuthGuardService],
    data: { role: "user" },
  },
  {
    path: "_admin/manageUser",
    component: ManageMemberComponent,
    canActivate: [AuthGuardService],
    data: { role: "user" },
  },
  {
    path: "_admin/manageTeam",
    component: ManageSelectTeamComponent,
    canActivate: [AuthGuardService],
    data: { role: "team" },
  },
  {
    path: "_admin/manageTeam/:id",
    component: ManageTeamViewComponent,
    canActivate: [AuthGuardService],
    data: { role: "team" },
  },
  {
    path: "_admin/divisionMgmt",
    component: DivisionManagementComponent,
    canActivate: [AuthGuardService],
    data: { role: "division" },
  },
  {
    path: "_admin/matchMgmt",
    component: MatchManagementComponent,
    canActivate: [AuthGuardService],
    data: { role: "match" },
  },
  {
    path: "_admin/streamMgmt",
    component: StreamManagerComponent,
    canActivate: [AuthGuardService],
    data: { role: "match" },
  },
  {
    path: "_admin/matchMgmt/match/:id",
    component: MatchEditComponent,
    canActivate: [AuthGuardService],
    data: { role: "match" },
  },
  {
    path: "_admin/userACLMgmt",
    component: AdminAclManagementComponent,
    canActivate: [AuthGuardService],
    data: { role: "acl" },
  },
  {
    path: "_admin/userACLMgmt/:id",
    component: UpdateRolesComponent,
    canActivate: [AuthGuardService],
    data: { role: "acl" },
  },
  {
    path: "_admin/scheduleGenerator",
    component: GenerateSeasonComponent,
    canActivate: [AuthGuardService],
    data: { role: "schedulegen" },
  },
  {
    path: "_admin/tournamentGenerator",
    component: TournamentGeneratorComponent,
    canActivate: [AuthGuardService],
    data: { role: "schedulegen" },
  },
  {
    path: "_admin/eventList",
    component: EventListComponent,
    canActivate: [AuthGuardService],
    data: { role: "event" },
  },
  {
    path: "_admin/eventMgmt/:id",
    component: EventCreateComponent,
    canActivate: [AuthGuardService],
    data: { role: "event" },
  },
  {
    path: "_admin/grandFinalCreator",
    component: GrandFinalGeneratorComponent,
    canActivate: [AuthGuardService],
    data: { role: "event" },
  },
  { path: "schedule/scheduleMatch/:id", component: MatchSchedulerComponent },
  { path: "schedule/teamSchedule", component: TeamScheduleComboComponent },
  { path: "reporting/:id", component: ReportingComponent }, //accepts team name as url parameter
  {
    path: "_admin/dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: "_admin/archiveSeason",
    component: ArchiveSeasonComponent,
    canActivate: [AuthGuardService],
    data: { role: "schedulegen" },
  },
  {
    path: "_casterDashboard",
    component: CasterDashboardComponent,
    canActivate: [AuthGuardService],
    data: { role: "caster" },
  },
  {
    path: "_casterPage",
    component: CasterPageComponent,
    canActivate: [AuthGuardService],
    data: { role: "caster" },
  },
  { path: "noAccess/:id", component: NoAccessComponent },
  { path: "sessionTimeOut", component: SessionTimeoutComponent },
  { path: "calendar", component: CalendarViewComponent },
  { path: "event/:type/:id", component: EventLargeComponent },
  { path: "event", component: EventLargeComponent },
  {
    path: "_admin/matchMgmt/weekDeadline",
    component: SetDeadlineComponent,
    canActivate: [AuthGuardService],
    data: { role: "match" },
  },
  { path: "messageCenter", component: UserMessageCenterComponent },
  { path: "findTeams", component: TeamMarketComponent },
  { path: "matchupHistory", component: MatchupHistoryComponent },
  { path: "findPlayers", component: UserMarketplaceComponent },
  { path: "replayBrowser", component: ReplayBrowserComponent },
  { path: "tournament", component: ActiveTournamentViewerComponent },
  { path: "page/:id", component: StaticHtmlLoaderComponent },
  { path: "potg", component: PotgPageComponent },
  { path: "mvp", component: MvpPageComponent },
  {
    path: "**",
    component: StaticHtmlLoaderComponent,
    data: { template: "404", headerText: "Not Found" },
  },
];

@NgModule({
  imports: [ RouterModule.forRoot(APP_ROUTES, {onSameUrlNavigation:'reload', scrollPositionRestoration:'enabled', anchorScrolling:'enabled'})],
  exports : [ RouterModule ]
})

export class AppRoutingModule{}

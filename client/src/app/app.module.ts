import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DirectoryComponent } from './directory/directory.component';
import { AppRoutingModule } from './app.Routes';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './login/login.component';
import { ResponseInterceptor } from './services/token-interceptor.service';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { InputFormMaterial } from './classes/aM-input-Import.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamProfileComponent } from './team-profile/team-profile.component';
import { DivisionComponent } from './division/division.component';
import { TeamDisplayComponent } from './team-display/team-display.component';
import { MembersDisplayComponent } from './members-display/members-display.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { OutreachEmailResponseComponent } from './outreach-email-response/outreach-email-response.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogViewComponent } from './blog-view/blog-view.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { NgxCroppieModule } from 'ngx-croppie';
import { LogoutComponent } from './logout/logout.component';
import { CreateTeamComponent } from './create-team/create-team.component';
import { ApproveMemberComponent } from './admin/approve-member/approve-member.component';
import { UserQuickViewComponent } from './admin/approve-member/user-quick-view/user-quick-view.component';
import { TeamQuickViewComponent } from './admin/approve-member/team-quick-view/team-quick-view.component';
import { ApproveMemberViewComponent } from './admin/approve-member/approve-member-view/approve-member-view.component';
import { DeleteMemberComponent } from './admin/delete-member/delete-member.component';
import { ManageSelectTeamComponent } from './admin/manage-team/manage-select-team.component';
import { TeamSearchComponent } from './team-search/team-search.component';
import { ChangeCaptainModalComponent } from './modal/change-captain-modal/change-captain-modal.component';
import { DivisionManagementComponent } from './admin/division-management/division-management.component';
import { AddTeamComponent } from './admin/division-management/add-team/add-team.component';
import { DivisionPropsComponent } from './admin/division-management/division-props/division-props.component';
import { RemoveTeamComponent } from './admin/division-management/remove-team/remove-team.component';
import { ScheduleViewComponent } from './schedule/schedule-view/schedule-view.component';
import { MatchSchedulerComponent } from './schedule/match-scheduler/match-scheduler.component';
import { TeamScheduleComponent } from './schedule/team-schedule/team-schedule.component';
import { ReportingComponent } from './reporting/reporting.component';
import { ReportingDeckComponent } from './reporting/reporting-deck/reporting-deck.component';
import { ngfModule } from 'angular-file';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CasterDashboardComponent } from './caster-tools/caster-dashboard/caster-dashboard.component';
import { CasterInputsComponent } from './caster-tools/caster-dashboard/caster-inputs/caster-inputs.component';
import { MatchEditComponent } from './admin/match-management/match-edit/match-edit.component';
import { MatchManagementComponent } from './admin/match-management/match-management.component';
import { AdminAclManagementComponent } from './admin/admin-acl-management/admin-acl-management.component';
import { UpdateRolesComponent } from './admin/admin-acl-management/update-roles/update-roles.component';
import { StandingsViewComponent } from './standings-view/standings-view.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { ManageTeamViewComponent } from './admin/manage-team/manage-team-view/manage-team-view.component';
import { DeleteConfrimModalComponent } from './modal/delete-confrim-modal/delete-confrim-modal.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { TimesAvailableComponent } from './times-available/times-available.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { LogsViewerComponent } from './admin/logs-viewer/logs-viewer.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventModalComponent } from './calendar-view/event-modal/event-modal.component';
import { EventLargeComponent } from './calendar-view/event-large/event-large.component';
import { SetDeadlineComponent } from './admin/match-management/set-deadline/set-deadline.component';
import { MatchViewComponent } from './match-view/match-view.component';
import { DropDownTimeComponent } from './times-available/drop-down-time/drop-down-time.component';
import { UserMessageCenterComponent } from './messageCenter/user-message-center/user-message-center.component';
import { RulesComponent } from './rules/rules.component';
import { TeamMarketComponent } from './marketplace/team-market/team-market.component';
import { UserMarketplaceComponent } from './marketplace/user-marketplace/user-marketplace.component';
import { UserDeckComponent } from './marketplace/user-marketplace/user-deck/user-deck.component';
 import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ConfirmRemoveMemberComponent } from './modal/confirm-remove-member/confirm-remove-member.component';
import { TournamentGeneratorComponent } from './admin/match-management/tournament-generator/tournament-generator.component';
import { GenerateSeasonComponent } from './admin/match-management/generate-season/generate-season.component';
import { environment } from '../environments/environment'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TournamentViewComponent } from './tournament-view/tournament-view.component';
import { ReplayBrowserComponent } from './replay-browser/replay-browser.component';
import { DivisionSelectorComponent } from './division-selector/division-selector.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { TeamScheduleComboComponent } from './schedule/team-schedule-combo/team-schedule-combo.component';
import { TeamTournamentsComponent } from './schedule/team-tournaments/team-tournaments.component';
import { MatchScheduleComponent } from './match-schedule/match-schedule.component';
import { TournamentReportingComponent } from './reporting/tournament-reporting/tournament-reporting.component';
import { EventDisplayComponent } from './events/event-display/event-display.component';
import { EventCreateComponent } from './admin/events/event-create/event-create.component';
import { EventListComponent } from './admin/events/event-list/event-list.component';
import { GeneralImageUploadComponent } from './general-image-upload/general-image-upload.component';
import { MiniCarouselComponent } from './mini-carousel/mini-carousel.component';
import { LargeCarouselComponent } from './large-carousel/large-carousel.component';
import { NewsNoSidebarComponent } from './news-no-sidebar/news-no-sidebar.component';
import { DivisionStandingsComponent } from './division-standings/division-standings.component';
import { RecentResultsComponent } from './recent-results/recent-results.component';
import { TopStatsWidgetComponent } from './top-stats-widget/top-stats-widget.component';


const config: SocketIoConfig = { url: environment.socketURL, options:{} }

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DirectoryComponent,
    NavComponent,
    LoginComponent,
    ProfileEditComponent,
    TeamProfileComponent,
    DivisionComponent,
    TeamDisplayComponent,
    MembersDisplayComponent,
    UserSearchComponent,
    OutreachEmailResponseComponent,
    BlogListComponent,
    BlogViewComponent,
    AppFooterComponent,
    ImageUploadComponent,
    LogoutComponent,
    CreateTeamComponent,
    ApproveMemberComponent,
    UserQuickViewComponent,
    TeamQuickViewComponent,
    ApproveMemberViewComponent,
    DeleteMemberComponent,
    ManageSelectTeamComponent,
    TeamSearchComponent,
    ChangeCaptainModalComponent,
    DivisionManagementComponent,
    AddTeamComponent,
    DivisionPropsComponent,
    RemoveTeamComponent,
    ScheduleViewComponent,
    MatchSchedulerComponent,
    TeamScheduleComponent,
    ReportingComponent,
    ReportingDeckComponent,
    DashboardComponent,
    CasterDashboardComponent,
    CasterInputsComponent,
    MatchManagementComponent,
    MatchEditComponent,
    AdminAclManagementComponent,
    UpdateRolesComponent,
    StandingsViewComponent,
    SnackbarComponent,
    ManageTeamViewComponent,
    DeleteConfrimModalComponent,
    NoAccessComponent,
    SessionTimeoutComponent,
    TimesAvailableComponent,
    QuestionnaireComponent,
    LogsViewerComponent,
    CalendarViewComponent,
    EventModalComponent,
    EventLargeComponent,
    SetDeadlineComponent,
    MatchViewComponent,
    DropDownTimeComponent,
    UserMessageCenterComponent,
    RulesComponent,
    TeamMarketComponent,
    UserMarketplaceComponent,
    UserDeckComponent,
    ConfirmRemoveMemberComponent,
    GenerateSeasonComponent,
    TournamentGeneratorComponent,
    TournamentViewComponent,
    ReplayBrowserComponent,
    DivisionSelectorComponent,
    TeamScheduleComboComponent,
    TeamTournamentsComponent,
    MatchScheduleComponent,
    TournamentReportingComponent,
    EventDisplayComponent,
    EventCreateComponent,
    EventListComponent,
    GeneralImageUploadComponent,
    MiniCarouselComponent,
    LargeCarouselComponent,
    NewsNoSidebarComponent,
    DivisionStandingsComponent,
    RecentResultsComponent,
    TopStatsWidgetComponent
  ],
  entryComponents:[
    DeleteConfrimModalComponent,
    ChangeCaptainModalComponent,
    ConfirmRemoveMemberComponent,
    EventModalComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    InputFormMaterial,
    FormsModule,
    ReactiveFormsModule,
    NgxCroppieModule,
    ngfModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    SocketIoModule.forRoot(config),
    DragDropModule,
    DragScrollModule
  ],
  providers: [
    {
    provide:HTTP_INTERCEPTORS,
    useClass:ResponseInterceptor,
    multi:true
    }
  ],
  bootstrap: [AppComponent]
})


export class AppModule { }

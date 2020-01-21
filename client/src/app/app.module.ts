import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DirectoryComponent } from './directory/directory.component';
import { AppRoutingModule } from './app.Routes';
import { NavComponent } from './nav/nav.component';
import { LoginComponent } from './login/login.component';
import { ResponseInterceptor } from './services/token-interceptor.service';
import { ProfileEditComponent } from './player/profile-edit/profile-edit.component';
import { InputFormMaterial } from './classes/aM-input-Import.class';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamProfileComponent } from './team/team-profile/team-profile.component';
import { DivisionComponent } from './division/division.component';
import { TeamDisplayComponent } from './team/team-display/team-display.component';
import { MembersDisplayComponent } from './members-display/members-display.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { OutreachEmailResponseComponent } from './outreach-email-response/outreach-email-response.component';
import { BlogListComponent } from './blog/blog-list/blog-list.component';
import { BlogViewComponent } from './blog/blog-view/blog-view.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { NgxCroppieModule } from 'ngx-croppie';
import { LogoutComponent } from './logout/logout.component';
import { CreateTeamComponent } from './create-team/create-team.component';
import { ApproveMemberComponent } from './admin/approve-member/approve-member.component';
import { UserQuickViewComponent } from './admin/approve-member/user-quick-view/user-quick-view.component';
import { TeamQuickViewComponent } from './admin/approve-member/team-quick-view/team-quick-view.component';
import { ApproveMemberViewComponent } from './admin/approve-member/approve-member-view/approve-member-view.component';
import { ManageMemberComponent } from './admin/manage-member/manage-member.component';
import { ManageSelectTeamComponent } from './admin/manage-team/manage-select-team.component';
import { TeamSearchComponent } from './team/team-search/team-search.component';
import { ChangeCaptainModalComponent } from './modal/change-captain-modal/change-captain-modal.component';
import { DivisionManagementComponent } from './admin/division-management/division-management.component';
import { AddTeamComponent } from './admin/division-management/add-team/add-team.component';
import { DivisionPropsComponent } from './admin/division-management/division-props/division-props.component';
import { RemoveTeamComponent } from './admin/division-management/remove-team/remove-team.component';
import { ScheduleViewComponent } from './schedule/schedule-view/schedule-view.component';
import { MatchSchedulerComponent } from './schedule/match-scheduler/match-scheduler.component';

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
import { TimesAvailableComponent } from './formComponents/times-available/times-available.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { LogsViewerComponent } from './admin/logs-viewer/logs-viewer.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventModalComponent } from './calendar-view/event-modal/event-modal.component';
import { EventLargeComponent } from './calendar-view/event-large/event-large.component';
import { SetDeadlineComponent } from './admin/match-management/set-deadline/set-deadline.component';
import { MatchViewComponent } from './match/match-view/match-view.component';
import { DropDownTimeComponent } from './formComponents/times-available/drop-down-time/drop-down-time.component';
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
import { MatchScheduleComponent } from './match/match-schedule/match-schedule.component';
import { TournamentReportingComponent } from './reporting/tournament-reporting/tournament-reporting.component';
import { EventDisplayComponent } from './events/event-display/event-display.component';
import { EventCreateComponent } from './admin/events/event-create/event-create.component';
import { EventListComponent } from './admin/events/event-list/event-list.component';
import { GeneralImageUploadComponent } from './general-image-upload/general-image-upload.component';
import { MiniCarouselComponent } from './mini-carousel/mini-carousel.component';
import { MatchViewVerticleComponent } from './match/match-view-verticle/match-view-verticle.component';
import { LargeCarouselComponent } from './large-carousel/large-carousel.component';
import { MatchViewModalComponent } from './modal/match-view-modal/match-view-modal.component';
import { NewsNoSidebarComponent } from './news-no-sidebar/news-no-sidebar.component';
import { DivisionStandingsComponent } from './division-standings/division-standings.component';
import { RecentResultsComponent } from './recent-results/recent-results.component';
import { TopStatsWidgetComponent } from './top-stats-widget/top-stats-widget.component';
import { CountdownComponent } from './countdown/countdown.component';
import { DivisionTableViewComponent } from './division-table-view/division-table-view.component';
import { MiniTeamViewComponent } from './division-table-view/mini-team-view/mini-team-view.component';
import { RecentNewsComponent } from './recent-news/recent-news.component';
import { DiaryComponent } from './diary/diary.component';
import { RecentContentComponent } from './recent-content/recent-content.component';
import { SafePipe } from './safe.pipe';
import { SafeHtmlPipe } from './static-html-loader/static-html-loader.component';
import { StaticHtmlLoaderComponent } from './static-html-loader/static-html-loader.component';
import { HideMenuDirective } from './nav/hide-menu.directive';
import { CategoriesComponent } from './blog/categories/categories.component';
import { BlogHeadlineComponent } from './blog/blog-headline/blog-headline.component';
import { TextInputComponent } from './formComponents/competitiveLevel/competitive-level.component';
import { StormLeagueComponent } from './formComponents/storm-league/storm-league.component';
import { PlayHistoryComponent } from './formComponents/play-history/play-history.component';
import { RolesComponent } from './formComponents/roles/roles.component';
import { DiscordTagComponent } from './formComponents/discord-tag/discord-tag.component';
import { TimezoneComponent } from './formComponents/timezone/timezone.component';
import { HistoryComponent } from './player/history/history.component';
import { PlayerStatsComponent } from './player/player-stats/player-stats.component';
import { MembersComponent } from './team/members/members.component';
import { PlayerSmallCardComponent } from './player/player-small-card/player-small-card.component';
import { TeamScheduleTableComponent } from './schedule/team-schedule-table/team-schedule-table.component';
import { TeamResultsTilesComponent } from './team/team-results-tiles/team-results-tiles.component';
import { TeamStatsComponent } from './team/team-stats/team-stats.component';
import { TeamHistoryComponent } from './team/team-history/team-history.component';
import { TeamUpcomingMatchComponent } from './team/team-upcoming-match/team-upcoming-match.component';
import { DivisionResultsTilesComponent } from './division/division-results-tiles/division-results-tiles.component';
import { DivisionUpcomingMatchesComponent } from './division/division-upcoming-matches/division-upcoming-matches.component';
import { NgsAccordianComponent } from './elements/ngs-accordian/ngs-accordian.component';
import { BannerImageComponent } from './banner-image/banner-image.component';
import { ResultsTilesComponent } from './results-tiles/results-tiles.component';
import { AvatarUploadComponent } from './player/avatar-upload/avatar-upload.component';
import { ApprovePendingAvatarComponent } from './admin/approve-pending-avatar/approve-pending-avatar.component';
import { ApproveAvatarViewComponent } from './admin/approve-pending-avatar/approve-avatar-view/approve-avatar-view.component';
import { TwitchComponent } from './formComponents/twitch/twitch.component';
import { TwitterComponent } from './formComponents/twitter/twitter.component';
import { YoutubeComponent } from './formComponents/youtube/youtube.component';
import { UpdateMemberInfoComponent } from './admin/manage-member/update-member-info/update-member-info.component';
import { UpdateTeamInfoComponent } from './admin/manage-team/update-team-info/update-team-info.component';
import { TeamTickerComponent } from './formComponents/team-ticker/team-ticker.component';
import { AllTeamsComponent } from './team/all-teams/all-teams.component';
import { DivisionIfPublicComponent } from './division-if-public/division-if-public.component';
import { LeagueStatsComponent } from './league-stats/league-stats.component';
import { LStatDirective } from './league-stats/l-stat.directive';
import { MatchResultsViewComponent } from './match/match-results-view/match-results-view.component';
import { ChallongeTournComponent } from './challonge-tourn/challonge-tourn.component';

import { DivisionLinkComponent } from './LinkComponents/division-link/division-link.component';
import { TeamLinkComponent } from './LinkComponents/team-link/team-link.component';
import { PlayerLinkComponent } from './LinkComponents/player-link/player-link.component';
import { DivisionCupResultsTilesComponent } from './division/division-cup-results-tiles/division-cup-results-tiles.component';
import { DivisionTournamentResultsTilesComponent } from './division/division-tournament-results-tiles/division-tournament-results-tiles.component';
import { DivisionCupScheduleComponent } from './division/division-cup-schedule/division-cup-schedule.component';
import { TeamTournamentScheduleTableComponent } from './schedule/team-tournament-schedule-table/team-tournament-schedule-table.component';
import { TeamTournamentResultsTilesComponent } from './team/team-tournament-results-tiles/team-tournament-results-tiles.component';
import { SeasonInfoManagerComponent } from './admin/match-management/season-info-manager/season-info-manager.component';
import { DatePickerComponent } from './formComponents/date-picker/date-picker.component';
import { AssistantCaptainMgmtComponent } from './modal/assistant-captain-mgmt/assistant-captain-mgmt.component';
import { PastSeasonsComponent } from './past-seasons/past-seasons.component';
import { AuthorListComponent } from './blog/author-list/author-list.component';
import { AuthorPageComponent } from './blog/author-page/author-page.component';

import { DivisionTournamentScheduleTableComponent } from './division/division-tournament-schedule-table/division-tournament-schedule-table.component';
import { CasterPageComponent } from './caster-tools/caster-page/caster-page.component';
import { AuthorNameComponent } from './blog/author-name/author-name.component';
import { ImageGetterComponent } from './blog/image-getter/image-getter.component';
import { MatchupHistoryComponent } from './match/matchup-history/matchup-history.component';
import { GamesInformationComponent } from './match/games-information/games-information.component';
import { MatchupInfoEmbeddableComponent } from './match/matchup-history/matchup-info-embeddable/matchup-info-embeddable.component';
import { ScheduleTableComponent } from './elements/schedule-table/schedule-table.component';
import { ScoutReportComponent } from './scout-report/scout-report.component';

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
    ManageMemberComponent,
    ManageSelectTeamComponent,
    TeamSearchComponent,
    ChangeCaptainModalComponent,
    DivisionManagementComponent,
    AddTeamComponent,
    DivisionPropsComponent,
    RemoveTeamComponent,
    ScheduleViewComponent,
    MatchSchedulerComponent,
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
    MatchViewModalComponent,
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
    MatchViewVerticleComponent,
    LargeCarouselComponent,
    NewsNoSidebarComponent,
    DivisionStandingsComponent,
    RecentResultsComponent,
    TopStatsWidgetComponent,
    CountdownComponent,
    DivisionTableViewComponent,
    MiniTeamViewComponent,
    RecentNewsComponent,
    DiaryComponent,
    RecentContentComponent,
    SafePipe,
    StaticHtmlLoaderComponent,
    HideMenuDirective,
    CategoriesComponent,
    BlogHeadlineComponent,
    TextInputComponent,
    StormLeagueComponent,
    PlayHistoryComponent,
    RolesComponent,
    DiscordTagComponent,
    TimezoneComponent,
    HistoryComponent,
    PlayerStatsComponent,
    MembersComponent,
    PlayerSmallCardComponent,
    TeamScheduleTableComponent,
    TeamResultsTilesComponent,
    TeamStatsComponent,
    TeamHistoryComponent,
    TeamUpcomingMatchComponent,
    DivisionResultsTilesComponent,
    DivisionUpcomingMatchesComponent,
    SafeHtmlPipe,
    NgsAccordianComponent,
    BannerImageComponent,
    ResultsTilesComponent,
    AvatarUploadComponent,
    ApprovePendingAvatarComponent,
    ApproveAvatarViewComponent,
    TwitchComponent,
    TwitterComponent,
    YoutubeComponent,
    UpdateMemberInfoComponent,
    UpdateTeamInfoComponent,
    TeamTickerComponent,
    AllTeamsComponent,
    DivisionIfPublicComponent,
    LeagueStatsComponent,
    LStatDirective,
    MatchResultsViewComponent,
    ChallongeTournComponent,
    DivisionLinkComponent,
    TeamLinkComponent,
    PlayerLinkComponent,
    DivisionCupResultsTilesComponent,
    DivisionTournamentResultsTilesComponent,
    DivisionCupScheduleComponent,
    TeamTournamentScheduleTableComponent,
    TeamTournamentResultsTilesComponent,
    SeasonInfoManagerComponent,
    DatePickerComponent,
    AssistantCaptainMgmtComponent,
    PastSeasonsComponent,
    AuthorListComponent,
    AuthorPageComponent,
    DivisionTournamentScheduleTableComponent,
    CasterPageComponent,
    AuthorNameComponent,
    ImageGetterComponent,
    MatchupHistoryComponent,
    GamesInformationComponent,
    MatchupInfoEmbeddableComponent,
    ScheduleTableComponent,
    ScoutReportComponent
  ],
  entryComponents:[
    DeleteConfrimModalComponent,
    ChangeCaptainModalComponent,
    ConfirmRemoveMemberComponent,
    EventModalComponent,
    MatchViewModalComponent,
    NgsAccordianComponent,
    AssistantCaptainMgmtComponent

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
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent]
})


export class AppModule {}

/*
    NgsAccordianComponent,
    NgsAccordianTitleComponent,
    NgsAccordianContentComponent
 */

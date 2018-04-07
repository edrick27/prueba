//'use strict';


app.homeView = kendo.observable({    
    
    
    alertsDataSource       : [],     
    tasksDataSource        : [],
    orphanAlertsDataSource : [],
    orphanTasksDataSource  : [],
    
    teamAlertsDataSource    : [], 
    teamTasksDataSource     : [], 
    maintenanceAlertsDataSource: [], // for housekeeper role
    housekeeperAlertsDataSource: [], // housekeeper tab for operations rol
    
    //housekeeperTasksDataSource: [],
    
    
    breakdownsDataSource   : [],  // averías
    
    alertSettings             : ['Estimar Duración'],
    
    staffDataSource           : [],
    staffDataSourceNoGrouping : [],  // for the dropdown when creating a task.
        
    
    taskTypesDataSource    : [],
    firstTaskType           : 0,
    
    facilitiesDataSource   : [],
    prioritiesDataSource   : [],
    actionlogDataSource     : [],
            
    
    filterOption           : 1, // default filter Option
    
    settings        : { hours: [{hour: 0}, {hour: 1}, {hour: 2}, {hour: 3}, {hour: 4}, {hour: 5}, {hour: 6}, {hour: 7} ,{hour: 8} ,{hour: 9}, {hour: 10}], 
                        minutes: [{minute: 0}, {minute: 5}, {minute: 10}, {minute: 15}, {minute: 20}, {minute: 25}, {minute: 30}, {minute: 35}, {minute: 40}, {minute: 45}, {minute: 50}, {minute: 55} ],  },
       
    alert           : {},  
    task            : {},
    
    chronometerAlert  : null,
    chronometerTask   : null,
    
    runChronometer    : false,
    
    profile         : { avatar: '', fullname: '' , role: ''},        
    isAlert         : true, // to differentiate when were are dealing with an alert vs a task
    isTask          : false,
    
    // inherited from taskController
    data            : { alerts : {pending:0, inprogress: 0, paused: 0, resolved: 0, total:0, notresolved: 0}, 
                        tasks:  {notstarted: 0, inprogress:0, paused: 0, finished:0, total:0, finished: 0}, 
                        all: {finished:0, total: 0},
                        effectivity: ''                        
                    }, // summary data with alerts and tasks statuses.
    
    collaborators: 0,
    
    orphanAlerts    : 0,       // number of alerts + tasks not assigned yet (orphans) 
    orphanTasks     : 0,      
    hasOrphanAlerts : false,
    hasOrphanTasks  : false,
    
    progress        : 0,
    progressTasks   : 0,
    
    timeaccomplishment: 0,
    timeDelay         : 0,  // if positive, means task are beeing finished in less time than expectd (which is good);
    
    // When I do I goBack when Viewing Alert/Task, if I am in Profile, I shuld go back to profile (regular goBack).
    // If not, I should do goHome..    
    checkingFromProfile: false,
    
    loadingChecklist: true,
    
    fromSlider      : false,
    
    showAlerts        : false,
    showTasks         : false,
    
    justLoggedIn      : true,
    
    imageAlert : "resources/imgs/page-loader.gif",
    loadingImg : "resources/imgs/page-loader.gif",
    hasImage    : false,
    version           : '',
    
    initializeCreateTask: true,
    typingTimer : 0,
    
    viewreported: false,    
    defaultfilter     : { 
        grouping: false, 
        notstarted: true,
        inprogress: true,
        paused: true,
        finished: true,
        appmaxalerts : 50
    },    // for housekeeper home
        
    
    
   

    cleanTask: function() {
        var that = app.homeView;
        that.set('task.startdate', new Date());
        that.set('task.hasstarttime', false);
        //that.set('task.starttime', $date.moment("HH:mm"));
        that.set('task.idfacility',0);
        that.set('task.idtype', that.firstTaskType);
        that.set('task.idstaff',0);        
        that.set('task.idpriority',0);
        that.set('task.instructions','');
                
    },
    
    
    goHome: function(e) {
        if (e != null) e.preventDefault();
        //app.navigateHome();        
        app.mobileApp.navigate("#:back");      
    },
    
    goBack: function(e) {           
        if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate("#:back");      
        
        /*if (app.homeView.checkingFromProfile == false)
            app.navigateHome();        
        else
            app.mobileApp.navigate("#:back");      */
    },
    
    goBack2: function(e) {        
        if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate("#:back");              
    },
    
    
    goBackWithScrollReset: function() { 
        app.homeView.refreshAlerts();
        //app.homeView.refreshTasks();
        app.mobileApp.navigate("#:back");
        app.homeView.myscroller.reset();
    },
    
    cancelSettings: function() {
        app.mobileApp.navigate("#:back", "none");
        
        /*if (app.homeView.isAlert)
            app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');                        
        else
            app.mobileApp.navigate('components/homeView/viewTaskHousekeeper.html');                        
        */
        
    },
    
    goBackNoTransition: function() {        
        app.mobileApp.navigate("#:back", "none");
    },
    
   
    
    getNewVersion: function() {
        var isAndroid = helper.isAndroid();
        var os =  isAndroid ? 'android' : 'ios';        
        app.homeView.set('isAndroid', isAndroid);       
       
      if(app.isOnline()){
           helper.showLoading('Espere...');
        $smart.getNewVersionURL({os:os})
        .done(function(url){
            app.homeView.set('linknewversion',url);
            helper.hideLoading();
           app.mobileApp.navigate('components/homeView/settings/newversion.html');      
        }).fail(function(error) {
             helper.hideLoading();
             helper.showDialogMessage("Occurio un problema", "Verifique que tiene conexión a internet");
             deferred.reject(error);
        });
      }else{
             helper.showDialogMessage("Occurio un problema", "Verifique que tiene conexión a internet");
      }
    },
    
    
    openDrawer: function(e) {
        e.preventDefault();
        $("#appDrawer").data("kendoMobileDrawer").show();
        return false;
    },
    
   
    
    
    
    init: function(e) {                
        var that = app.homeView;       
                 
        
        $('#appversion').html(app.version);
        $('#hotelname').html(app.hotel.name);        
        $('#dingdoneserver').html(app.server);        
        
              
        if (helper.isTablet()) {                        
            $('header').append('<style id="addedCSS" type="text/css">.btn-dialog {width:80%!important;}</style>');                                                
        }
        
        
        //helper.setPlusCirclePosition();
        
        var scroller = e.view.scroller;    
        scroller.reset();
        app.homeView.myscroller = scroller;
        
         scroller.bind("scroll", function(e) {
             window.scrollTop = e.scrollTop;
            
          });
        
                
         $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
             var target = $(e.target).attr("href") // activated tab             
             app.homeView.currentTab = target;             
             app.homeView.myscroller.reset();
        });
    },
    
   
     initTabs: function() {         
         if (app.user.role === globals.ROLE_HOUSEKEEPER)
             helper.activateTab("tab_actividad"); 
         else if (app.user.role === globals.ROLE_OPERATIONS)
             helper.activateTab("tab_mantenimiento"); 
         else if (app.user.role === globals.ROLE_MAINTENANCE)
             helper.activateTab("tab_mistareas"); 
         
     },
    
   
    
    
   
    
    
     // We need to be able to run this code when a new maid/maintenance logs in,
    // so refresh alerts and basic information.    
    beforeShow: function(e) {    
        var that = app.homeView;             
        that.fromReportAlert = false;
        
      
        
        $smart.resumeSyncToServer();
                
        
         // For animation purposes               
        that.set('progress',0);                        
        that.set('progressTasks',0);         
        that.set('timeaccomplishmentTemp',that.get('timeaccomplishment'));
        that.set('timeaccomplishment', 0);        
        that.set('profile.hotelname',  app.hotel.name);          
        
        that.set('fullname', app.user.fullname);
        that.set('avatar', helper.getAvatar(app.user.avatar));
        that.set('role', helper.getRole(app.user.role));
                 
        that.set('brothermodule', helper.getBrotherModuleName(app.user.idmodule));
        that.set('dingdone', app.user.available);
       /* if (typeof that.get('dingdoneSwitch') != 'undefined')
            that.get('dingdoneSwitch').check(app.user.available == 1);
       */
        
        /*
        var data = that.get('data');       
        console.info(data);
        that.set('noActivity', data.all.total === 0);
        */
        
        if (that.justLoggedIn) {     
            app.user.filterpreferences = app.user.filterpreferences || that.defaultfilter;                    
            that.set('filterpreferences', app.user.filterpreferences);
            that.set('viewreported', false);
            //that.initTabs();
        }
    },
    
    
    closeExitDialog: function() {
        app.homeView.get('dialogExit').data("kendoWindow").close();    
    },
    
     
    afterShow: function(e) {        
        var that = app.homeView;
        that.checkingFromProfile = false;
        
        helper.hideChat();
                
        $smart.resumeSyncWorker();      
        
        //that.showClock();
        // Ocupamos reestalecer el URL del home de acuerdo al rol del usuario cada vez.
        helper.setTabStripURLs();     
        
        //$smart.syncToServerAlertsNow();                          
                
                        
        
        if (!that.justLoggedIn) {                                                               
            that.set('progress',that.get('data.alerts.progress'));
            that.set('progressTasks', that.get('data.tasks.progress'));//that.get('progressTasksTemp'));                
            that.set('effectivity',that.get('effectivity'));                
            that.set('timeaccomplishment',that.get('timeaccomplishmentTemp'));            
            
            if ( app.user.role === globals.ROLE_OPERATIONS || app.user.role === globals.ROLE_HOUSEKEEPER ||
                 app.user.role === globals.ROLE_MAID) {
                                      
                //that.updateOccupancyStateToCleaningTasks();
            }
            return;
            
        }
        
       
        
        helper.pleaseWait();    
        that.initTabs();
        that.justLoggedIn = false;
        that.myscroller.reset();                       
        $smart.init(e);   
        
        that.refreshAlerts()
        .done(function() {  
            console.info('REFRESH');
             that.refreshData(true)                
            .done(function() {                                                                
                that.set('showAlerts',true);   
                helper.hideLoading();
                
            })     
         })     
                
               
       
      
    },
    
    showChecklist: function() {
         app.mobileApp.navigate('components/homeView/viewChecklist.html');      
    },
    
    aftershowChecklist: function(e){
        var scroller = e.view.scroller;        
        scroller.reset(); 
        setTimeout(function(){  $('.num').bootstrapNumber();$('.textoption').autosize();}, 1000);
    },
    
   
    
   showClock: function() {
          
    /*if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAINTENANCECHIEF)            
       helper.showClock($("#clockhousekeeperhome"));                    */
    if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)                    
       helper.showClock($("#clockmaid"));                    
   },
    
    
    styleAlertMaid: function(idstatus) {
        // Color del borde dependiendo del estado de la alerta.
        $("#jumbotron").removeClass("alertStatus1 alertStatus2 alertStatus3 alertStatus100");
        $("#jumbotron").addClass("alertStatus" + idstatus);
        
        app.homeView.styleAlertBorder();
        
       
    },
    
     styleTaskMaid: function(idstatus) {
        // Color del borde dependiendo del estado de la alerta.
        $("#jumbotronTask").removeClass("taskStatus1 taskStatus2 taskStatu3 taskStatus100");
        $("#jumbotronTask").addClass("taskStatus" + idstatus);
         
         app.homeView.styleTaskBorder();
        
        
        
    },
    
    
    beforeShowAlertMaid: function(e) {
        var scroller = e.view.scroller;        
        scroller.reset();
        
        
        var alert = app.homeView.get('alert');      
        
        app.homeView.set('actionLogDataSource', []);                                     
        $("#alertMaidActions").hide();        
        
        helper.showChat();
        
        
        
        app.homeView.set('hasImage', alert.uris !== null && alert.uris !== "");     
        app.homeView.set('hasChecklist', alert.idchecklist != null && alert.idchecklist != 0);
        
        if (alert.uris !== null) {                
            app.homeView.set('imageAlert',"resources/imgs/page-loader.gif");
            setTimeout(function() {                    
                     app.homeView.set('imageAlert',alert.uris);                                                            
            }, 500);                
        }       
        
        
        //app.homeView.styleAlertMaid(alert.idstatus);
        
        app.homeView.styleAlertBorderMaid();
        
        /*app.homeView.stopChronometerAlert();        
        if (alert.idstatus === globals.ALERT_STATUS_IN_PROGRESS)
            app.homeView.startChronometerAlert();
        */
         $('#chatInput').height(25);
    },
    
    
    beforeShowChecklist: function(e) {
        
        app.homeView.set('checkListVisible',false);
        
        app.homeView.set('loadingChecklist',true);
        
         if (app.homeView.alert.idchecklist != null) {
             var idalertfind = app.homeView.alert.idalert;
             if(app.homeView.alert.idalert == globals.MAX_INT) idalertfind = app.homeView.alert.uuid;
            
            app.homeView.getAlertChecklist(idalertfind, app.homeView.alert.idchecklist).
            done(function() {
                setTimeout(function(){ 
                    $('.num').bootstrapNumber();$('.textoption').autosize();
                    $("ul[data-role='listview']").find("input[type='checkbox']").each(function() {
                         $(this).bind('change',function () {
                             var option = new Object();
            
                             option.idalert = $( this ).parent().attr("id");
                             option.idchecklistoption = $( this ).attr("id");
                             option.value = ($( this ).is( ":checked" ) ? 1 : 0);
                             
                             if(option.idalert == globals.MAX_INT){
                                 option.alertguid = $( this ).parent().parent().attr("id");
                             }
                             
                             $smart.toggleChecklistOption(option)
                                .done(function(r) {
                                    console.info(r);
                                 }) 
                         });
                    });
                    
                     $("ul[data-role='listview']").find("textarea").each(function() {
                           $(this).blur(function(){
                                 var option = new Object();
            
                                 option.idalert = $( this ).parent().attr("id");
                             
                                var alertguid = $( this ).parent().parent().attr("id");
                                if(alertguid == "null"){
                                    option.alertguid = "0";
                                }else{
                                    option.alertguid = alertguid;
                                }
                                 option.idchecklistoption = $( this ).attr("id");
                                 option.value = $( this ).val();
                                   
                                    $smart.toggleChecklistOption(option)
                                       .done(function(r) {
                                            console.info(r);
                                        }) 
                            });
                        })
                    $('.collapse').collapse('show');
                    app.homeView.set('checkListVisible',true);
                    app.homeView.set('loadingChecklist',false);
                }, 200);
            })
        }
       
    },
    
    beforeShowTaskMaid: function(e) {
        var scroller = e.view.scroller;        
        scroller.reset();
       
        app.homeView.set('actionLogDataSource', []);                                             
        $("#taskMaidActions").hide();        
                        
        var task = app.homeView.get('task');
        app.homeView.styleTaskMaid(task.idstatus);
                        
        app.homeView.stopChronometerTask();
         // Si la alerta está en progreso, mostrar el cronómetro
        if (task.idstatus === globals.TASK_STATUS_IN_PROGRESS)
            app.homeView.startChronometerTask();
        
        
    },
    
    
    afterShowAlertMaid: function(e) {
        
        $smart.pauseSyncWorker();  
        
        app.homeView.showAlertEvaluation();        
        
        $("#alertMaidActions").show();
        
        app.homeView.prepareImagesSlideShow();
        
        //app.homeView.getActionLog(globals.IS_ALERT);
                
        /*if (app.homeView.alert.idstaff !== 0)
            app.homeView.pingReceivedByOwner(); */
        
        app.homeView.updateActionLog(globals.IS_ALERT);
        app.homeView.updateAlertChecklist(globals.IS_ALERT);
        
        
               
    },
    
    afterShowTaskMaid: function(e) {                
        app.homeView.showTaskEvaluation();  
        //helper.showClock($("#clockmaidTask"));                    
        $("#taskMaidActions").show();       
        
        
        //app.homeView.pingReceivedTaskByOwner();
        
        
    },
    
    
    
    showAlertSettings: function() {                                        
        app.mobileApp.navigate('components/homeView/settings/alertSettings.html');                        
    },
    
    showTaskSettings: function() {                                
        app.mobileApp.navigate('components/homeView/settings/taskSettings.html');                        
    },
    
    showSettingEstimateDuration: function() {        
        var that = app.homeView;
        
        if (that.get('isNotReadOnly') === false) return;
        
        that.set('estimate',{minutes: 0, hours: 0});
        
        if (app.homeView.isAlert) {
            that.set('estimate.minutes', that.get('alert.minutes'))
            that.set('estimate.hours', that.get('alert.hours'))    
        } else {            
            that.set('estimate.minutes', that.get('task.minutes'))
            that.set('estimate.hours', that.get('task.hours'))                                            
        }
        app.mobileApp.navigate('components/homeView/settings/estimateDuration.html');                        
    },
        
    
    // CONSIDERAR SI ESTÁ EN PAUSA...
    beforeShowEstimateDuration: function() {
        var that = app.homeView;        
        if (helper.estimateDurationInterval !== null) clearInterval(helper.estimateDurationInterval);    
                
        
        if (that.isAlert) {
            var alert = that.get('alert');
            that.set('alert.hasstarted', alert.inprogress || alert.paused);
            that.set('hasstarted', alert.inprogress || alert.paused);
            if (alert.inprogress || alert.paused) {
                that.updateElapsedAndRemainingTimeAlert();
                if (alert.inprogress) // Seguir Actualizando tiempos {                                
                    helper.estimateDurationInterval = setInterval(function(){that.updateElapsedAndRemainingTimeAlert()},30000);                
            }
        } else {  // Task
            var task = that.get('task');
            that.set('task.hasstarted', task.inprogress || task.paused);
            that.set('hasstarted', task.inprogress || task.paused);
            if (task.inprogress || task.paused) {
                that.updateElapsedAndRemainingTimeTask();
                if (task.inprogress) // Seguir Actualizando tiempos {                                
                    helper.estimateDurationInterval = setInterval(function(){that.updateElapsedAndRemainingTimeTask()},30000);                
            }
        }
    },

   
    updateElapsedAndRemainingTimeAlert: function() {        
        var that = app.homeView;        
        var alert = that.get('alert');
        var now = moment();
        var started, resumed, elapsed;
        
       var elapsedsecs = 0;
        
        // Si la alerta está en progreso...y no ha tenido pausas
        if (alert.inprogress && alert.resumedate === 0) {
            started = $date.toCurrentTimeZone(alert.startdate);                                
            elapsed = now.diff(started,'minutes');         
            elapsedsecs = now.diff(started,'seconds');
        }
        // Si la alert está pausada
        if (alert.paused) {            
            elapsed = Math.round(alert.duration / 60);       
            elapsedsecs = Math.round(alert.duration); 
        }
        // Si la alert está en progreso...y ha tenido pausas..        
        if (alert.inprogress && alert.resumedate !== 0) {
            resumed = $date.toCurrentTimeZone(alert.resumedate);                                
            elapsed = now.diff(resumed,'minutes');                   
            elapsed += Math.round(alert.duration / 60);
            
            elapsedsecs = now.diff(resumed,'seconds');    
            elapsedsecs += Math.round(alert.duration); 
            
        }
        
        var expectedduration = alert.expectedduration * 60;        
        var porcentage = Math.floor((elapsedsecs / expectedduration) * 100);
        that.set('alert.progresspercentage', porcentage);
        
        // Remaining Time
        that.set('alert.elapsed',elapsed);  
        that.set('alert.elapsedtext', helper.formatDuration(elapsedsecs));  
        var remaining = that.alert.expectedduration - elapsed;        
        if (remaining > 0) {
            var hours = Math.floor(remaining/60);
            var minutes = remaining % 60;            
            minutes = Math.ceil(minutes / 5) * 5; 
            if (minutes === 60) {
                hours = 1;
                minutes = 0;
            }
            that.set('estimate.hours', hours);
            that.set('estimate.minutes', minutes);
        }
    },
    
    updateElapsedAndRemainingTimeTask: function() {        
        var that = app.homeView;        
        var task = that.get('task');
        var now = moment();
        var started, resumed, elapsed;
        
        // Si la tarea está en progreso...y no ha tenido pausas
        if (task.inprogress && task.resumedate === 0) {
            started = $date.toCurrentTimeZone(task.started);                                
            elapsed = now.diff(started,'minutes');                                             
        }
        // Si la tarea está pausada
        if (task.paused) {            
            elapsed = Math.round(task.duration / 60);            
        }
        // Si la tarea está en progreso...y ha tenido pausas..        
        if (task.inprogress && task.resumedate !== 0) {
            resumed = $date.toCurrentTimeZone(task.resumedate);                                
            elapsed = now.diff(resumed,'minutes');                   
            elapsed += Math.round(task.duration / 60);            
        }
        
        // Remaining Time
        that.set('task.elapsed',elapsed);                                
        var remaining = that.task.expectedduration - elapsed;        
        if (remaining > 0) {
            var hours = Math.floor(remaining/60);
            var minutes = remaining % 60;            
            minutes = Math.ceil(minutes / 5) * 5; 
            if (minutes === 60) {
                hours = 1;
                minutes = 0;
            }
            that.set('estimate.hours', hours);
            that.set('estimate.minutes', minutes);
        }
    },
    
    
    cancelSettingEstimateDuration: function(e) {     
        app.homeView.goBack(e);
    },
    
    
    
    acceptSettingsEstimateDuration: function() {
        var that = app.homeView;
        if (that.isAlert)
            that.acceptAlertSettingsEstimateDuration();
        else
            that.acceptAlertSettingsEstimateDuration();        
    },
    
    
    
    
    acceptAlertSettingsEstimateDuration: function() {
        var that = app.homeView;
        that.set('alert.hours', that.get('estimate.hours'));
        that.set('alert.minutes', that.get('estimate.minutes'));        
        var expectedduration = that.get('alert.hours')*60 + that.get('alert.minutes');
        console.info(expectedduration);
        that.set('alert.expectedduration', expectedduration);
        if (that.alert.startdate !== 0 && that.alert.startdate != null && that.idcategory == globals.IS_ALERT) {
            console.info('ojo');
            that.set('alert.expectedduration',expectedduration + that.get('alert.elapsed'));
        }
        
        console.info( that.get('alert.expectedduration'));
        
        helper.showLoading('Espere...');
        $smart.alertSettings(that.get('alert'),1, that.get('alert.expectedduration'))
        .done(function(result) {
            that.expectedDurationElements(that.get('alert.expectedduration'));
            that.refreshAlerts()
            .done(function() {                
                helper.hideLoading();
                // TODO: check if housekeeper
                //app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');                
                 app.mobileApp.navigate("#:back");                                       
            })        
        })        
    },
    
    
    
    
    showAlertSettingWillCheckDate: function() {
        // Backup to restore if cancel
        app.homeView.alert._willcheckdate = app.homeView.get('alert.willcheckdate');                
        app.mobileApp.navigate('components/homeView/settings/willcheck.html');                
    },
    
    
    cancelAlertSettingWillCheckDate: function(e) {        
        app.homeView.set('alert.willcheckdate', app.homeView.alert._willcheckdate);        
        app.homeView.goBack();
    },
  
     
    
    
    acceptAlertSettingsWillCheckDate: function() {
        var that = app.homeView;
        var that = app.homeView;
                
        var now = moment();         
        now.add(that.get('alert.willcheckhours')*60 + that.get('alert.willcheckminutes'),'minutes');                
        that.set('alert.willcheckdate', $date.toUTC(now));        
        //console.info($date.datef(that.get('alert.willcheckdate'), "h:mm a"));   
        
        
        helper.showLoading('Espere...');
        $smart.alertSettings(that.get('alert'),2, that.get('alert.willcheckdate'))
        .done(function(result) {
            //that.expectedDurationElements(that.get('alert.expectedduration'));
            that.refreshAlerts()
            .done(function() {                
                var alert = that.get('alert');
                var txt = "Lo reviso en ";
                if (alert.willcheckhours > 0) txt += alert.willcheckhours + 'hr';
                txt += alert.willcheckminutes + "min";
                helper.sendPushNotificationAlert(alert,globals.PN_ALERT_WILLCHECK, txt);
                helper.hideLoading();                
                app.mobileApp.navigate("#:back");     
                app.mobileApp.navigate("#:back");     
                // TODO: check if housekeeper
                //app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');                
                
            })        
        })        
        
    },
    
    
    
    showFinishAlert: function() {                
        $smart.getAlertTypeByID(app.homeView.get('alert.idtype'))
        .done(function(alertType) {
            var requiressolutiontext = (alertType == null ? 0 : alertType.requiressolutiontext);            
            helper.showSolutionTextDialog('¿La alerta ha sido resuelta?', function(solutiontext) {app.homeView.finishAlert(solutiontext)}, requiressolutiontext);            
        })
        
    },
         
    
    showPauseAlert: function() {        
        helper.showDialogYNJ('¿Desea pausar la actividad?', function(reason) {app.homeView.pauseAlert(reason)});
    },
    
    showPauseTask: function() {        
        helper.showDialogYNJ('¿Desea pausar la actvidad?', function(reason) {app.homeView.pauseTask(reason)});
    },
    
   
    
    showResumeTask: function() {        
        helper.showDialogYN('¿Desea reanudar la tarea?', function() {app.homeView.resumeTask()});
    },
    
     showFinishTask: function() {        
        helper.showDialogYN('¿La tarea ha sido finalizada?', function() {app.homeView.finishTask()});
    },
    
    showMarkAlertAsFinished: function() {                 
        helper.showDialogYN('¿Desea marcar la alerta como finalizada?', function() {app.homeView.markAlertAsFinished(false)});
    },
    
    showMarkTaskAsFinished: function() {
        helper.showDialogYN('¿Desea marcar la tarea como finalizada?', function() {app.homeView.markTaskAsFinished()});
    },
    
    
    showMarkAlertAsDND: function() {                 
        helper.showDialogYN('¿Desea marcar la alerta como DND?', function() {app.homeView.markAlertAsDND()});
    },
    
    showMarkTaskAsDND: function() {                 
        helper.showDialogYN('¿Desea marcar la tarea como DND?', function() {app.homeView.markTaskAsDND()});
    },
    
      
    showDNDTask: function() {
        helper.showDialog('dialogDNDTask');                                            
    },
    
    showCreateCommentAlertDialog: function() { 
        helper.showDialogComment('Agregar Comentario', function(comment) {app.homeView.sendCommentAlert(comment, null) });
    },
    
    showEscalateAlert: function() {
        helper.showDialogYN('¿Desea escalar alerta a Mantenimiento?', function() {app.homeView.escalateAlert()});
    },
    
    showAlertToTask: function() {
        helper.showDialogYN('¿Desea convertir alerta a tarea?', function() {app.homeView.alertToTask()});
    },
    
    
    toggleCommands: function() {        
        var isVisible = $('#circleActions').is(':visible');
        if (!isVisible) {       
            $( "#circleActions" ).fadeIn( "slow", function() {});
            $("#circleActionHousekeeper").css('background-color', "gray");
        }
        else {
            $( "#circleActions" ).fadeOut( "slow", function() {});
            $("#circleActionHousekeeper").css('background-color', "#E52E86");
        }        
    },
    
     toggleCommandsMaid: function() {        
        var isVisible = $('#circleActionsMaid').is(':visible');
        if (!isVisible) {       
            $( "#circleActionsMaid" ).fadeIn( "slow", function() {});
            $("#circleActionMaid").css('background-color', "gray");
        }
        else {
            $( "#circleActionsMaid" ).fadeOut( "slow", function() {});
            $("#circleActionMaid").css('background-color', "#E52E86");
        }
     },
    
   
    
    showCreateCommentTaskDialog: function() {                        
        helper.showDialogComment('Agregar Comentario', function(comment) {app.homeView.sendCommentTask(comment) });
    },
    
    
   
    
    
    
    
    beforeShowAlertHousekeeper: function(e) {        
        var that = app.homeView;
        
        $smart.pauseSyncToServer();
        
        var alert = that.get('alert');                
        that.set('fullname', app.user.fullname);        
        
        app.homeView.set('actionLogDataSource', []);                                     
        $("#alertHousekeeperActions").hide();
               
        
       helper.showChat();
        
        
        that.styleAlertBorder();
        
        var scroller = e.view.scroller;        
        scroller.reset();
        
        that.set('hasImage', alert.uris !== null && alert.uris !== "");        
        if (alert.uris !== null) {                            
            that.set('imageAlert',"resources/imgs/page-loader.gif");
            setTimeout(function() {                    
                    that.set('imageAlert',alert.uris);                                                            
            }, 200);                
        }       
        
        app.homeView.set('hasChecklist', alert.idchecklist != null && alert.idchecklist != 0);
        
        if (that.get('alert').idcategory === globals.ALERT_CATEGORY_LOSTANDFOUND) {
            that.set('imageAlert',"resources/imgs/page-loader.gif");
            //$("#imageAlert").removeClass('effectsLostAndFound');
            
            $("#iconAlertCategory").removeClass('mdi-alert-outline');
            $("#iconAlertCategory").addClass('mdi-binoculars');
            that.set('isLostAndFound', true)                 
        }
        else {
            that.set('isLostAndFound', false)
            $("#iconAlertCategory").addClass('mdi-alert-outline');
            $("#iconAlertCategory").removeClass('mdi-binoculars');
        }
        
      $('#chatInput').height(25); 
    },
    
    styleAlertBorder: function(e) {
        var alert = app.homeView.get('alert');      
                
        $("#viewAlertHeader").removeClass('borderIdcategory1 borderIdcategory2');
        $("#viewAlertHeader").addClass('borderIdcategory' + alert.idcategory);
        
        //console.info(alert.isTask);
                
        var status = "alertStatus" + alert.idstatus;
        $("#alertSummary").removeClass('alertStatus1 alertStatus2 alertStatus3 alertStatus100');
        
        if (alert.idstatus == 1 && alert.isTask == true )        
            $("#alertSummary").addClass('taskStatus1');                
        else {
            $("#alertSummary").addClass(status);                
            $("#alertSummary").removeClass('taskStatus1');                
            }
            
    },
    
    
    styleAlertBorderMaid: function(e) {
        var alert = app.homeView.get('alert');      
                
        $("#viewAlertHeaderMaid").removeClass('borderIdcategory1 borderIdcategory2');
        $("#viewAlertHeaderMaid").addClass('borderIdcategory' + alert.idcategory);
        
        
                
        var status = "alertStatus" + alert.idstatus;
        $("#viewAlertHeaderMaid").removeClass('alertStatus1 alertStatus2 alertStatus3 alertStatus100');
        
        if (alert.idstatus == 1 && alert.isTask == true )        
            $("#viewAlertHeaderMaid").addClass('taskStatus1');                
        else {
            $("#viewAlertHeaderMaid").addClass(status);                
            $("#viewAlertHeaderMaid").removeClass('taskStatus1');                
            $("#viewAlertHeaderMaid").removeClass('borderIdcategory1 borderIdcategory2');
            }
            
    },
    
    
    styleTaskBorder: function(e) {
        var status = "taskStatus" + app.homeView.get('task').idstatus;
        $("#taskSummary").removeClass('taskStatus1 taskStatus2 taskStatus3 taskStatus100');
        $("#taskSummary").addClass(status);
        
    },
    
     stretchImage: function(id) {
       
         
        $("#slideImage" + id).hasClass('strechLostAndFound')    ?
        $("#slideImage" + id).removeClass('strechLostAndFound') :
        $("#slideImage" + id).addClass('strechLostAndFound');
         
        
         
    },
    
    strechActionLogImage: function(imgID) {        
        var img = "#actionlogPicture" + imgID;        
        
        $(img).hasClass('strechLostAndFound')    ?
        $(img).removeClass('strechLostAndFound') :
        $(img).addClass('strechLostAndFound');
         
    },
    
   
    
    
    
    afterShowAlertHousekeeper: function(e) {
        
        $smart.pauseSyncWorker();  
        
        // Evaluation
        app.homeView.showAlertEvaluation();
        
        $("#alertHousekeeperActions").show();                      
        
        app.homeView.prepareImagesSlideShow();
        
        app.homeView.getActionLog();        
        
        var alert = app.homeView.get('alert');                
        // Solo hacemos ping si la alerta es del mi módulo o me fue asignada...        
        if (app.user.idmodule == alert.idmodule || alert.idstaff == app.user.idstaff) {                        
           // app.homeView.pingReceived();
            
        }        
        
        app.homeView.updateActionLog(globals.IS_ALERT);
        app.homeView.updateAlertChecklist(globals.IS_ALERT);
        //$("#ll"+ alert.idalert).hide();
       
    },
    
    
    prepareImagesSlideShow: function() {
        
        
        $("#alertImagesSliderParent").empty();        
        $("#alertImagesSliderParent").append("<section id='alertImagesSlider' class='regular slider'> </section>");
        
        var uris = app.homeView.get('alert').uris;
        
        if (uris == "" || uris == null) return;
        
        var images = uris.split(',');        
        
        
        for (var i=0;i<images.length;i++)        
            $("#alertImagesSlider").append("<div> <img src='" + images[i] + "' style='border: 1px solid gray'></div>");
        
        $('.regular').slick({
                 dots: true,
                 infinite: false,
                 fade: false,
                 arrows: false,
                 cssEase: 'linear'       
        });                 
        
      
        
        
    },
    
    
    
    
    tabTasks: function(e) {      
      $("a[href=#tab_tasks]").tab('show');
    },
    
    tabAlerts: function(e) {      
      $("a[href=#tab_alerts]").tab('show');
    },
    
    
    initSelectStaff: function(e) {
        helper.preparePullToRefresh(e, function() { app.homeView.pullToRefreshStaff(e) });
    },
    
    
    initAlertHousekeeper: function(e) {        
        helper.preparePullToRefresh(e, function() {            
            app.homeView.updateActionLog(globals.IS_ALERT);
        });
        
        
         $("#chatInput").unbind('keyup');
        
         $("#chatInput").keyup(function() {             
             if ($(this).val().length == 0) {    
                 $("#viewAlert #btnChatSend").hide(500);
                 $("#viewAlert #btnChatPhoto").show();
                 
             }
             else {
                 $("#viewAlert #btnChatPhoto").hide();
                 $("#viewAlert #btnChatSend").show(500);
             }
        })
        
        $('#chatInput').autosize();
        $('#chatInput').height(25);
    },
    
     initTaskHousekeeper: function(e) {                         
        helper.preparePullToRefresh(e, function() { 
            app.homeView.updateActionLog(globals.IS_TASK);
        });
           
         
         
        
    },
    
    initAlertMaid: function(e) {
        helper.preparePullToRefresh(e, function() { 
            app.homeView.updateActionLog(globals.IS_ALERT);             
        });
        
         $("#chatInput").unbind('keyup');
        
         $("#chatInput").keyup(function() {             
             if ($(this).val().length == 0) {    
                 $("#viewAlert #btnChatSend").hide(500);
                 $("#viewAlert #btnChatPhoto").show();
                 
             }
             else {
                 $("#viewAlert #btnChatPhoto").hide();
                 $("#viewAlert #btnChatSend").show(500);
             }
        })
        
        $('#chatInput').autosize();
        $('#chatInput').height(25);
    },
    
    
    initTaskMaid: function(e) {
        helper.preparePullToRefresh(e, function() { 
            app.homeView.updateActionLog(globals.IS_TASK);
        });
    },
    
    
    // Retrieves alert actionlog entries from localdatabase
    getActionLog: function() {
        var that = app.homeView;        
        var deferred = $.Deferred();        
        
         
        $smart.getActionLog(that.get('alert'))
        .done(function(actionlog) {                                   
             actionlog.fetch(function() {                
                 app.homeView.set('noActionlog', actionlog.total() == 0);
                 app.homeView.set('actionLogDataSource', actionlog);                                                      
                 deferred.resolve();
            })
        })                        
        return deferred.promise();
    },
    
    
    // Checks into BE for new entries..
    updateActionLog: function() {
        var that = app.homeView;
        var deferred = $.Deferred();
        var idalert = that.get('alert.idalert'); 
                
        
        $smart.updateActionLog(idalert)
        .done(function(haschanges) {
            return that.getActionLog();
        })
        return deferred.promise();
    },
    
    updateAlertChecklist: function() {
        var that = app.homeView;
        var deferred = $.Deferred();
        var idalert = that.get('alert.idalert'); 
        if(idalert == globals.MAX_INT) return;
        $smart.updateAlertChecklist(idalert)
        .done(function(haschanges) {
            return that.getActionLog();
        })
        return deferred.promise();
    },
    
    getAlertChecklist: function(idalert, idchecklist) {
        var that = app.homeView;        
        var deferred = $.Deferred();         
        
         $smart.getAlertChecklistOptionsLocal(idalert, idchecklist)
         .done(function(options) {   
             options.fetch(function() {                
                 
                 if (options.total() == 0) { // need to get checklist from BE
                     helper.smallBottomAlert('<i class="mdi mdi-checkbox-marked-outline c-main3 "></i>' + " Sincronizando Checklist...");
                     $smart.getAlertChecklist(idalert, idchecklist)
                     .done(function(data) {
                         data.fetch(function() {                
                             app.homeView.set('checklistDataSource', data);         
                             helper.smallBottomAlertRestore ();
                             deferred.resolve();
                         })
                     })
                 }
                 else {
                     app.homeView.set('checklistDataSource', options);         
                     helper.smallBottomAlertRestore ();
                     deferred.resolve();                     
                 }
                 
            })
         }) 
        
       
        return deferred.promise();
    },
    
    gobackalertview: function(e){
        
      
        $("ul[data-role='listview']").find("textarea").each(function() {
            var option = new Object();
            
            option.idalert = $( this ).parent().attr("id");
            var alertguid = $( this ).parent().parent().attr("id");
            if(alertguid == "null"){
                option.alertguid = "0";
            }else{
                option.alertguid = alertguid;
            }
            option.idchecklistoption = $( this ).attr("id");
            option.value = $( this ).val();
         
             $smart.toggleChecklistOption(option)
                .done(function(r) {
                   // console.info(r);
                })
        });  
        app.mobileApp.navigate("#:back"); 
    },
    
    toggleChecklistOption: function(e) {
        var option = e.dataItem;
        if(option.optiontype == 2)
        {
          option.value = (option.value == 1 ? 0 : 1);
            var checked = true;
            checked = (option.value == 1 ? true : false);
            if(option.optiontype == 1){
                 $("#"+option.idchecklistoption).prop("checked",checked);
                option.value = ($("#"+option.idchecklistoption).is(":checked") == true ? 1 : 0);
            }else{
                var switchInstance = $("#"+option.idchecklistoption).data("kendoMobileSwitch");
                switchInstance.check(checked);
            }
             
             $smart.toggleChecklistOption(option)
                .done(function(r) {
                    //console.info(r);
                })
        }else{
             if(option.optiontype == 4){
                setTimeout(function(){
                    option.value = $("#"+option.idchecklistoption).val();
                    //console.log(option.value);
                      $smart.toggleChecklistOption(option)
                        .done(function(r) {
                           // console.info(r);
                        })
                }, 100);
            }
        }  
    },
    
    takePicture: function() {
        app.homeView.goPicture(navigator.camera.PictureSourceType.CAMERA);        
    },
    
    goPicture: function(source) {                        
        
        everliveController.takePicture(source)
        .done(function(data) {            
           app.homeView.sendCommentAlert('Imagen', data);
        })        
        .fail(function(error) {
           //helper.showAlert(error,'No se agregó imagen!');       
        })
    },
    
    sendChatComment: function(e) {
        var comment = $("#viewAlert #chatInput").val();        
        app.homeView.sendCommentAlert(comment, null);
       
        $("#viewAlert #chatInput").val('')
        $("#viewAlert #btnChatSend").hide(500);
        $("#viewAlert #btnChatPhoto").show();
        $('#viewAlert #chatInput').height(25); 
        $("#viewAlert #chatInput").focus();   
    },
    
    
           
    
    
    
    /****************************************************/
    /*  Housekeeper filter Settings                     */ 
   /****************************************************/ 
    
    
    
    
    onSwitchAgruparClick: function(e) {
        var switchInstance = $("#agrupar-switch").data("kendoMobileSwitch");
        app.user.filterpreferences.grouping = switchInstance.check();
        app.homeView.set('filterpreferences.grouping', switchInstance.check());
        app.homeView.updateFilterPreferences();
        app.homeView.applyFilterGrouping();        
    },
    
    
    initFilter: function(e) {
        var idForSwitch = "#switch";
        var that = app.homeView;  
        
        if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE) {
            idForSwitch += "-maid";            
        }
        
        var filters     = ["notstarted", "inprogress", "paused", "finished","appmaxalerts"];        
        for (var i=0; i<filters.length; i++) {   
            var status = filters[i];             
            var id = idForSwitch + "-" + status;             
            $(id).prop('checked',app.user.filterpreferences[status]);
            $(id).click(function() {                        
                var idArray = $(this).prop('id').split("-");
                var status = idArray[idArray.length-1];
                app.user.filterpreferences[status] = $(this).prop('checked');
                app.homeView.updateFilterPreferences();
               // app.homeView.refreshAlerts();
               // app.homeView.refreshTasks();
            });
            
        }
        
        var app_max_alerts = localStorage.getItem("app_max_alerts");
        
        $('#numalerttoshow').bootstrapNumber();
        if(app_max_alerts > 0){
                $('#numalerttoshow').val(app_max_alerts);
            }else{
                $('#numalerttoshow').val("50");
            }
        
       $("#numalerttoshow").change(function() {
           localStorage.removeItem("app_max_alerts");
           localStorage.setItem("app_max_alerts", $(this).val());
           console.log($(this).val());
           clearTimeout(that.typingTimer);
           that.typingTimer = setTimeout(
           function() {
                   app.user.filterpreferences[filters[4]] =  $("#numalerttoshow").val();
                   app.homeView.updateFilterPreferences();
                   console.log(app.user.filterpreferences);
               }, 500);
       });      
    },

     
    updateFilterPreferences: function() {        
        helper.showLoading('Espere');
        
        localStorage.setItem('dingdone:filterpreferences', JSON.stringify(app.user.filterpreferences))
        
        $smart.updateFilterPreferences(app.user.filterpreferences)
        .done(function() {                        
           helper.hideLoading();
        })
        .fail(function() {
            helper.hideLoading();
        })
        
    },
    
    
     applyFilterGrouping: function() {
        var that = app.homeView;
         
         that.refreshAlerts()
         .done(function() {
            /* that.refreshTasks()
             .done(function() {                                             
             })                          */
         })
    },
    
    
    setOccupancyState: function(idfacility, element) {
        var deferred = $.Deferred();
        
        $smart.getFacilityOccupancy(idfacility)
        .done(function(occupancies) {            
            var html = "";
            for (var i=0;i<occupancies.length;i++) {
                if (occupancies[i].status == "Entra") {                
                    if (occupancies[i].guestactivity < globals.GUEST_ACTIVITY_CHECKED_IN)
                        html += '<span class="label statusENTRA">ENTRA</span>';
                    else
                        html += ' <i class="mdi mdi-arrow-left-bold-circle magictime tinRightIn"' +
                                 'style="color: \#ff362f; font-size: 20px;"></i>' +
                                 '<span class="label statusENTRA">YA ENTRÓ</span>';
                } else if (occupancies[i].status == "Sale") {
                     if (occupancies[i].guestactivity < globals.GUEST_ACTIVITY_CHECKED_OUT)
                        html += ' <span class="label statusSALE">SALE</span>';
                    else
                        html += ' <span class="label statusSALE">YA SALIÓ</span>';
                    
                } else if (occupancies[i].status == "Hospedado") {
                    html += '<span class="label statusHOSPEDADO">HOSPEDADO</span>';                                        
                } else if (occupancies[i].status == "Desocupada") {
                    html += '<span class="label statusDESOCUPADA">DESOCUPADA</span>';
                }
                html += " ";                    
            } // for
                
            element.html(html);
            deferred.resolve();
                
        });      
            
        return deferred.promise();
    },
    
    
    
    
    updateOccupancyStateToCleaningTasks: function() {
        
        console.info('OCCUPANCY STATE')
        
        
        var promises = [];
        var idfacility = null;
        $(".occupancyStatusOnTask" ).each(function( index ) {            
            
            idfacility = $(this).attr('id').replace('facility','');                                                
            promises.push(app.homeView.setOccupancyState(idfacility, $(this)));
        });
        
        return $.when.apply($,promises);
        
        
    },
    
    
  
    
    
    /****************************************************/ 
    
    
    // REFRESHES DATA ON SCREEN
    // This methods gets the current amount of tasks/alerts by status to update badges
    // It also counts the number or orphan tasks/alerts if refreshOrphans = true
    // It also refreshes progress
    refreshData: function(refreshOrphans) {        
        var deferred = $.Deferred();        
        var that = app.homeView;        
        var data = null;       
                      
      // Run async method to update cleaning tasks occupancy 
       // setTimeout(function() {that.updateOccupancyStateToCleaningTasks(); }, 1000);
        
        // effectivity, timeaacomplishment and performance (evaluation) is calculated in getStaffDetails. 
        // Also we grab currentactivity info
        
        $smart.getStaffDetails()
        .done(function(staff) { 
            staff.fetch(function() {    
                 
                $smart.refreshData()
                .done(function(data) {
                     that.set('data', data);     

                    helper.setBadge(globals.TABSTRIP_HOME, data.alerts.pending + data.tasks.pending);  
                    if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)   {
                        app.profileView.justLoggedIn = true;  // so it will refresh staff stats...                    
                        that.set('noActivity', data.all.total === 0);
                        that.set('staff', staff._data[0]);                               
                        deferred.resolve();                    
                    } 
                    else {                                                                
                        that.refreshScreenInfo(data,refreshOrphans);                    
                        that.set('noActivity', data.all.total === 0);
                        that.set('staffDataSource', staff);              
                        that.countCollaborators(staff);                    
                        staff.group({field: "available", dir: "desc"});           
                        app.profileView.justLoggedIn = true;  // so it will refresh staff stats...                    
                        if (that.get('noActivity') === true)                    
                            that.set('data.effectivity', '...');
                        else
                            that.set('data.effectivity', data.effectivity + '%' );                        
                                                                                  
                       deferred.resolve();                    
                    }
                    
                    
                })
                
               
           })
        })
            
    
        
       return deferred.promise();
    },
    
    
    refreshScreenInfo: function(data, refreshOrphans) {
        var that = app.homeView;        
        $("#groupAlertsPending").html(data.alerts.pending);
        $("#groupAlertsInprogress").html(data.alerts.inprogress);
        $("#groupAlertsPaused").html(data.alerts.paused);
        $("#groupAlertsResolved").html(data.alerts.resolved);
        
        that.set('newVersion', app.newversion);
            
        $("#groupTasksNotStarted").html(data.tasks.pending);
        $("#groupTasksInprogress").html(data.tasks.inprogress);
        $("#groupTasksPaused").html(data.tasks.paused);
         $("#groupTasksFinished").html(data.tasks.resolved);
      
      if (refreshOrphans) {
          // Alerts
          var orphanAlerts = that.get('orphanAlertsDataSource').total();                         
          that.set('orphanAlerts', orphanAlerts);  
          (orphanAlerts > 0) ? that.set('hasOrphanAlerts', true) : that.set('hasOrphanAlerts', false);
                
          // Tasks
          /*if (typeof that.get('orphanTasksDataSource').total != 'undefined') {          // REVISAR
              var orphanTasks = that.get('orphanTasksDataSource').total();
              that.set('orphanTasks', orphanTasks);  
              (orphanTasks > 0) ? that.set('hasOrphanTasks', true) : that.set('hasOrphanTasks', false);
          }*/
      }
        
            
        // Show proper message...if nothing to assign        
        if (that.get('hasOrphanAlerts') === false && that.get('hasOrphanTasks') === false)
            that.set('nothingToAssign', true);
        else
            that.set('nothingToAssign', false);
        
            
        that.set('noAlerts', data.alerts.total === 0); 
        //that.set('noTasks', data.tasks.total === 0);         
            
            
        if (data.all.total > 0) {                    
            that.set('noActivity', false);
            // REFRESH PROGRESS ALERTS                                        
            var progress = data.alerts.progress;
            that.set('progress', progress);                        
            if (progress === 100)
                $("#progressAlerts .k-progress-status").css('color',"white");
            else
                $("#progressAlerts .k-progress-status").css('color',"black");
                                
            // REFRESH PROGRESS TASKS
            if (data.tasks.total > 0) {            
                var progressTasks = data.tasks.progress;
                that.set('progressTasks', progressTasks);                        
                if (progressTasks === 100)
                    $("#progressTasks .k-progress-status").css('color',"white");
                else
                    $("#progressTasks k-progress-status").css('color',"black");
            }                
            //that.calculateTimeAccomplishmentAndEffectivity();    
        }
        else {                
            that.set('progress', 0);
           // that.set('progressTasks', 0);
            that.set('timeaccomplishment',0);                                                        
            that.set('noActivity', true);
       }
        
        
    },
    
    
    
    countCollaborators: function(ds) {
        var count = 0;
        ds.fetch(function() {
            var view = ds.view();              
            for (var n=0; n<view.length; n++) {                                            
                if (view[n].available === 1)
                    count++;
            }                
            app.homeView.set('collaborators', count);
        })
        
    },
    
    
    // Cumplimiento del tiempo se calcula a partir de las alertas/tareas finalizadas    
    calculateTimeAccomplishment: function() {
        var that = app.homeView;
        var alerts = that.get('alertsDataSource').view();
        var tasks = that.get('tasksDataSource').view();
        var expectedduration = 0;
        var duration   = 0;   // actual duration 
        var calculate = false;
                
        
                        
        // Alerts
        for(var i = 0; i<alerts.length; i++) {                
            if (alerts[i].idstatus === globals.ALERT_STATUS_RESOLVED) {
                calculate = true;
                expectedduration += alerts[i].expectedduration;
                duration         += alerts[i].duration;
           }
        }   
        
        // Tasks
        for(i = 0; i<tasks.length; i++) {                
            if (tasks[i].idstatus === globals.TASK_STATUS_FINISHED) {
                calculate = true;
                expectedduration += tasks[i].expectedduration;
                duration         += tasks[i].duration;
           }
        }   
        
       if (!calculate) {
            that.set('hasDelay', 0);                    
            that.set('timeDelay', 0);
          
           return;  // No resolved alerts..or tasks           
       }
            
       expectedduration *= 60;
            
       if (duration <= expectedduration) {                
           that.set('timeaccomplishment',100);                                
       }
       else {            
           var n = 100- [((duration - expectedduration)*100)/ expectedduration];           
           that.set('timeaccomplishment', n);
       }
            
            
        var timeDelay = Math.floor((expectedduration - duration) / 60);                        
            
        that.set('hasDelay', (timeDelay < 0));                    
        that.set('timeDelay', Math.abs(timeDelay));
          
        
        
        
    },
        
    
    pullToRefresh: function(e) {                      
        
        if (!app.idle) return;
               
        
        if (app.isOffline()) {
            helper.smallBottomAlert('<i class="mdi mdi-wifi-off "></i>' + "  OFFLINE...!");
            return;                
        }
                
        var that = app.homeView;        
        e.view.scroller.pullHandled();                                                            
        helper.smallBottomAlert('<i class="fa fa-refresh fa-spin "></i>' + "  Refrescando...");
        
       // app.idle = false;
        helper.pleaseWait();
        
        $smart.syncToServer()
        .done(function() {                        
            
             that.updateAlerts()        
            .done(function(hasChanges) {
              if(hasChanges){
                that.refreshData(true)
                .done(function() {                  
                
                    helper.smallBottomAlertRestore();
                    app.idle = true;            
                    setTimeout(function(){
                        helper.hideLoading();
                        console.log("hideLoading");
                    }, 1500);
                })  
                .fail(function() {                      
            
                    helper.smallBottomAlert("Falló conexión!");
                    app.idle = true;
                    helper.hideLoading();
                })
              }else{
                helper.smallBottomAlert("Nada nuevo!");
                app.idle = true;
                helper.hideLoading();
              }
            })
            .fail(function() {                                  
                helper.smallBottomAlert("Falló conexión!");
                app.idle = true;
                helper.hideLoading();
            })
            
        })
        .fail(function() {                      
                helper.hideLoading();    
                helper.smallBottomAlert("Falló conexión!");
                app.idle = true;
            })
    },
    
    
   
    
    // Called when app received a push notification regarding an alert    
    goPushNotificationAlert: function(idalert) {        
        var that = app.homeView;
        app.idle = false;       
        
        // NEED TO CONSIDER WHEN THE ALERT IS NOT FROM MY DEPARTMENT, BUT I REPORTED IT...
                
        helper.pleaseWait();            
        that.updateAlerts()        
        .done(function() {            
            that.refreshData(true)
            .done(function() {
                app.idle = true;
                helper.hideLoading();
                that.openAlert(idalert);
            })
        })   
    },

     goPushNotificationTask: function(idalert) {        
        var that = app.homeView;
        app.idle = false;       
        
       
        // NEED TO CONSIDER WHEN THE ALERT IS NOT FROM MY DEPARTMENT, BUT I REPORTED IT...
                
        helper.pleaseWait();            
        that.updateAlerts()        
        .done(function() {            
            that.refreshData(true)
            .done(function() {
                app.idle = true;
                helper.hideLoading();                 
                that.openTask(idalert);
            })
        })   
    },
    
    openAlert: function(idalert) {        
        var that = app.homeView;
      
        that.set('fromSlider',false);
        $smart.getAlert(idalert)
        .done(function(_alert) {                     
            if (_alert === null) return;
            that.isAlert = true;            
            that.prepareAlertInfo(_alert)
            .done(function() {
                if (helper.isWorker())            
                    app.mobileApp.navigate('components/homeView/viewAlertMaid.html');  
                 else
                     app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');                
                })        
                
            });        
    },
    
    openTask: function(idalert) {        
        var that = app.homeView;
        
        console.info('IDTASK',idalert);
        
        $smart.getAlert(idalert)
        .done(function(_alert) {
            console.info('OPEN TASK', _alert);
            console.info(_alert);
            if (_alert === null) return;
            that.isAlert = false;            
            that.prepareAlertInfo(_alert)
            .done(function() {
                if (helper.isWorker())            
                    app.mobileApp.navigate('components/homeView/viewAlertMaid.html');  
                 else
                     app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');                
                })        
                
            });        
    },
    
    
    pullToRefreshStaff: function(e) {
        $smart.updateStaff()
        .done(function(haschanges) {
            $smart.getStaff()
            .done(function(staff) {
                staff.fetch(function()  {
                    
                })
            })
        })             
    },
    
    
    pullToRefreshTaskTypes: function(e) {
        
        $smart.updateTaskTypes()
        .done(function(hasChanges) {            
            if (hasChanges) {
                 $smart.getTaskTypes() 
                .done(function(tasktypes) {                          
                    tasktypes.fetch(function() {
                        app.homeView.set('taskTypesDataSource', tasktypes);                     
                    })
                })            
            }            
        })        
    },
    
    
    
    
        
    updateAlerts: function() {        
        var deferred = $.Deferred();                        
        var that = app.homeView;
                                       
        $smart.updateAlerts()
        .done(function(hasChanges) {                          
            if (hasChanges){
                app.sounds.snap.play();  // play bell sound                                                                                
                that.refreshAlerts()
                .done(function() {                            
                    deferred.resolve(hasChanges);                
                }).fail(function(error){deferred.reject(error);});
            }else{
              deferred.resolve(hasChanges);
            }
        })
        .fail(function(error) {
           deferred.reject(error); 
        });
        return deferred.promise();
    },
    
    
    reloadAlerts: function(count) {
        var deferred = $.Deferred();
        
        if (count == 0) {
            deferred.resolve();                        
        }
        else {
            console.info('Reloading alerts!');
            app.homeView.refreshAlerts()
            .done(function() {            
                app.homeView.refreshData(true)
                .done(function() {
                    deferred.resolve();
                })
                
            })
            .fail(function() {
                deferred.resolve();
            })
            
        }
        return deferred.promise();
       
    },
    
    
    // Refreshes the Alerts ListView by refreshing from local DataSource...Does not check BE....=> updateAlerts does
    // This is called after starting or finishing an alert...
    // Refreshes alerts (+ tasks)
    refreshAlerts: function() {
        var deferred = $.Deferred();        
        var that = app.homeView;   
        
       
        
        $smart.getAlerts(true) // today Alerts only + those not resolved yet
        .done(function(alerts) {                          
            alerts.fetch(function()  {          
               
                that.set('alertsDataSource',alerts);    
                
                that.fixScrollIssue();
                
                that.groupDataSource(alerts);  // only if housekeeper or maintenance
                that.updateOrphanAlertsDataSource(alerts);                      
                
                $smart.getTasks(true)
                .done(function(tasks) {
                    
                    
                    
                    that.set('tasksDataSource',tasks);
                    
                    if (app.user.role === globals.ROLE_OPERATIONS) {                    
                        that.getHousekeeperAlerts(); 
                        //that.getHousekeeperTasks(); 
                    }
                    else if (app.user.role === globals.ROLE_HOUSEKEEPER) { //|| app.user.role == globals.ROLE_MAID) {                    
                        that.getMaintenanceAlerts();
                        //that.getCleaningTasks();
                    }
                    
                    if (app.user.role == globals.ROLE_MAID) {
                         that.getMaintenanceAlerts();
                    }
                    
                        
                    if (app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_MAID)
                      
                        that.getTeamWork(); // Includes tasks 
                      
                        
                    }).fail(function(error) { deferred.reject(error);});
                
                
                deferred.resolve();
            })            
        })                
        return deferred.promise();
    },
    
    
    scrollTopWithFix: function() {
        
        var scroller = app.homeView.myscroller;
        var touches = scroller.userEvents.touches;
        var dummyEvent = { event: { preventDefault: $.noop } };
        
        var scrollTop = window.scrollTop;

       for (var i = 0; i < touches.length; i ++) {
           touches[i].end(dummyEvent);
       }

        scroller.animatedScrollTo(0, 0);
         scroller.reset();
        
    },
    
    
    fixScrollIssue: function() {
        // FIX SCROLL ISSUE
        //    Please Refer: http://www.telerik.com/forums/scrolling-stops-working-when-setting-data-source
        // Sin este código de abajo, se pega la pantalla si el usuario estaba haciendo scroll en el momento..
        
        var scroller = app.homeView.myscroller;
        var touches = scroller.userEvents.touches;
        var dummyEvent = { event: { preventDefault: $.noop } };
        
        var scrollTop = window.scrollTop;

       for (var i = 0; i < touches.length; i ++) {
           touches[i].end(dummyEvent);
       }

       scroller.reset();
        
        
        
         if (typeof scrollTop != 'undefined') {
             //console.info('scrollTop');
            // console.info(scrollTop);
             scroller.animatedScrollTo(0, -1* scrollTop);
             
         }
                
       // END FIX SCROLL ISSUE
    },
    
    
     getCleaningTasks: function() {
        var that = app.homeView;
        //if (app.user.role !== globals.ROLE_HOUSEKEEPER && app.user.role !== globals.ROLE_MAID ) return;
        
        console.info('Get Cleaning Tasks!!');
        
        $smart.getCleaningTasks()
        .done(function(tasks) {
            tasks.fetch(function() {
                console.info(tasks);
                that.set('cleaningTasksDataSource', tasks)                
            })            
        })
    },
    
    
    
    // Alertas reportadas a otro módulo. Aplica solo a housekeeper 
    // CHANGED: now brings any current maintenance alert
    getMaintenanceAlerts: function() {
        var that = app.homeView;
        if (app.user.role !== globals.ROLE_HOUSEKEEPER && app.user.role !== globals.ROLE_MAID ) return;
        
        console.info('Get Maintenance Alerts!!');
        
        $smart.getMaintenanceAlerts()
        .done(function(alerts) {
            alerts.fetch(function() {
                console.info(alerts);
                that.set('maintenanceAlertsDataSource', alerts)                
            })            
        }).fail(function(error) { deferred.reject(error);});
    },
    
    //Aplica solo a maintenance
    getTeamWork: function() {
        var that = app.homeView;
        //if (app.user.role !== globals.ROLE_MAINTENANCE) return;
        
        $smart.getTeamAlerts()
        .done(function(teamAlerts) {
            teamAlerts.fetch(function() {
                that.set('teamAlertsDataSource', teamAlerts);
              
                $smart.getTeamTasks()
                .done(function(teamTasks) {
                    teamAlerts.fetch(function() {
                    that.set('teamTasksDataSource', teamTasks);                    
                    })
                    
                })
            })            
        })        
    },
    
     
    //Aplica solo a rol operaciones
    getHousekeeperAlerts: function() {
         var that = app.homeView;
        if (app.user.role !== globals.ROLE_OPERATIONS) return;
        
        $smart.getHousekeeperAlerts()
        .done(function(housekeeperAlerts) {
            housekeeperAlerts.fetch(function() {
                that.set('housekeeperAlertsDataSource', housekeeperAlerts)                
            })            
        })        
    },
    
    
    getHousekeeperTasks: function() {
         var that = app.homeView;
        if (app.user.role !== globals.ROLE_OPERATIONS) return;
        
        $smart.getHousekeeperTasks()
        .done(function(housekeeperTasks) {
            housekeeperTasks.fetch(function() {
                that.set('housekeeperTasksDataSource', housekeeperTasks)                
            })            
        }).fail(function(error) { deferred.reject(error);});       
    },
    
    
     // Refreshes the Tasks ListView by refreshing from local DataSource...Does not check BE....=> updateTasks does
    // This is called after starting or finishing a task...
     refreshTasks: function() {
       var deferred = $.Deferred();        
        var that = app.homeView;                
        $smart.getTasks(true)
        .done(function(tasks) {                                            
            tasks.fetch(function()  {                   
                that.set('tasksDataSource',tasks);                                               
                that.groupDataSource(tasks);                
                that.updateOrphanTasksDataSource(tasks);    
                
                /*if (app.user.role === globals.ROLE_OPERATIONS)                     
                    that.getHousekeeperTasks(); 
                */
                
                deferred.resolve();
            })            
        })                
        return deferred.promise();    
    },
    
    
    
    
    
    // Update the datasource for alerts were idstaff = 0 (orphan)
    updateOrphanAlertsDataSource: function(alerts) {              
        
        var filter = JSON.parse(JSON.stringify(alerts.filter()));  // CLONE
        //var filter = alerts.filter();
        filter.filters.push({field: "idstaff", operator: "equals", value: 0});
        filter.filters.push({field: "idcategory", operator: "neq", value: globals.ALERT_CATEGORY_LOSTANDFOUND });
        var orphans = new kendo.data.DataSource({
                    data : alerts.data(), 
                    sort: alerts.sort(),
                    filter: filter
        });        
        orphans.fetch(function() {
            app.homeView.set('orphanAlertsDataSource',orphans);
        })
        
    },
    
    
    
    updateTasks: function() {        
        var deferred = $.Deferred();                        
        var that = app.homeView;        
        
        $smart.updateTasks()
        .done(function(hasChanges) {                          
            if (hasChanges) app.sounds.snap.play();  
            that.refreshTasks()
            .done(function() {      
                deferred.resolve();                
            })                        
        })           
        return deferred.promise();
        
    },
    
    
   
    
    
  
    
    updateOrphanTasksDataSource: function(tasks) {        
        var filter = JSON.parse(JSON.stringify(tasks.filter()));  // CLONE
        filter.filters.push({field: "idstaff", operator: "equals", value: 0});
        var orphans = new kendo.data.DataSource({
                    data : tasks.data(), 
                    sort: tasks.sort(),
                    filter: filter
        });        
        orphans.fetch(function() {
            app.homeView.set('orphanTasksDataSource',orphans);
        })
        
    },
    
    
    
    
  
    
    // We group alerts/tasks depending on the role. For maid/maintenance, we do not group
    groupDataSource: function(ds) {
         app.homeView.filterBy = "idstatus";
        /*
        if (app.user.role == globals.ROLE_HOUSEKEEPER) {
            app.homeView.filterBy = "idstaff";
            ds.group({field: "idstaff"}); 
            return;
        }*/
        
        if (app.user.role !== globals.ROLE_HOUSEKEEPER && app.user.role !== globals.ROLE_MAINTENANCECHIEF && app.user.role !== globals.ROLE_OPERATIONS) return;
        if (app.user.filterpreferences === null) app.user.filterpreferences = {grouping: true};
        if (app.user.filterpreferences.grouping)
            ds.group({field: "idstatus"});                                                         
        else
            ds.group([]);                                                         
    },
    
    
    
    openAlertMaid: function(e) {   
        console.info('openAlert');
      // window.prevent = true;
        e.preventDefault();
      //  if (window.atender == true) {window.atender = false; return;} 
        
        
        app.homeView.isAlert = true;
        app.homeView.prepareAlertInfo(e.dataItem)
        .done(function() {
            app.mobileApp.navigate('components/homeView/viewAlertMaid.html');    
        })        
    },
    
    openTaskMaid: function(e) {        
        e.preventDefault();
        app.homeView.isAlert = false;
        app.homeView.prepareTaskInfo(e.dataItem)
        .done(function() {
            app.mobileApp.navigate('components/homeView/viewTaskMaid.html');    
        })
        
    },
    
    
    openAlertFromSlider: function(e, idalert,uuid) {
        var that = app.homeView;  
          $smart.findAlert(idalert,uuid)
          .done(function(alert) {              
              that.set('alert',alert);
              e.dataItem = alert;
              
              if (app.user.role == globals.ROLE_MAINTENANCE || app.user.role == globals.ROLE_MAID)
                  that.openAlertMaid(e);
              else
                  that.openAlertHousekeeper(e);
          })                                 
    },
    
    
    
    openAlertHousekeeper: function(e) {             
        e.preventDefault();       
        
        //app.homeView.isAlert = true;
        app.homeView.set('isNotReadOnly',true);
        console.info(e);
        console.info(e.dataItem);
        app.homeView.prepareAlertInfo(e.dataItem)
        .done(function() {
            app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');    
        })        
    },
    

    
    openAlertReadOnly: function(e) {
        e.preventDefault();
                
        
        if (app.user.role == globals.ROLE_HOUSEKEEPER && e.dataItem.byhousekeeper == 1)
            app.homeView.set('isNotReadOnly',true);    
        else
            app.homeView.set('isNotReadOnly',false);
        app.homeView.isAlert = true;
        app.homeView.prepareAlertInfo(e.dataItem)
        .done(function() {
            app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');    
        }) 
    },
   
    
   
    
    searchAlert: function(idalert) {                
        var deferred = $.Deferred();        
        $smart.getAlerts(true)
        .done(function(ds) {
            ds.fetch(function() {
                var view = ds.view();                        
                for (var i = 0; i < view.length; i++) {                                    
                    // No PONER ===...NO SIRVE
                    if (view[i].idalert == idalert) { 
                        deferred.resolve(view[i]); 
                        break;
                    }
                }
                deferred.resolve(null);
            })
            
        })                
        return deferred.promise();
    },
    
    searchTask: function(idalert) {                
        var deferred = $.Deferred();        
        $smart.getTasks(true)
        .done(function(ds) {
            
            ds.fetch(function() {
                var view = ds.view();       
              
                for (var i = 0; i < view.length; i++) {                         
                    // No PONER ===...NO SIRVE
                    if (view[i].idalert == idalert) { 
                        deferred.resolve(view[i]); 
                        break;
                    }
                }
                deferred.resolve(null);
            })
            
        })                
        return deferred.promise();
    },
        
        
    
   /* searchTask: function(idtask) {        
        var ds = app.homeView.get('orphanTasksDataSource');
        var view = ds.view();
        for (var i = 0; i < view.length; i++) {                
            if (view[i].idtask === idtask) return view[i];
        }
        return null;
    },
    */
    
    
    openTaskHousekeeper: function(e) {      
        e.preventDefault();
        app.homeView.isAlert = false;        
        app.homeView.prepareTaskInfo(e.dataItem)
        .done(function() {
            app.mobileApp.navigate('components/homeView/viewTaskHousekeeper.html');            
        })        
    },
    
    prepareTaskInfo: function(data) {
        var deferred = $.Deferred();
        var that = app.homeView;
                
        that.set('task', data);
        that.set('task.isOrphan', data.idstaff === 0);
        that.set('task.isMine', data.idstaff === app.user.idstaff);
        that.set('task.dnd', data.tag === 1);
        that.set('task.markedAsFinished', data.tag === 2);
        that.set('task.confirm', false);           
        
        that.set('task.alreadyDone', data.action === globals.ACTION_TASK_ALREADY_DONE);
        that.set('task.isCleaningTask', data.iscleaningtask == 1);
        
        
        if (data.guest == '') {data.guest = null;}
        
        that.set('task.hasguest', data.guest !== null);        
        
        that.set('task.hasnotes', data.instructions !== null && data.instructions !== '');
                      
        that.set('task.facility', helper.getFacilityAndZones(data.idfacility));        
        that.set('task.facilitytype', helper.getFacilityTypeName(data.idfacility));        
        that.set('task.staffFullname', helper.getStaffFullName(data.idstaff));        
        that.set('task.staffAvatar', helper.getStaffAvatar(data.idstaff));               
        that.set('task.staffRole', helper.getStaffRole(data.idstaff));
        that.set('task.createdByFullName', helper.getStaffFullName(data.createdby));        
        
        
        that.set('task.typename', helper.getTaskTypeName(data.idtype));
        that.set('task.priority', helper.getPriorityName(data.idpriority));                
        if (that.get('task.instructions') === null) that.set('task.instructions','');
        
        that.set('task.hasstarttime', data.hasstarttime ==  1);
        
        
        if (data.hasstarttime == 1) { // has start time 
            that.set('task.startdateDisplay',$date.datef(data.start, "h:mm a"));           
            that.set('task.startdatefullDisplay',$date.datef(data.start, "DD MMMM, YYYY", true));
        }
        else {
            that.set('task.startdateDisplay',$date.datef(data.start,'DD  MMM',true));           
            that.set('task.startdatefullDisplay',$date.datef(data.start,'DD  MMM',true));
        }
        
        
        
        
        that.set('task.enddateDisplay',$date.datef(data.end, "h:mm a"));        
        
        that.set('task.durationtext', helper.formatDuration(data.duration));
        
        that.set('task.createddateDisplay', $date.datef(data.createddate, "DD MMMM, YYYY", true));
        
        that.set('task.createdtimeDisplay', $date.datef(data.createddate, "h:mm a"));        
        
        that.expectedDurationElements(data.expectedduration);
        
        //that.set('task.chronometerMins', data.expectedduration);
        //that.set('task.chronometerSecs', '00');
        
        that.refreshStatusElementsTask(data.idstatus);  
        
        that.getActionLog(globals.IS_TASK)
        .done(function() {                         
            deferred.resolve();
        })    
        
        deferred.resolve();
       
        
        return deferred.promise();
    },
    
    
    
    prepareAlertInfo: function(data) {
        var deferred = $.Deferred();        
        var that = app.homeView;        
        
        // clean chronometer interval
        if (app.homeView.chronometer !== null) clearInterval(app.homeView.chronometer);
       //console.info('HOLA');
        
        that.set('alert', data);
        that.set('alert.isTask', data.idcategory == globals.IS_TASK);
         that.set('alert.isAlert', data.idcategory == globals.IS_ALERT);
        
        that.set('alert.isOrphan', data.idstaff === 0);        
        that.set('alert.isMine', data.idstaff === app.user.idstaff);        
        that.set('alert.isRequest', data.idtypecategory === globals.ALERT_CATEGORY_REQUEST);        
        
        that.set('alert.alertaTomada', data.tag === globals.TAG_TAKEN );        
        
        // Una alerta huérfana abierta en el módulo 1, tiene la opción de levantar la mano...
        that.set('alert.isOrphan', data.idstaff === 0);                
        
        if (data.guest == '') data.guest = null;
        that.set('alert.hasguest', data.guest !== null);        
        that.set('alert.dnd', data.tag === globals.TAG_DND );
        that.set('alert.markedAsFinished', data.tag === globals.TAG_MARKED_AS_FINISHED);
        that.set('alert.reportedDone', data.tag === globals.TAG_ALREADY_DONE);
        that.set('alert.taskCreated', data.tag === globals.TAG_ALERT_TO_TASK);
        that.set('alert.hasnotes', data.notes !== "");        
        //that.set('alert.confirm', false);   // When confirming an assignment              
        that.set('alert.delayed', false);
                
        that.set('alert.staffFullname', helper.getStaffFullName(data.idstaff));        
        
        that.set('alert.facility', helper.getFacilityAndZones(data.idfacility));                
        that.set('alert.facilitytype', helper.getFacilityTypeName(data.idfacility));        
        that.set('alert.isLodging', helper.getFacilityLodging(data.idfacility));        
        
        
        that.set('alert.staffAvatar', helper.getStaffAvatar(data.idstaff));               

        that.set('alert.staffRole', helper.getStaffRole(data.idstaff));
        
        that.set('alert.reportedByFullName', helper.getStaffFullName(data.reportedby));        
                
        var alertType = helper.getAlertType(data.idtype);
       
        that.set('alert.typename', alertType.name);
        that.set('alert.requiressolutiontext', alertType.requiressolutiontext);
                
        
        //that.set('alert.priority', helper.getPriorityName(data.idpriority));                
        if (that.get('alert.notes') === null) that.set('alert.notes','');
        
        
        that.set('alert.reporteddateDisplay', $date.datef(data.reporteddate, "DD MMMM, YYYY", true));        
        that.set('alert.reportedtimeDisplay', $date.datef(data.reporteddate, "h:mm a"));        
        that.set('alert.expectedfinishTime',  $date.toCurrentTimeZone(data.reporteddate).add(data.expectedduration,'minutes').format("h:mm a"));
        
        if (data.idcategory == globals.IS_TASK) {            
            that.set('alert.startdateDisplay', $date.datef(data.startdate, "h:mm a"));       
            that.set('alert.finishdateDisplay', $date.datef(data.finishdate, "h:mm a"));       
            
        }
        
        that.set('alert.finishDateDisplay', $date.datef(data.finishdate, "DD/MM h:mm a"));        
        
        
       /*
        if (data.idcategory == globals.IS_TASK) {
            console.info('DIFF');
            console.info(moment(data.finishdate).diff(data.startdate,'minutes'));
            data.expectedduration = moment(data.finishdate).diff(data.startdate,'minutes');
        }
        */
        
        that.expectedDurationElements(data.expectedduration);
        
        that.set('alert.willcheckminutes', 0);
        that.set('alert.willcheckhours', 0);
        
        
        /*that.set('alert.chronometerMins', data.expectedduration);
        that.set('alert.chronometerSecs', '00'); */
        
        that.set('alert.durationtext', helper.formatDuration(data.duration));
        
        
        // refresh Status Elements...    
        that.refreshStatusElements(data.idstatus);  
        
        that.getActionLog(globals.IS_ALERT)
        .done(function() {                         
            deferred.resolve();
        })    
        
        return deferred.promise();
    },
    
    
    
    
    
    expectedDurationElements: function(expectedduration) {
        var that = app.homeView;    
        
        console.info('Expectedduration' , expectedduration);
        
        if (expectedduration < 60) {
           
                that.set('alert.isLong', false);
                that.set('alert.hours', 0);
                that.set('alert.minutes', expectedduration);
           
        }
        else {            
           
                that.set('alert.isLong', true);   
                that.set('alert.hours', Math.floor(expectedduration / 60));
                that.set('alert.minutes', expectedduration % 60);       
                  
        }        
    },
    
    
    
    // Refreshes the Status + Icon on the Alert View
    refreshStatusElements: function(idstatus) {
        var that = app.homeView;    
        that.set('alert.idstatus', idstatus);
        // Show/Hide status icons accordingly
        that.set('alert.pending', idstatus === globals.ALERT_STATUS_PENDING );
        that.set('alert.inprogress', idstatus === globals.ALERT_STATUS_IN_PROGRESS );
        that.set('alert.resolved', idstatus === globals.ALERT_STATUS_RESOLVED );                        
        that.set('alert.paused', idstatus === globals.ALERT_STATUS_PAUSED );                        
        that.set('alert.status',helper.getAlertStatusName(idstatus));             
               
        
        that.styleAlertMaid(idstatus);
        that.styleAlertBorderMaid();
        
    },
    
    refreshStatusElementsTask: function(idstatus) {
        var that = app.homeView;    
        that.set('task.idstatus', idstatus);
        // Show/Hide status icons accordingly
        that.set('task.notstarted', idstatus === globals.TASK_STATUS_NOT_STARTED );
        that.set('task.inprogress', idstatus === globals.TASK_STATUS_IN_PROGRESS );
        that.set('task.finished', idstatus === globals.TASK_STATUS_FINISHED );                
        that.set('task.paused', idstatus === globals.TASK_STATUS_PAUSED );                
        that.set('task.status',helper.getTaskStatusName(idstatus));             
        
          that.styleTaskMaid(idstatus);
    },
    
    
    

    
    // Informs the person who created the alert that it was received...by a chief of the respective module
    pingReceived: function() {        
        var that = app.homeView;
                
        // if opened by manager, do not ping as received
        if (app.user.role === globals.ROLE_MANAGER) return;        
        
        var _alert = that.get('alert');        
        if (_alert.action >= globals.ACTION_RECEIVED_BY_MODULE) return; // already pinged
                
        $smart.pingReceived(_alert)
        .done(function() {
           // $("#spinner" + _alert.idalert).show();
            that.set('alert.action', globals.ACTION_RECEIVED_BY_MODULE); // ..to avoid pinging again if assigning staff
             //$smart.syncAlertsNOW();       
             that.refreshAlerts();
           /* $smart.getAlerts(true) 
            .done(function(alerts) {                          
                alerts.fetch(function()  {                
                    that.set('alertsDataSource',alerts);                                               
                    that.groupDataSource(alerts);  
                    
                })
            }) */
        })
    },
    
    
    pingReceivedByOwner: function() {
        var that = app.homeView;
                        
        var _alert = that.get('alert');                
        
        if (_alert.action >= globals.ACTION_RECEIVED_BY_OWNER) return; // already pinged
                        
        $smart.pingReceivedByOwner(_alert)
        .done(function() {
           
        })                
    },
    
     pingReceivedTaskByOwner: function() {
        var that = app.homeView;
                        
        var task = that.get('task');                
        
        if (task.action >= globals.ACTION_RECEIVED_BY_OWNER) return; // already pinged
                        
        $smart.pingReceivedTaskByOwner(that.get('task.idtask'))
        .done(function() {
            that.set('task.action', globals.ACTION_RECEIVED_BY_OWNER); // ..to avoid pinging again 
            helper.sendPushNotificationTask(that.get('task'), globals.PN_TASK_RECEIVED_BY_OWNER);            
            
            // Refresh Tasks
            $smart.getTasks(true) // today Alerts only + those not resolved yet
            .done(function(tasks) {                          
                tasks.fetch(function()  {                
                    that.set('tasksDataSource',tasks);                                               
                    that.groupDataSource(tasks);  // only if housekeeper or maintenance                                
                })
            })
        })
    },
    
    
    showChronometer: function() {
        if (helper.isTablet())
           app.mobileApp.navigate('components/homeView/chronometer.html');                                
    },  
    
    
    beforeShowChronometer: function() {
        var that = app.homeView;
        that.set('alert.progresspercentage',0);
        that.set('estimate',{minutes: 0, hours: 0});
         $('.radial-progress').attr('data-progress',0);
        
        
        
        
        if (helper.estimateDurationInterval !== null) clearInterval(helper.estimateDurationInterval);
        that.updateElapsedAndRemainingTimeAlert();
        helper.estimateDurationInterval = setInterval(function(){that.updateChronometer()},1000);                  
        
    },
    
    updateChronometer: function() {
        var that = app.homeView;
        that.updateElapsedAndRemainingTimeAlert();
        
        var alert = that.get('alert');
        var percentage = alert.progresspercentage;
        
        that.set('alert.progresspercentage',alert.progresspercentage + "%");
        
        console.info(percentage);
        
        $('.radial-progress').attr('data-progress',percentage);
        
        
        
    },

    
    
    /****************
      SEND COMMENT
    *****************/
    
    
    
    sendCommentAlert: function(comment, picture) {        
        var that = app.homeView;        
        helper.showLoading('Creando Comentario!');        
        
        var _alert = that.get('alert');
        $smart.createComment(_alert, app.user.idstaff, comment, picture)
        .done(function() {                                                 
            that.getActionLog()
            .done(function() {
                helper.hideLoading();                          
                $smart.syncActionLogNOW();
            })
                // Hay 3 personas involucradas, (la persona que lo reportó, el que asigna la alerta y a quién se la asignaron
                // Por el momento, vamos a involucrar al que la asigna (ama de llaves o jefe de mante) y al que realiza la alerta (mucama, mante)
                //
                
                // Si soy la persona a la cual le asignaron la tarea, envío mensaje al manager..
                // Si soy el manager, le envío el mensaje al encargado de la alerta (alert.idstaff)
                // Si el alert.idstaff es vacío, no se ha asignado.
                
                //TODO: Se va a pasar al BE..
                /*if (_alert.idstaff === 0 || _alert.idstaff === null) return;
                helper.sendPushNotificationAlert(_alert, globals.PN_ALERT_COMMENT, comment);*/
           
        })
        .fail(function() {
            helper.hideLoading();
        })
        
        
    },
    
    sendCommentAlertOLD: function(comment) {
        var that = app.homeView;        
        helper.showLoading('Enviando Comentario!');        
        
        var _alert = that.get('alert');
        $smart.sendComment(globals.IS_ALERT,_alert.idalert, app.user.idstaff, comment)
        .done(function(actionLogDataSource) {                                     
            actionLogDataSource.fetch(function() {                
                app.homeView.set('actionLogDataSource', actionLogDataSource);                     
                helper.hideLoading();
                app.sounds.snap.play();  
                
                // Hay 3 personas involucradas, (la persona que lo reportó, el que asigna la alerta y a quién se la asignaron
                // Por el momento, vamos a involucrar al que la asigna (ama de llaves o jefe de mante) y al que realiza la alerta (mucama, mante)
                //
                
                // Si soy la persona a la cual le asignaron la tarea, envío mensaje al manager..
                // Si soy el manager, le envío el mensaje al encargado de la alerta (alert.idstaff)
                // Si el alert.idstaff es vacío, no se ha asignado.
                if (_alert.idstaff === 0 || _alert.idstaff === null) return;
                helper.sendPushNotificationAlert(_alert, globals.PN_ALERT_COMMENT, comment);
            })
        })
        .fail(function() {
            helper.hideLoading();
        })
    },
    
    
    
     sendCommentTask: function(comment) {
         var that = app.homeView;
         
         helper.showLoading('Enviando Comentario!');                
         var task = that.get('task');         
         $smart.sendComment(globals.IS_TASK, task.idtask, app.user.idstaff, comment)
        .done(function(actionLogDataSource) {                     
            actionLogDataSource.fetch(function() {                
                app.homeView.set('actionLogDataSource', actionLogDataSource);             
                helper.hideLoading();
                app.sounds.snap.play();  
                
                // Hay 3 personas involucradas, (la persona que lo reportó, el que asigna la alerta y a quién se la asignaron
                // Por el momento, vamos a involucrar al que la asigna (ama de llaves o jefe de mante) y al que realiza la alerta (mucama, mante)
                //
                
                // Si soy la persona a la cual le asignaron la tarea, envío mensaje al manager..
                // Si soy el manager, le envío el mensaje al encargado de la alerta (alert.idstaff)
                // Si el alert.idstaff es vacío, no se ha asignado.
                if (task.idstaff === 0 || task.idstaff === null) return;                
                var customdata = {type: globals.IS_TASK, idalert: task.idtask, sound: globals.SOUND_OTHER };            
                if (app.user.idstaff === task.idstaff) {                                    
                    var module = task.idmodule;              
                    var chiefs      = helper.getModuleChiefs(module);
                    for (var j=0;j<chiefs.length; j++)
                        $smart.sendPushNotification(app.user.fullname, chiefs[j], comment, customdata);                                
                }
                else {
                    $smart.sendPushNotification(app.user.fullname,task.idstaff, comment, customdata);                                
                }
                
            })
        })
        .fail(function() {
            helper.hideLoading();
        })
    },
    
    
    /******************
       START ALERT
    ******************/
    
    
    startChronometerAlert: function() {
        app.homeView.stopChronometerAlert();
        if (app.homeView.get('runChronometer') === true)
            app.homeView.chronometerAlert = setInterval(function() { app.homeView.runChronometerAlert()}, 1000);
    },
    
     startChronometerTask: function() {
        app.homeView.stopChronometerTask();
        if (app.homeView.get('runChronometer') === true)
            app.homeView.chronometerTask = setInterval(function() { app.homeView.runChronometerTask()}, 1000);
    },
    
    
    stopChronometerAlert: function() {
        if (app.homeView.chronometerAlert !== null) clearInterval(app.homeView.chronometerAlert);                
    },
    
    stopChronometerTask: function() {
        if (app.homeView.chronometerTask !== null) clearInterval(app.homeView.chronometerTask);                
    },
        
    
    runChronometerAlert: function() {
        var that = app.homeView;        
        var alert = that.get('alert');
                
        
        var started  = alert.startdatelocal; //moment(alert.startdate).add(moment().utcOffset(),'minutes');   // Started is in UTC format..
        var now      = moment(); 
                
        var timeElapsed = now.diff(started,'s');  // - (started.utcOffset() * 60) ;                        
        var timer       = alert.expectedduration * 60 - timeElapsed;
        
        var mins = Math.floor(timer/60);
        var secs = timer % 60;
        
        if (secs < 10) { secs = '0' + secs}
        if (secs === 60) { secs = '00'}        
                        
        // Revisar si hay retraso....
        if (mins < 0) {
            mins = mins * -1;
            that.set('alert.delayed', true);               
            if (mins <  60) {
               this.set('alert.chronometerHoursDelayed', "0");
               this.set('alert.chronometerMinsDelayed', mins);    
            }
            else {                
               this.set('alert.chronometerHoursDelayed', Math.round(mins  / 60 ));
                
               if (mins < 10 && mins > 0) { mins = '0' + mins}
               this.set('alert.chronometerMinsDelayed', mins % 60);    
            }
        }
        else {        
        
            this.set('alert.chronometerMins', mins);
            this.set('alert.chronometerSecs', secs);
        
          }
    },
    
    
     runChronometerTask: function() {
        var that = app.homeView;        
        var task = that.get('task');                
        
        var started  = task.startedlocal; 
        var now      = moment(); 
        
        
        var timeElapsed = now.diff(started,'s');  // - (started.utcOffset() * 60) ;                        
        var timer       = task.expectedduration * 60 - timeElapsed;
        
        
        var mins = Math.floor(timer/60);
        var secs = timer % 60;
        
        if (secs < 10) { secs = '0' + secs}
        if (secs === 60) { secs = '00'}        
                
        
        // Revisar si hay retraso....
        if (mins < 0) {
            mins = mins * -1;
            that.set('task.delayed', true);               
            if (mins <  60) {
               this.set('task.chronometerHoursDelayed', "0");
               this.set('task.chronometerMinsDelayed', mins);    
            }
            else {                
               this.set('task.chronometerHoursDelayed', Math.round(mins  / 60 ));
                
               if (mins < 10 && mins > 0) { mins = '0' + mins}
               this.set('task.chronometerMinsDelayed', mins % 60);    
            }
        }
        else {                
            this.set('task.chronometerMins', mins);
            this.set('task.chronometerSecs', secs);
        
          }
    },
    
    
    
    
    startTask: function() {            
        var that = app.homeView;                
        helper.showLoading("Comenzando Tarea!");        
        $smart.startTask(that.get('task.idtask'))
        .done(function(result, actionlog){  // success                         
            that.set('task.started', result.started);                    
            that.set('task.startedlocal', result.startedlocal);                                                        
            that.taskActionSuccess(globals.TASK_STATUS_IN_PROGRESS, actionlog);                                                          
            helper.sendPushNotificationTask(that.get('task'),globals.PN_TASK_STARTED);            
            helper.hideLoading();                
        })
        .fail(function(error) {
            that.taskActionFail(error);
        })   
    },
    
    
     finishTask: function() {
        var that = app.homeView;      
        helper.showLoading("Finalizando Tarea!");        
        //app.homeView.stopChronometerTask();
        $smart.finishTask(that.get('task.idtask'))
        .done(function(result, actionlog){  // success
            that.set('task.durationtext', helper.formatDuration(result.duration));                        
            that.taskActionSuccess(globals.TASK_STATUS_FINISHED, actionlog);                                  
            helper.sendPushNotificationTask(that.get('task'),globals.PN_TASK_FINISHED);
            helper.hideLoading();                
            //app.mobileApp.navigate('components/homeView/finishTaskMessage.html');                
            if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)
                app.mobileApp.navigate('components/homeView/finishTaskMessage.html');                
            else
                that.goBackNoTransition();
        })
        .fail(function(error) {
            that.taskActionFail(error);
        })
        
    },
    
    
    
  /********* ALERTS ******/
    
    
    /*
        1. Starts Alerts LOCALLY   
        If called from slider, the idalert is sent...else...not used
    
    */
    startAlert: function() {
        var that = app.homeView;                        
        var alert = that.get('alert');                      
      
            helper.showLoading('Comenzando alerta!');
             $smart.startAlert(alert)
            .done(function(startdate){  
                that.set('alert.startdate', startdate);
                app.user.currentactivityid = alert.idalert;
                app.user.currentactivity = alert;
                that.alertActionSuccess(globals.ALERT_STATUS_IN_PROGRESS, null); 
                                                
                    $smart.syncAlertsNOW();  
                /*that.getActionLog()
                .done(function() {
                    that.alertActionSuccess(globals.ALERT_STATUS_IN_PROGRESS, null); 
                    helper.hideLoading();                               
                    $smart.syncAlertsNOW();                
                }) */
            })
            .fail(function() {
                console.info('ERROR');
                helper.hideLoading();        
            })        
            
      
       
    },
    
    
     
    startAlertFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
         var that = app.homeView;  
        $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.showStartAlert();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
    
    
    
    pauseAndStartAlert: function(alertToPause) {
        var that = app.homeView;              
        var alert = that.get('alert');
        helper.showLoading("Pausando alerta!");                
        $smart.pauseAlert(alertToPause, 'Pausado por cambio de tarea...')
        .done(function(){  // success
             helper.hideLoading();                
               that.alertActionSuccess(globals.ALERT_STATUS_PAUSED, null);     
                that.startAlert();    
            // ????? that.set('alert.durationtext', helper.formatDuration(result.duration));
            /*that.getActionLog()
            .done(function() {
                that.alertActionSuccess(globals.ALERT_STATUS_PAUSED, null);                                              
                helper.hideLoading();                
                
                that.startAlert();                
                      
            })*/
            
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })        
    },
    
     pauseAndResumeAlert: function(alertToPause) {
        var that = app.homeView;              
        var alert = that.get('alert');
        helper.showLoading("Pausando alerta!");                
        $smart.pauseAlert(alertToPause, 'Pausado por cambio de tarea...')
        .done(function(){  // success
            helper.hideLoading();                                
            that.resumeAlert();       
            // ????? that.set('alert.durationtext', helper.formatDuration(result.duration));
            /*that.getActionLog()
            .done(function() {
                that.alertActionSuccess(globals.ALERT_STATUS_PAUSED, null);                                              
                helper.hideLoading();                                
                that.resumeAlert();                                      
            })*/            
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })        
    },
    
    
    
    finishAlert: function(solutiontext) {
        var that = app.homeView;              
        var alert = that.get('alert');
        
        helper.showLoading("Finalizando alerta!");                
        $smart.finishAlert(alert, solutiontext)
        .done(function(){  // success
            // ????? that.set('alert.durationtext', helper.formatDuration(result.duration));
            that.alertActionSuccess(globals.ALERT_STATUS_RESOLVED, null);
            
            if (!that.finishFromSlider) {
                if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)
                  //  app.mobileApp.navigate('components/homeView/finishAlertMessage.html'); 
                    that.goBackNoTransition();
                else 
                    that.goBackNoTransition();
            }
            
            that.finishFromSlider = false;
            $smart.syncAlertsNOW();                
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })                        
    },
    
        
    
    moveLast: function(idalert) {
        var that = this;
        helper.showLoading("Moviendo al final!");    
        
        $smart.getAlert(idalert)
        .done(function(alert) {
        
            $smart.moveLast(alert)
            .done(function(){  // success   
               that.refreshAlerts()
               .done(function() {  
                   that.refreshData(true);                                       
                   helper.hideLoading();
               })                                               
            })
            .fail(function(error) {
                that.alertActionFail(error);
            })    
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })  
    },
   
    
    
    pauseAlert: function(reason) {
        var that = app.homeView;              
        var alert = that.get('alert');
        helper.showLoading("Pausando alerta!");                
        $smart.pauseAlert(alert, reason)
        .done(function(){  // success
            // ????? that.set('alert.durationtext', helper.formatDuration(result.duration));
            that.alertActionSuccess(globals.ALERT_STATUS_PAUSED, null);                                              
            helper.hideLoading();                
            $smart.syncAlertsNOW();   
            /*that.getActionLog()
            .done(function() {
                that.alertActionSuccess(globals.ALERT_STATUS_PAUSED, null);                                              
                helper.hideLoading();                
                $smart.syncAlertsNOW();                
            })*/
            
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })        
        
        
        
    },
    
   
    
    
    // Only chiefs or managers can delete an alert.. 
    deleteAlert: function() {
        var that = app.homeView;                      
        helper.showLoading('Eliminando alerta!');        
        $smart.deleteAlert(that.get('alert'))
        .done(function() {
           // helper.sendPushNotificationAlert(that.get('alert'),globals.PN_ALERT_DELETED);            
            helper.hideLoading();
            that.refreshAlerts()                        
            .done(function() {
                app.homeView.refreshData(true);                
                /*if (app.user.role === globals.ROLE_MANAGER)
                    app.mobileApp.navigate('components/homeView/manager.html');        
                else
                    app.mobileApp.navigate('components/homeView/housekeeper.html');    */
                
                that.goBack();
                $smart.syncAlertsNOW();                
                })
        })
        .fail(function(error) {  
            that.alertActionFail(error);
        })
    },
    
    resumeAlert: function() {
        var that = app.homeView;              
        var alert = that.get('alert');
        helper.showLoading("Reanudando alerta!");                
        $smart.resumeAlert(alert)
        .done(function(){  // success
            // ????? that.set('alert.durationtext', helper.formatDuration(result.duration));
             helper.hideLoading();      
            that.alertActionSuccess(globals.ALERT_STATUS_IN_PROGRESS, null);     
                $smart.syncAlertsNOW();      
            /*
             that.getActionLog()
            .done(function() {
                that.alertActionSuccess(globals.ALERT_STATUS_IN_PROGRESS, null);                                              
                helper.hideLoading();                
                $smart.syncAlertsNOW();                
            })
            */
        })
        .fail(function(error) {
            that.alertActionFail(error);
        })        
        
        
        
    },
    
    
   
    
    uncheckAlertStars: function() {
        for(var i=1;i<=5;i++) {
            $('#star' + i).prop('checked',false);            
            $('#starmaid' + i).prop('checked',false);              
        }
    },
    
     uncheckTaskStars: function() {
        for(var i=1;i<=5;i++) {
            $('#startask' + i).prop('checked',false);            
            $('#startaskmaid' + i).prop('checked',false);              
        }
    },
    
    
    
    showAlertEvaluation: function() {
        var that = app.homeView;
       
        that.uncheckAlertStars();
        var rating = that.get('alert.evaluation');           

        if (rating === 0 || rating == null) return; 
        else {        
            $('#star' + rating).prop('checked',true);            
            $('#starmaid' + rating).prop('checked',true);        
        }
    },
    
    
     showTaskEvaluation: function() {
         var that = app.homeView;
       
        that.uncheckTaskStars();
        var rating = that.get('task.evaluation');           

        if (rating === 0 || rating == null) return; 
        else {        
            $('#startask' + rating).prop('checked',true);            
            $('#startaskmaid' + rating).prop('checked',true);        
        }
        
         
        /*var that = app.homeView;
        $('#startask5' ).prop('checked',false);
        $('#startaskmaid5' ).prop('checked',false);    
        var rating = that.get('task.evaluation');
        if (rating === 0 || rating === null) return;        
        if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAINTENANCECHIEF)        
            $('#startask' + rating).prop('checked',true);
        else
            $('#startaskmaid' + rating).prop('checked',true);
        */
    },
    
    
    
    evaluateAlert: function(rating) {
        
        var that = app.homeView;        
        //helper.showLoading('Evaluando!');        
        $smart.evaluateAlert(that.get('alert'), rating)
        .done(function(result){  // success            
            that.refreshAlerts()
            .done(function() {
                app.sounds.snap.play();   
                //helper.hideLoading();
                //helper.sendPushNotificationAlert(that.get('alert'), globals.PN_ALERT_EVALUATE, rating);                
            })
        }) 
        .fail(function(error) {            
            that.alertActionFail(error);            
        })           
    },
    
    
    evaluateTask: function(rating) {        
        var that = app.homeView;        
        helper.showLoading('Evaluando tarea!');                
        $smart.evaluateTask(that.get('task.idtask'), rating)
        .done(function(result){  // success            
            that.refreshTasks()
            .done(function() {
                app.sounds.snap.play();   
                helper.hideLoading();
            })
        }) 
        .fail(function(error) {            
            that.taskActionFail(error);            
        })           
    },
    
    
    // Called if starting, pausing, etc, failed...
    alertActionFail: function(error) {
        app.sounds.error.play();           
        helper.hideLoading();            
        if (error !== null) 
            $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + error);
        else
            $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + 'Algo salió mal. Intenta más tarde!');
    },
    
      taskActionFail: function(error) {
        app.sounds.error.play();           
        helper.hideLoading();            
        if (error !== null) 
            $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + error);
    },
    
    // Called after starting, pausing, finishing, etc...an alert
    alertActionSuccess: function(status, actionlog) {
        console.info('Action Success');
         var that = app.homeView;
        that.refreshAlerts()
                 .done(function() {
                     app.sounds.snap.play();   
                     that.refreshData(true);   
                     that.refreshStatusElements(status);                  
                     setTimeout(function(){ 
                         helper.hideLoading();
                     }, 1000);
                 })    
        /*
        
        var that = app.homeView;
        if (actionlog !== null) {
            actionlog.fetch(function() {                
                 app.homeView.set('actionLogDataSource', actionlog);                     
                 that.refreshAlerts()
                 .done(function() {
                     app.sounds.snap.play();   
                     that.refreshData(true);   
                     that.refreshStatusElements(status);                  
                     helper.hideLoading();
                 })            
             })                   
        }
        else {
            that.refreshAlerts()
                 .done(function() {
                     app.sounds.snap.play();   
                     that.refreshData(true);   
                     that.refreshStatusElements(status);                  
                     helper.hideLoading();
                 })            
        }
        
        */
    },
    
   
    
    // Called after starting, pausing, finishing, etc...a task
    taskActionSuccess: function(status, actionlog) {
        var that = app.homeView;
        if (actionlog !== null) {
            actionlog.fetch(function() {                
                 app.homeView.set('actionLogDataSource', actionlog);                     
                 that.refreshTasks()
                 .done(function() {
                     app.sounds.snap.play();   
                     that.refreshData(true);   
                     that.refreshStatusElementsTask(status);                  
                     helper.hideLoading();
                 })            
             })                   
        }
        else {
            that.refreshTasks()
            .done(function() {
                app.sounds.snap.play();   
                that.refreshData(true);   
                that.refreshStatusElementsTask(status);                  
                helper.hideLoading();
            })            
        }
        
    },
        
    
    
    
    
    
     pauseTask: function(reason) {
        var that = app.homeView;        
        helper.showLoading('Pausando tarea...');        
        $smart.pauseTask(that.get('task.idtask'), reason)
        .done(function(result,actionlog){  // success
            that.set('task.duration', result.duration);                    
            that.taskActionSuccess(globals.TASK_STATUS_PAUSED, actionlog);                                  
        }) 
        .fail(function(error) {
            that.taskActionFail(error);
        })       
    },
    
    
   
    
    
     resumeTask: function() {
        var that = app.homeView;        
        helper.showLoading('Reanudando tarea!');        
        $smart.resumeTask(that.get('task.idtask'))
        .done(function(result, actionlog){  // success
            that.set('task.resumedate', result.resumedate);                    
            that.taskActionSuccess(globals.TASK_STATUS_IN_PROGRESS, actionlog);                                              
        }) 
        .fail(function(error) {
            that.taskActionFail(error);           
        })                
    },
    
    
    
    markAlertAsFinishedFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
        var that = app.homeView;  
        
        helper.showDialogYN('¿Desea marcar Solicitud como finalizada?', 
            function() {
                $smart.findAlert(idalert,uuid)
                .done(function(alert) {
                    that.set('alert',alert);
                    that.markAlertAsFinished(true);
                    deferred.resolve();
                    
                })
                .fail(function() {deferred.resolve();})
            },
        false,
        function() { deferred.resolve()}
       );
        
        return deferred.promise();
    },
    
     showSettingsFromSlider: function(idalert,uuid) {
         var deferred = $.Deferred();
         var that = app.homeView;  
         
         $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.showAlertSettings();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
    
    takeAlertFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
         var that = app.homeView;  
         
         $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.takeAlert();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
   
     finishAlertFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
        var that = app.homeView;  
         that.finishFromSlider = true;
        
         $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.showFinishAlert();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
    
     pauseAlertFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
         var that = app.homeView;  
        
         $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.showPauseAlert();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
    
    resumeAlertFromSlider: function(idalert,uuid) {
        var deferred = $.Deferred();
         var that = app.homeView;  
        
         $smart.findAlert(idalert,uuid)
         .done(function(alert) {
              that.prepareAlertInfo(alert)
              .done(function() {
                 that.set('alert',alert);
                 that.showResumeAlert();
                 deferred.resolve();
              })
            
         })
         .fail(function() {deferred.resolve();})
        
         return deferred.promise();
    },
    
    
    // Permite a la ama de llaves o jefe de mantenimiento marcar una alerta como finalizada...
    // Si la alerta fue asignada a otra persona, se finaliza la alerta normalmente.
    // Si la alerta es huérfana, antes de marcarla, también se le asigna le idstaff de la ama de llaves o jefe de
    // mantenimiento, para que no sea coniderada además como una alerta sin asignar...
    markAlertAsFinished: function(fromSlider) {
        var deferred = $.Deferred();
        var that = app.homeView;      
        var orphan = (that.alert.idstaff !== 0);
        var idstaff = that.alert.idstaff !== 0 ? that.alert.idstaff : app.user.idstaff;
       
        var idstatus = that.get('alert').idstatus;
        //helper.showLoading();        
        helper.showLoading('Marcando como resuelta!');        
        $smart.markAlertAsFinished(that.get('alert'), idstaff,idstatus)
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {                
                that.set('alert.markedAsFinished', true);
                app.sounds.snap.play();   
                that.refreshData(true);   
                that.refreshStatusElements(globals.ALERT_STATUS_RESOLVED);             
                //helper.sendPushNotificationAlert(that.get('alert'),globals.PN_ALERT_MARKFINISHED);                           
                helper.hideLoading(); 
                if (fromSlider == false)
                    that.goBack2();
                deferred.resolve();
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();
            deferred.resolve();
            //alert('Error: Attempting to finish Alert Failed');
        })     
        
        return deferred.promise();
    },
    
    
    // Permite a la ama de llaves o jefe de mantenimiento marcar una tarea como finalizada...
    // Si la tarea fue asignada a otra persona, se finaliza normalmente.
    // Si la tarea es huérfana, antes de marcarla, también se le asigna el idstaff de la ama de llaves o jefe de
    // mantenimiento, para que no sea coniderada además como una tarea sin asignar...
     markTaskAsFinished: function() {
        var that = app.homeView;      
        var idstaff = that.task.idstaff !== 0 ? that.task.idstaff : app.user.idstaff;
                 
        helper.showLoading("Marcando como finalizada!");                
        $smart.markTaskAsFinished(that.get('task.idtask'), idstaff)
        .done(function(){  // success
            that.refreshTasks()
            .done(function() {
                that.set('task.markedAsFinished', true);
                app.sounds.snap.play();   
                that.refreshData(true);   
                that.refreshStatusElementsTask(globals.TASK_STATUS_FINISHED);                             
                helper.sendPushNotificationTask(that.get('task'),globals.PN_TASK_MARKFINISHED);            
                helper.hideLoading();           
                that.goBack2();
                
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideWorking();
            //alert('Error: Attempting to finish Task Failed');
        })            
    },
    
    
    
    // La alerta se marca como DND (alert.tag = 1) y se marca como finalizada.
    markAlertAsDND: function() {
        var that = app.homeView;              
        
        //helper.showLoading();        
        helper.showLoading('Marcando alerta como DND!');        
        $smart.markAlertAsDND(that.get('alert'), app.user.idstaff)
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {
                app.sounds.snap.play();   
                that.set('alert.dnd', true);
                that.refreshData(true);   
                that.refreshStatusElements(globals.ALERT_STATUS_RESOLVED);                             
                //helper.sendPushNotificationAlert(that.get('alert'),globals.PN_ALERT_DND);            
                that.goBack2();
                helper.hideLoading();                       
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();                                   
        })           
    },
    
    
   
    
    
    
    alertToTask: function() {        
        
        var that = app.homeView;              
                
        helper.showLoading('Convirtiendo a Tarea!');        
        $smart.alertToTask(that.get('alert'))
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {
                app.sounds.snap.play();   
                that.set('alert.isTask', false);
                that.refreshData(true);                   
                that.goBack2();
                helper.hideLoading();                       
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();                                   
        })          
        
    },
    
    alertReopen: function() {        
        
        var that = app.homeView;              
                
        helper.showLoading('Reabriendo Alerta!');        
        $smart.alertReopen(that.get('alert'))
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {
                app.sounds.snap.play();   
               
                that.refreshData(true);  
                that.alertActionSuccess(globals.ALERT_STATUS_PENDING, null); 
                helper.hideLoading();                       
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();                                   
        })          
        
    },
    
    
    escalateAlert: function() {
        var that = app.homeView;              
                
        helper.showLoading('Escalando Alerta!');        
        $smart.escalateAlert(that.get('alert'))
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {
                app.sounds.snap.play();   
                that.set('alert.byhousekeeper', false);
                that.refreshData(true);   
                //that.refreshStatusElements(globals.ALERT_STATUS_RESOLVED);                                             
                that.goBack2();
                helper.hideLoading();                       
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();                                   
        })           
        
        
    },
    
    
    markAlertAsTaskCreated: function(idtask) {        
        var that = app.homeView;            
        var idstaff = that.alert.idstaff !== 0 ? that.alert.idstaff : app.user.idstaff;                
                
        helper.showLoading('Resolviendo alerta!');        
        $smart.markAlertAsTaskCreated(that.get('alert.idalert'), idtask, idstaff)
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {                
                that.set('alert.taskCreated', true);
                app.sounds.snap.play();   
                that.refreshData(true);   
                that.refreshStatusElements(globals.ALERT_STATUS_RESOLVED);             
                                
                helper.sendPushNotificationAlert(that.get('alert'),globals.PN_ALERT_TASKCREATED);            
                helper.hideLoading(); 
                 app.navigateHome();    
            })
        })
        .fail(function(result) {
            app.sounds.error.play();
            helper.hideLoading();            
        })            
        
        
        
    },
    
    
    
    
    openSelectStaffView: function(fromReportAlert) {                  
        var that = app.homeView;            
        that.fromReportAlert = fromReportAlert;
        that.fromCreateTask  = false;
        if ( (that.isAlert && !app.homeView.alert.resolved) ||        
             (!that.isAlert && !app.homeView.task.finished) ||
              fromReportAlert)        
            app.mobileApp.navigate('components/homeView/selectstaff.html');        
        
    },
    
    openSelectStaffViewFromCreateTask: function() {                  
        var that = app.homeView;            
        that.fromReportAlert = false;
        that.fromCreateTask = true;        
        app.mobileApp.navigate('components/homeView/selectstaff.html');        
        
    },
    
    
         
    showDialogAssign: function(e) {         
        var that = app.homeView;        
        that.element = e;
        
        var staffName =  helper.getStaffFullName(e.dataItem.idstaff);
        
        
        if (that.fromReportAlert === true)
              helper.showDialogYN("¿Asignar a <strong>" + staffName + "</strong> ?", function() {app.homeView.selectStaffFromReportAlert()});
        else if (that.fromCreateTask === true)
              helper.showDialogYN("¿Asignar a <strong>" + staffName + "</strong> ?", function() {app.homeView.selectStaffFromCreateTask()});
        else {
        
        // if 0, has not beeing assigned. Also to avoid sending push to same person if assigned again..
        // if not 0, then task is beeing reassign, and we will send notification to old idstaff too...        
            var currentAssignedStaff = (that.isAlert) === true ? that.get('alert.idstaff') :  that.get('task.idstaff') ;         
            if (currentAssignedStaff === e.dataItem.idstaff) 
                that.goBack2();
            else {            
                
                helper.showDialogYN("¿Asignar a <strong>" + staffName + "</strong> ?", function() {app.homeView.selectStaff()});
            }
        }
    },
  
    
    // APPLIES TO NEW ALERTS ONLY
    selectStaffFromReportAlert: function() {
        var that = app.reportAlertView;     
        var e = app.homeView.element;        
        
        that.set('alert.idstaff', e.dataItem.idstaff);
        that.set('alert.isOrphan', false);
        that.set('alert.assignedby', app.user.idstaff);
        that.set('alert.isMine', e.dataItem.idstaff === app.user.idstaff);                          
        that.set('alert.staffFullname', helper.getStaffFullName(e.dataItem.idstaff));                                       
        that.set('alert.staffAvatar', helper.getStaffAvatar(e.dataItem.idstaff));               
        that.set('alert.staffRole', helper.getStaffRole(e.dataItem.idstaff));          
        
        that.goBack();
    },
    
     selectStaffFromCreateTask: function() {
                  
        var that = app.reportAlertView;     
        var e = app.homeView.element;        
        
        that.set('task.idstaff', e.dataItem.idstaff);
        that.set('task.isOrphan', false);
        that.set('task.assignedby', app.user.idtaff);
        //that.set('alert.isMine', e.dataItem.idstaff === app.user.idstaff);                          
        that.set('task.staffFullname', helper.getStaffFullName(e.dataItem.idstaff));                                       
        that.set('task.staffAvatar', helper.getStaffAvatar(e.dataItem.idstaff));               
        that.set('task.staffRole', helper.getStaffRole(e.dataItem.idstaff));          
        
        that.goBack();
        
        
          
        
    },
    
    
    selectStaff: function() {
        var that = app.homeView;     
        var e = that.element;
        var previousOwner = that.get('alert.idstaff'); //(that.isAlert) === true ? that.get('alert.idstaff') :  that.get('task.idstaff') ;          
        
        
        if (true) { //(that.isAlert) {            
            that.set('alert.idstaff', e.dataItem.idstaff);
            that.assignAlert(previousOwner)            
            .done(function() {            
                that.set('alert.assignedby', app.user.idtaff);
                that.set('alert.isMine', e.dataItem.idstaff === app.user.idstaff);                          
                that.set('alert.staffFullname', helper.getStaffFullName(e.dataItem.idstaff));                                       
                that.set('alert.staffAvatar', helper.getStaffAvatar(e.dataItem.idstaff));               
                that.set('alert.staffRole', helper.getStaffRole(e.dataItem.idstaff));                
                that.goBack2();
            })
            .fail(function(error){                
                that.set('alert.idstaff', previousOwner);                
            })
        }        
       /*
        else {  // is Task
            that.set('task.idstaff', e.dataItem.idstaff);
            that.assignTask()
            .done(function() {
                that.set('task.isMine', e.dataItem.idstaff === app.user.idstaff);                
                that.set('task.staffFullname', helper.getStaffFullName(e.dataItem.idstaff));               
                that.set('task.staffAvatar', helper.getStaffAvatar(e.dataItem.idstaff));                               
                that.set('task.staffRole', helper.getStaffRole(e.dataItem.idstaff));                
                that.goBack2();
            })
            .fail(function(error){                
                that.set('task.idstaff', previousOwner);
                
            })
        }
        */
    },
    
    
    // Assigns alert to the selected staff member
    assignAlert: function(previousOwner) {
        var deferred = $.Deferred();
        var that = app.homeView;                        
        
        
        helper.showLoading('Asignando alerta...');
        // Check for reassignment..
        if (previousOwner !== 0) {// it is beeing reassigned
            that.set('alert.reassigned', true);
            that.set('alert.oldowner', previousOwner);
        }
        $smart.assignAlert(that.get('alert'), that.get('alert.idstaff'))
        .done(function(){  // success
            that.refreshAlerts()
            .done(function() {
                app.homeView.set('alert.isOrphan', false);      
                app.homeView.set('alert.confirm', false);          
                app.homeView.set('alert.tag', 0);      // In case it was taken previosly (tag = 4)    
                app.sounds.snap.play();                            
                that.refreshData(true);   // update orphans too                                
                helper.hideLoading();                
                /*
                helper.sendPushNotificationAlert(that.get('alert'), globals.PN_ALERT_ASSIGNED);                
                // Check if alert had already an owner, and is beeing reassigned
                if (that.get('alert.reassigned') == true) { // notificatamos al oldowner                     
                    helper.sendPushNotificationAlert(that.get('alert'), globals.PN_ALERT_REASSIGNED);
                }*/
                deferred.resolve();
            })
        })
        .fail(function(error) {
            that.alertActionFail('Problema al asignar alerta! Intenta más tarde!');   
            deferred.reject();          
        })        
        return deferred.promise();
    },
    
    
    // Cuando tomo una alerta...me la asigno (levanto la mano)
    takeAlert: function() {
        var deferred = $.Deferred();
        var that = app.homeView;
        helper.showLoading('Espere...');
        $smart.takeAlert(that.get('alert'), app.user.idstaff)
        .done(function(result) {
            that.refreshAlerts()
            .done(function() {                
                //if (result.result === 1) { // Si la pude tomar                
                    // REVISAR SI AÚN SEGUÍA HUÉRFANA CUANDO SE ENVÍO SOLICITUD            
                    app.homeView.set('alert.isOrphan', false);                  
                    app.homeView.set('alert.isMine', true);      
                
                    that.set('alert.assignedby', app.user.idtaff);
                                       
                    that.set('alert.staffFullname', helper.getStaffFullName(app.user.idstaff));                                       
                    that.set('alert.staffAvatar', helper.getStaffAvatar(app.user.idstaff));               
                    that.set('alert.staffRole', helper.getStaffRole(app.user.idstaff));    
                
                    that.set('alert.alertaTomada',true);
                    app.sounds.snap.play();                            
                    that.refreshData(true);   // update orphans too                                
                    helper.hideLoading();     
                    $smart.syncAlertsNOW(); 
                   // helper.sendPushNotificationAlert(that.get('alert'), globals.PN_ALERT_TAKEN);
                    deferred.resolve();            
               /*}
               else  {
                   that.alertActionFail(result.error);   
                   deferred.reject();                        
               } */                 
            })
        })    
        .fail(function(error) {            
            that.alertActionFail(error);   
            deferred.reject();                        
        })
        return deferred.promise();
    },
    
    
    
     assignTask: function() {
         var deferred = $.Deferred();
         
         var that = app.homeView;    
         var currentAssignedStaff = that.get('task.idstaff');       
         helper.showLoading('Asignando tarea...');
          // Check for reassignment..
         if (currentAssignedStaff !== 0) { // it is beeing reassigned
             that.set('task.reassigned', true);
             that.set('task.oldowner', currentAssignedStaff);
         }
         $smart.assignTask(that.get('task.idtask'), that.get('task.idstaff'))
         .done(function(){  // success             
             that.refreshTasks()
             .done(function() {
                 app.homeView.set('task.isOrphan', false);      
                 app.homeView.set('task.confirm', false);          
                 app.sounds.snap.play();                            
                 that.refreshData(true);   // update orphans too
                 helper.hideLoading();
                 
                 // Do not send push if future task
                 if (that.get('task.start') < $date.tomorrowNoUTCOffset()) {                 
                     helper.sendPushNotificationTask(that.get('task'), globals.PN_TASK_ASSIGNED);                
                 }
                    
                  // Check if alert had already an owner, and is beeing reassigned
                /*if (that.get('task.reassigned') == true) { // notificatamos al oldowner                     
                    helper.sendPushNotificationAlert(that.get('task'), globals.PN_TASk_REASSIGNED);
                }*/
                 deferred.resolve();
             })
         })
         .fail(function(error) {             
            app.sounds.error.play();            
            helper.hideLoading();
            if (error !== null) 
                $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + error);
            deferred.reject();              
         })         
         return deferred.promise();
    },
    
    
     
   
    
     sendPushNotificationTaskDeleted: function(task) {
         var that = app.homeView;
         var quien = app.user.fullname.split(" ")[0];
         
         if (task.idstaff === app.user.idstaff) return;                          
         var message = quien + " ha eliminado tarea . " + helper.getTaskTypeName(task.idtype);
         var customdata = {sound: globals.SOUND_ALERT_DONE }; 
         $smart.sendPushNotification('Tarea Eliminada',task.idstaff, message, customdata);                      
    },
    
    sendPushNotificationTaskAssigned: function(task) {     
        var that = app.homeView;
        
        // Si yo mismo cree la tarea, no enviar push
        if (task.idstaff === app.user.idstaff) return;        
        var quien = app.user.fullname.split(" ")[0];
        var customdata = {type: globals.IS_TASK, idtype: task.idtask, sound: globals.SOUND_ALERT_DING }; 
                        
        that.findFacility(task.idfacility)
        .done(function(facility) {
            var message = quien + " te asignó tarea: " + ((facility !== null) ? facility.name + " . " : '')  + helper.getTaskTypeName(task.idtype);
             $smart.sendPushNotification('Tarea',task.idstaff, message);                     
             // Check if reassinged, so we notify previous owner as well.
             if (that.get('task.reassigned') === true) {
                 message = quien + " reasignó tarea. Desliza para actualizar";
                 $smart.sendPushNotification('Tarea',that.get('task.oldowner'), message,
                     {sound: globals.SOUND_ALERT_DONE });                                   
             }
        })
                          
     },
    
    
    findFacility: function(idfacility) {
        var deferred = $.Deferred();        
        var that = app.homeView;
        var ds = that.get('facilitiesDataSource');
                
        if (typeof idfacility === 'undefined') { return deferred.resolve(null)}  
        
        if (ds.length === 0) 
            deferred.resolve(null);
        else        
            ds.fetch(function(){  
              for (var i = 0; i < ds.total(); i++) {
                  var dataItem = ds.at(i);
                  if (dataItem.idfacility === idfacility) {                  
                      return deferred.resolve(dataItem);
                  }
              }
                return deferred.resolve(null);
            });       
        
        return deferred.promise();
    },
    
    
   
    
    // Cancel process when we are trying to assign a staff member to an orphan task/alert
    cancelAlertAssignment: function() {
        app.homeView.set('alert.isOrphan', true);      
        //app.homeView.set('alert.confirm', false);          
        app.homeView.set('alert.idstaff', 0);          
    },
    
    
    
    showDeleteAlert: function() {           
        helper.showDialogYN(' <i class="mdi mdi-alert-outline mdi-alertcolor shadow " style="font-size: 24px; "></i>   ¿Está seguro que desea eliminar la alerta?', 
            function() {app.homeView.deleteAlert()}, true);
    },
    
    showDeleteTask: function() {           
        helper.showDialogYN('<i class="mdi mdi-alert-outline mdi-alertcolor shadow " style="font-size: 24px; "></i>   ¿Está seguro que desea eliminar la tarea?', function() {app.homeView.deleteTask()}, true);
        
    },
    
   
    
    deleteTask: function() {
        var that = app.homeView;      
        helper.showLoading("Eliminando tarea!");                
        $smart.deleteTask(that.get('task.idtask'))
        .done(function() {    
            that.sendPushNotificationTaskDeleted(that.get('task'));          
            helper.hideLoading();                    
            that.refreshTasks()                        
            .done(function() {                
                app.homeView.refreshData(true);                
                 that.goBack();
            })            
        })
        .fail(function(error) {                                  
            helper.hideLoading();
        })       
        /*if (app.user.role === globals.ROLE_MANAGER)
            app.mobileApp.navigate('components/homeView/manager.html');        
        else
            app.mobileApp.navigate('components/homeView/housekeeper.html'); 
        */
    },
    
    
    showStartAlert: function() {       
         $smart.hasRunningTask(app.user.idstaff)
        .done(function(has, entity) {          
            if (has) {
               helper.showDialogYN('Tienes una actividad en progreso ¿Desea pausarla y comenzar ésta otra?', function() {app.homeView.pauseAndStartAlert(entity)});                 
            }
            else 
                helper.showDialogYN('¿Desea comenzar la actividad?', function() {app.homeView.startAlert()});
            
         })
    },
    
   showResumeAlert: function() {        
        $smart.hasRunningTask(app.user.idstaff)
        .done(function(has, entity) {          
            if (has) {
               helper.showDialogYN('Tienes una actividad en progreso ¿Desea pausarla y reanudar ésta otra?', function() {app.homeView.pauseAndResumeAlert(entity)});                 
            }
            else 
                helper.showDialogYN('¿Desea reanudar la actividad?', function() {app.homeView.resumeAlert()});
            
         })
    },
    
   /* showStartTask: function() {        
        helper.showDialogYN('¿Desea comenzar la tarea?', function() {app.homeView.startTask()});        
        
    }, */
    
    
    /*** CREATE TASK ***/
    
    initCreateTask: function() {
        var that = app.homeView;
        if (helper.isTablet()) {
            $('.sh-label').css('font-size', '24px');
            //$('.sh-select').css('font-size', '1.3em');
            $('.form-control').css('font-size', '20px');
            $('.form-control').css('height', '100%');            
        }
        
        // TOGGLE checkbox for specifying task start time or not 
        $('#setTimeTask').click(function() {
            if ( $(this).is(":checked")) {
                $(this).next().css('color','#00bcd4');
                $(this).next().css('text-decoration','none');
                that.set('task.starttime', $date.moment("HH:mm"));
                that.set('task.hasstarttime', true);
            }
            else  {                
                $(this).next().css('color','gray');
                $(this).next().css('text-decoration','line-through');
                that.set('task.starttime', null);
                that.set('task.hasstarttime', false);
            }                        
        })
        
    },
    
    
    beforeShowCreateTask: function() {
        var that = app.homeView;
        
                       
        if (!that.initializeCreateTask) return;        
        
        helper.showLoading();         
        $smart.getStaff()
        .done(function(staff) {                        
            staff.fetch(function() {
                that.set('staffDataSourceNoGrouping', staff);                         
                $smart.getTaskTypes()
                .done(function(tasktypes) {            
                    tasktypes.fetch(function() {                                                
                        that.set('taskTypesDataSource', tasktypes);
                        var data = that.taskTypesDataSource.view();
                        
                        if (data.length > 0) {
                        // Initialize tasktype object with first tasktype from source.                                                         
                            that.set('task.idtype', data[0].idtasktype);                   
                            that.set('firstTaskType', data[0].idtasktype);                   
                        }
                        $smart.getAllFacilities()
                        .done(function(facilities) {
                            facilities.fetch(function() {
                                that.set('facilitiesDataSource', facilities);
                                helper.hideLoading();   
                                that.initializeCreateTask = false;
                            })                                                
                        })                     
                    })        
                })    
             })   
        })                
    },
    
    
    
    afterShowCreateTask: function() {
        var that = app.homeView;
        that.cleanTask();     
        
        // Si estamos creando tarea desde una alerta, pasar datos de la alerta... 
        if (that.taskFromAlert == true) {
            var alert = that.get('alert');          
            if (alert.notes != '')
                that.set('task.instructions',alert.name + ': ' + alert.notes );
            else
                that.set('task.instructions',alert.name );
        }        
    },
    
    
    
    goCreateAlert: function() {
         app.reportAlertView.selectAlertCategory(1);  
    },
    
    _goCreateTask: function(e) {      
        e.preventDefault();
       /* if (app.user.role == globals.ROLE_OPERATIONS ) {             
            if (app.homeView.currentTab == "#tab_amallaves")     
                app.reportAlertView.selectAlertCategory(globals.ALERT_CATEGORY_REQUEST);                
            else
                app.reportAlertView.selectAlertCategory(globals.ALERT_CATEGORY_ISSUE);        
        }
        else        */
        
        app.reportAlertView.selectAlertCategory(globals.ALERT_CATEGORY_ISSUE);        
    },
    
    
    /*goCreateTask: function() {                  
         app.reportAlertView.selectAlertCategory(4);  
        
      
        app.homeView.taskFromAlert = fromAlert;
        
        app.homeView.set('isNotChief', (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE));                    
        
        app.mobileApp.navigate('components/homeView/createTask.html');                                
      
    },*/
    
    
    createCleaningTasks: function() {
        
       var that = app.homeView;        
       helper.showLoading('Creando Tareas de Limpieza');
        
        $smart.createCleaningTasks({idstaff: app.user.idstaff, role: app.user.role})
        .done(function(result) {
            console.info(result);
            that.updateAlerts()
            .done(function() {                
                that.refreshData(true)                
                .done(function() {                             
                    helper.hideLoading();  
                })    
            })
        })
    },
    
     
    createCleaningTasksForStaff: function(idstaff) {
       var that = app.homeView;        
       helper.showLoading('Creando tareas de Limpieza');
        
        $smart.createCleaningTasks({idstaff: idstaff})
        .done(function(result) {
            that.updateAlerts()
            .done(function() {
                that.refreshData(true)                
                .done(function() {         
                    helper.hideLoading();            
                })    
            })
        })
    },
    
    
 
    
    
    createTask: function() {                
        var that = app.homeView;        
                
        helper.showLoading('Creando tarea...');
        $("#instructionsTask").blur();
            
        // Merge Start Date and Time
        var startDate = moment(that.task.startdate);
        
        
        if (that.get('task.hasstarttime')) {
            that.set('task.hasstarttime', 1);
            var startTime = moment(that.task.starttime, "HH:mm a");            
            startDate.hour(startTime.hour());
            startDate.minute(startTime.minute());            
        }          
        else
            that.set('task.hasstarttime', 0);
            
        that.set('task.start', $date.toUTC(startDate));
        
        if (that.get('isNotChief') == true)
            that.set('task.idstaff', app.user.idstaff);
            
            
            // Create Task
        $smart.createTask({
            createdby     : app.user.idstaff,            
            createddate   : $date.timestamp(),
            start         : that.get('task.start'),
            hasstarttime  : that.get('task.hasstarttime'),
            instructions  : that.get('task.instructions'),
            idtype        : that.get('task.idtype'),
            idstaff       : that.get('task.idstaff'),
            idpriority    : that.get('task.idpriority'),
            idfacility    : that.get('task.idfacility'),
            idalert       : that.get('alert.idalert')    // When creating task from Alert               
        })
        .done(function(result) {                                                                                 
            helper.hideLoading();
            that.set('task.idtask', result.idtask);
            if (that.get('task.idstaff') !== 0) {  // if assigned                                
                if (that.get('task.start') < $date.tomorrowNoUTCOffset()) { // Do not send push if future task                    
                    helper.sendPushNotificationTask(that.get('task'), globals.PN_TASK_ASSIGNED);                
                }
            }
            app.sounds.snap.play();
            that.refreshTasks()
            .done(function() {
                that.refreshData(true)
                .done(function() {
                    
                    if (that.taskFromAlert == true)
                        that.markAlertAsTaskCreated();
                    else {
                        that.createNotification('Tarea creada exitosamente! <br><strong>' + helper.getTaskTypeName(result.idtype) + "</strong>");
                        that.goBack();
                    }                                        
                })
            })
        })
        .fail(function(error) {  
            helper.hideWorking();
           if (error !== null) 
               $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + error);
        })
    },
    
    
    createNotification: function(message) {
        var that = app.homeView;
        that.set('notification',message);
        $("#ddNotification").css('display','block');
        
        setTimeout(function() { $("#ddNotification").fadeOut(2000)}, 1000);
        
        
        
    },
    
    
    
    // Check requiered fields 
    createTaskCheckRequired: function() {
        var task = app.homeView.get('task');
        if (task.idtype === 0)
            return false;
        return true;
        
    },
    
    goFilterHousekeeper: function() {
        app.mobileApp.navigate('components/homeView/filterHousekeeper.html');                   
    },
    
    
    goFilter: function() {
        app.mobileApp.navigate('components/homeView/filterMaid.html');                   
    },
    
    filter: function(e) {                
        var that = app.homeView;
        var newFilter = e.touch.target.data().filter; 
        if (app.homeView.get('filterOption') === newFilter) app.homeView.goHome(); // no change
        
        // Filter Change...                
        
        $("#filter" + app.homeView.get('filterOption')).removeClass('mdi-checkbox-marked-circle c-main ');
        $("#filter" + app.homeView.get('filterOption')).addClass('mdi-checkbox-blank-circle-outline');
        $("#filter" + newFilter).removeClass('mdi-checkbox-blank-circle-outline');
        $("#filter" + newFilter).addClass('mdi-checkbox-marked-circle c-main ');
        
        app.homeView.set('filterOption', newFilter);        
        
        if (newFilter === 1) {
            that.set('showAlerts', true);
            that.set('showTasks', true);
        }    
        else if (newFilter === 2) {
            that.set('showAlerts', false);
            that.set('showTasks', true);
        }
        else if (newFilter === 3) {
            that.set('showAlerts', true);
            that.set('showTasks', false);
        }
        
        
        setTimeout(function() {app.mobileApp.navigate('components/homeView/maid.html');     }, 50);
    },
    
    
    // TODO: move to helper.
    // Flatens into one single array
    flatten: function(ary) {
        var ret = [];
        for(var i = 0; i < ary.length; i++) {
            if(Array.isArray(ary[i])) {
                ret = ret.concat(app.homeView.flatten(ary[i]));
            } else {
                ret.push(ary[i]);
            }
        }
        return ret;
    },
    
    
    goBreakdownHistory: function(e){
        app.homeView.set('showToday', e.touch.target.data().range === 0);
        app.mobileApp.navigate('components/homeView/viewBreakdownHistory.html');                           
    },
  
    
    beforeShowBreakdownHistory: function() {        
        var start = new Date();                
        var end = new Date();
          
        if (app.homeView.get('showToday') === false) {
            start.setDate(start.getDate() - 7);       
            startdate = moment().subtract(7,'days');
        }
                    
        app.homeView.set('startdateHistory', start);
        app.homeView.set('enddateHistory', end);
                
        app.homeView.showBreakdownHistory(start, end);
    },
    
    refreshBreakdownHistory: function() {        
        var that  = app.homeView;
        var start = new Date(that.get('startdateHistory'));
        var end   = new Date(that.get('enddateHistory'));
        
        that.showBreakdownHistory(start, end);
        
    },
    
    showBreakdownHistory: function(start, end) {
        var that = app.homeView;
        
        $smart.getBreakdownsHistoryRange(moment(start), moment(end))
        .done(function(result) {                         
            var breakdowns = app.homeView.flatten(result.alerts);            
            app.homeView.set('breakdownsDataSource',
            new kendo.data.DataSource({
                data : breakdowns
            }));                         
            that.createBreakdownsChart("breakdownsChartHistory", result.alertscount, result.days);            
            
            // Create Item Count Data Source
            that.set('itemizedBreakdownsDataSource', that.itemizeBreakdownsDataSource(breakdowns));              
        })
    },
    
    
    // Taks the breakdowns and create a list of items and the number of ocurrences
    itemizeBreakdownsDataSource: function(breakdowns) {
        var that = app.homeView;
        var result = []; // array of { iditem, itemimage, count }        
        
        for(var i=0; i<breakdowns.length; i++) {
            var idx = that.containsItem(result, breakdowns[i]);
            if (idx === false) {
                if (breakdowns[i].iditem == null)                
                    result.push({ isfacility: true, iditem: breakdowns[i].idfacility, itemname: helper.getFacilityName(breakdowns[i].idfacility), itemimage: breakdowns[i].itemimage, count: 1 })
                else
                    result.push({ idfacility: false, iditem: breakdowns[i].iditem, itemname: that.fixName(breakdowns[i].itemname), itemimage: breakdowns[i].itemimage, count: 1 })
            }
            else {
                result[idx].count++;
            }            
        }        
        return result;
    },
    
   
    containsItem: function(array, breakdown) {
        var i = array.length;
        while (i--) {
            if (breakdown.iditem == null) {   // facility breakdown
                if (array[i].idfacility === breakdown.idfacility) 
                    return i;    
            }
            else
                if (array[i].iditem === breakdown.iditem) 
                    return i;
            
        }
        return false;
    },
    
    
    
    fixName: function(name) {
        if (name == 'zzOtro') return 'Otro';
        return name;
    },
    
    
    
    createBreakdownsChartHistory: function() {        
        $smart.getBreakdownsHistory(7)
        .done(function(result) {             
            app.homeView.createBreakdownsChart("breakdownsChart", result.alertscount, result.days);
         })
    },
        
        
    createBreakdownsChart: function(id, alertscount, days) {            
        $("#" + id).kendoChart({
            /*title: {
                    text: "Gross domestic product growth \n /GDP annual %/"
            },*/                                               
            legend: {
                position: "bottom"
             },
            chartArea: {
                    background: ""
            },
            seriesDefaults: {
                    type: "line",
                    style: "smooth",
                    color: "#38b8a4"
                    
            },
            series: [{
                    name: "Averías",
                    data: alertscount, //[3, 4, 5, 4, 4, 5, 3]                     
                    
            }],
            
            valueAxis: {
                labels: {
                        /*format: "{0}%"*/
                },
                line: {
                        visible: false
                },
                majorUnit: 1,
                   //axisCrossingValue: -10
                },
                categoryAxis: {
                    categories:  days,//[2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011],
                    majorGridLines: {
                        visible: false,
                },
                labels: {
                        rotation: "auto"
               },                    
            },
            tooltip: {
                visible: true,
                format: "{0}%",
                template: "#= series.name #: #= value #"
            }
         });
    }
        
        
    
    
    
    
});

// START_CUSTOM_CODE_homeView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes





(function () {
   
    
    
})();
// END_CUSTOM_CODE_homeView
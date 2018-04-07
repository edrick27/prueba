    'use strict';

app.profileView = kendo.observable({
    
    staffDataSource        : [],    
    staffAlertsDataSource  : [],
    staffTasksDataSource   : [],
    
    profile: {},
    profilehousekeeper: {},
    progress: 0,
    timeaccomplishment: 0,
    timeDelay: 0,
    hasDelay: false,
    
    
    filterOptions          : new kendo.data.DataSource({
                                  data: [ {name: 'Ver Todo', id: 1}, {name: 'Disponible', id: 2}, {name: 'No Disponible', id: 3}]
                            }),
    
    filterOption           : 1, // default filter Option
    
    justLoggedIn : true,
        
    
    maiddata    :  {},
    
    
    goActivity: function(e) {
      e.stopPropagation();
        e.preventDefault();
        
    },
    
    goBack: function(e) {                
        if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate("#:back");
    },
    
    
    goCreateTask: function() {        
        app.reportAlertView.selectAlertCategory(4);  
    },
    
    
    initMaid: function(e) {
        helper.preparePullToRefresh(e, function() { app.profileView.pullToRefreshMaid(e) });          
        
    },
    
         
    beforeShowMaid: function() {
        var that = app.profileView;
        var staff = null;
                
        staff = app.homeView.get('staff')
        that.set('staff', staff );       
        that.set('avatar', helper.getAvatar(app.user.avatar));     
        that.set('staff.role',helper.getStaffTypeName(staff.idstaff));
        
        if (that.justLoggedIn) {                
            that.justLoggedIn = false;           
            /*that.getWorkingHours(staff.idstaff)
            .done(function() { */
                that.getHistory(staff.idstaff);
            //})    
       }
        
      that.set('progress',0);
      that.set('timeaccomplishment',0);
        
       
           
    },
    
    
     afterShowMaid: function() {                 
         var that = app.profileView;
         
         
         helper.setTabStripURLs();  
         //helper.showClock($("#clockprofile"));        
         
         console.info('hide');
         
         helper.hideChat();
         
         $smart.pauseSyncWorker();         
         
         
         // Get Staff statistics
         var staff = that.get('staff');
         that.set('progress', staff.stats.progress); 
         that.set('timeaccomplishment', staff.stats.timeaccomplishment);
         that.set('timeDelay', staff.stats.delay * -1);        
         that.set('hasDelay', staff.stats.hasdelay);         
                
         if (staff.stats.progress === 100)
             $("#progressTasks .k-progress-status").css('color',"white");
         else
             $("#progressTasks k-progress-status").css('color',"black"); 
                                 
         // Set Evaluation Stars         
         that.uncheckEvaluation('starmaidprofile');
         if (staff.stats.evaluation === 0 || staff.stats.evaluation === null) return;                
            $('#starmaidprofile' + staff.stats.evaluation ).prop('checked',true);        
       
    },
    
    
    
    uncheckEvaluation: function(elementName) {
        for(var i=1;i<=5;i++) {
            $('#' + elementName + i).prop('checked',false);                        
        }
    },
    
    
    
    
    init: function(e) {
        var that = app.profileView;                
        
        
        //helper.preparePullToRefresh(e, function() {  });          
        
       /*var that = app.profileView;
       if (!that.get('ishousekeeper')) {
           var staff = app.homeView.get('staff')
           that.set('staff', staff );       
           that.set('staff.role',helper.getStaffRole(staff.idstaff));
           that.getWorkingHours(staff.idstaff)
           .done(function() {
               that.getHistory(staff.idstaff);
           })    
       } */
    },
    
        
        
       
    
    
    // Maid profile viewed from housekeeper
    beforeShowProfile: function() {        
        var that = app.profileView;
        var staff = that.get('staff');        
        
        console.info(that.get('staff'));
        
        that.set('staff.role',helper.getStaffRole(staff.idstaff));
        that.set('staff.avatar', helper.getAvatar(staff.avatar));          
        
        
        
        that.set('isMaid', helper.getStaffRoleName(staff.idstaff) == globals.ROLE_MAID);
        
       /* that.getWorkingHours(staff.idstaff)
        .done(function() { */
            // We will get history in another view (if history button pressed)
            //that.getHistory(staff.idstaff);                
            
            
            
            // Get Staff Current Alerts 
             $smart.getStaffAlerts(staff.idstaff) // today Alerts only + those not resolved yet
            .done(function(alerts) {                          
                alerts.fetch(function()  {                                    
                    that.set('staffAlertsDataSource',alerts);                                               
                    /*$smart.getStaffTasks(staff.idstaff) 
                    .done(function(tasks) {                          
                        tasks.fetch(function()  {                                    
                            that.set('staffTasksDataSource',tasks);                                                                           
                        })            
                    })*/           
               })           
            })           
        //});   
        
            
        that.set('progress',0);
        that.set('timeaccomplishment',0);
    },
    
    
     afterShowProfile: function(e) {                 
         var that = app.profileView;
         
         helper.setTabStripURLs();  
        //helper.showClock($("#clockprofile"));          
         helper.hideChat();
         
         $smart.pauseSyncWorker();         
         
         var scroller = e.view.scroller;    
         scroller.reset();
        
         var staff = that.get('staff');
         that.set('progress', staff.stats.progress); 
         that.set('timeaccomplishment', staff.stats.timeaccomplishment);
       
         
         if (staff.stats.progress === 100)
             $("#progressTasks .k-progress-status").css('color',"white");
         else
             $("#progressTasks k-progress-status").css('color',"black"); 
                        
         that.set('timeaccomplishment', staff.stats.timeaccomplishment); 
         that.set('timeDelay', staff.stats.delay * -1);        
         that.set('hasDelay', staff.stats.hasdelay);     
         
         // Set Evaluation Stars         
         that.uncheckEvaluation('starmaid');
         if (staff.stats.evaluation === 0 || staff.stats.evaluation === null) return;                
            $('#starmaid' + staff.stats.evaluation ).prop('checked',true);        
       
    },
    
    
    
    initHousekeeper: function(e) {
        var that = app.profileView;                        
        
        that.myscroller = e.view.scroller;    
        
        that.set('dingdone', app.user.available);        
        helper.preparePullToRefresh(e, function() { that.pullToRefreshHousekeeper(e) });                  
        
        //helper.setPlusCirclePosition();
        
        
    },
    
    
    scrollTopWithFix: function() {
        
        var scroller = app.profileView.myscroller;
        if (typeof scroller  == 'undefined') return;
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
        
        var scroller = app.profileView.myscroller;
        var touches = scroller.userEvents.touches;
        var dummyEvent = { event: { preventDefault: $.noop } };
        
      
        
       for (var i = 0; i < touches.length; i ++) {
           touches[i].end(dummyEvent);
       }

       scroller.reset();
        
           
                
       // END FIX SCROLL ISSUE
    },
    
    
     beforeShowHousekeeper: function() {
        var that = app.profileView;
        
         
        that.set('profilehousekeeper.avatar', helper.getAvatar(app.user.avatar));  
        if (!that.justLoggedIn) return;
            that.justLoggedIn = false;
         
         $("input[type='search']").attr('placeholder','Buscar');
        
        that.set('profilehousekeeper.fullname', app.user.fullname);            
        that.set('profilehousekeeper.role',  helper.getRole(app.user.role));
        that.set('profilehousekeeper.idstaff',  app.user.idstaff);
        that.set('profilehousekeeper.hotelname',  app.hotel.name);      
         
        // Borrow staffDataSource from homeView
       
        that.set('staffDataSource', app.homeView.get('staffDataSource'));                        
        
        var ds = that.get('staffDataSource');
        
        if (typeof( ds.fetch) === 'undefined') return; 
        
        /*ds.fetch(function() {
            ds.group({field: "available", dir: "desc"});              
        })*/
        
    },
    
    
     
    afterShowHousekeeper: function() {
        var that = app.profileView;   
        
        helper.hideChat();
        
        $smart.pauseSyncWorker();         
        
        $("#viewProfileHousekeeper [data-role='progressbar'][data-value=100] .k-progress-status").css('color',"white");        
        
        helper.setTabStripURLs();                
        //helper.showClock($("#clockhousekeeper"));       
        
    },
    
    
    createCleaningTasksForMaid: function() {        
        app.homeView.createCleaningTasksForStaff(app.profileView.get('staff.idstaff'));
    },
    
    
    
    goCreateAlert: function() {
         app.reportAlertView.selectAlertCategory(1);  
    },
    
    
    
    // History of tasks and alerts completed by the current use..
    // TIP: should use listview...infinite scroll??
    // A Listview can we an array, since we need to merge alerts and tasks and sort by date...
    
    getHistory: function(idstaff) {            
        $smart.getAlertHistory(idstaff)
        .done(function(history) {            
            app.profileView.set('historyDS', history);
        })        
    },
    
     openHistoryAlertItem: function(e) {
         var _alert = e.dataItem;
         app.homeView.isAlert = true;
         app.homeView.prepareAlertInfo(_alert)
         .done(function() {
             app.mobileApp.navigate('components/homeView/viewAlertMaid.html');    
         })                        
     },
    
    
     // When Housekeeper opens and alerts from staff profile..
     openAlertItem: function(e) {
         var _alert = e.dataItem;
         app.homeView.isAlert = true;
         app.homeView.checkingFromProfile = true;
         app.homeView.prepareAlertInfo(_alert)
         .done(function() {
             app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');    
         })                        
     },
    
     // When Housekeeper opens and alerts from staff profile..
     openTaskItem: function(e) {
         var task = e.dataItem;
         app.homeView.isAlert = false;
         app.homeView.checkingFromProfile = true;
         app.homeView.prepareTaskInfo(task)
         .done(function() {
             app.mobileApp.navigate('components/homeView/viewTaskHousekeeper.html');    
         })      
                  
     },
    
    
    
    
    getWorkingHours: function(idstaff) {
        var deferred = $.Deferred();
        
        $smart.getWorkingHoursForStaff(idstaff)
        .done(function(hours) {            
            app.profileView.set('hours', hours);
            if (hours.length === 0) {   // Limpiar Horario
                for(var j=0; j<7; j++) {
                    var jdx = j+1;
                    $("#starttime td:nth-child(" + jdx + ")").html('');
                    $("#endtime td:nth-child(" + jdx + ")").html('');           
                }                
            }
            else {
                for (var i = 0; i < hours.length; i++) {                 
                    var idx = i+1;
                    if (hours[i].free === 1) {
                        $("#starttime td:nth-child(" + idx + ")").addClass('free');
                        $("#starttime td:nth-child(" + idx + ")").html('Libre');
                        $("#endtime td:nth-child(" + idx + ")").html('');                    
                    }
                    else {                        
                        $("#starttime td:nth-child(" + idx + ")").html(hours[i].starttime);
                        $("#endtime td:nth-child(" + idx + ")").html(hours[i].endtime);                       
                    }                
                
                }        
            }
            deferred.resolve();
        });
        
        return deferred.promise();
    },
    
    
    pullToRefreshMaid: function(e) {        
       var that = app.profileView;         
       helper.pleaseWait(); 
        e.view.scroller.pullHandled();                
       
        
        /*$smart.updateWorkingHours(app.user.idmodule)
        .done(function() {       
            that.getWorkingHours(app.user.idstaff)
            .done(function() {*/
                that.getHistory(app.user.idstaff);                
                helper.hideLoading();            
            /*})
        })
        .fail(function() {
            helper.hideWorking();  
        })*/
       
    },
    
    
    
    pullToRefreshHousekeeper: function(e) {
        // We refresh staff workingHours....
        //helper.pleaseWait(); 
                
        if (!app.idle) return;
            
        console.info('hola');      
        
        e.view.scroller.pullHandled();                
        //helper.showLoading("Espere");
        helper.smallBottomAlert('<i class="fa fa-refresh fa-spin "></i>' + "  Refrescando...");
        app.idle = false;
        
         $smart.updateStaff()
        .done(function(haschanges) {            
            /*$smart.updateWorkingHours(app.user.idmodule)
            .done(function() {      */                  
                $smart.getStaffDetails()
                .done(function(staff) {
                    staff.fetch(function()  {                    
                        app.homeView.countCollaborators(staff); // needs to be done before groping
                        app.homeView.set('staffDataSource', staff);
                        
                        app.profileView.fixScrollIssue();
                        
                        
                        staff.group({field: "available", dir: "desc"});                          
                        app.profileView.set('staffDataSource',staff);                            
                        $("#staffListView").data("kendoMobileListView").refresh();                                                                      
                        //helper.hideLoading();                       
                        app.idle = true;
                        helper.smallBottomAlert("Listo!");
                   })
                })                        
            })
        //})
        .fail(function() {
            //helper.hideWorking();  
            app.idle = true;
            helper.smallBottomAlert("Falló conexión!");
        })
   },
    
    
    
    
    goStaffProfile: function(e) {        
        var that = app.profileView;        
        that.set('staff', e.dataItem);
        that.set('staff.role', helper.getRole(e.dataItem.role));        
        app.mobileApp.navigate('components/profileView/viewProfile.html');
        
    },
    
    
    goFilter: function() {
        app.mobileApp.navigate('components/profileView/filter.html');                   
    },
    
    
     filter: function(e) {                
        var that = app.profileView;
        var newFilter = e.touch.target.data().filter; 
        if (that.get('filterOption') === newFilter) that.goBack(); // no change
        
        // Filter Change...                
        
        $("#filter" + that.get('filterOption')).removeClass('mdi-checkbox-marked-circle c-main ');
        $("#filter" + that.get('filterOption')).addClass('mdi-checkbox-blank-circle-outline');
        $("#filter" + newFilter).removeClass('mdi-checkbox-blank-circle-outline');
        $("#filter" + newFilter).addClass('mdi-checkbox-marked-circle c-main ');
        
        that.set('filterOption', newFilter);        
        var ds = that.get('staffDataSource');
         
        ds.fetch(function() {            
            if (newFilter === 1) {    // All
                ds.filter( { field: "available", operator: "neq", value: 2 });
            }    
            else if (newFilter === 2) {   // Working
                ds.filter( { field: "available", operator: "equals", value: 1 });
            }
            else if (newFilter === 3) {   // Not Working
                ds.filter( { field: "available", operator: "equals", value: 0 });
                
            }
        
            })
        
        setTimeout(function() {that.goBack()    }, 50);
    }
    
    
    
    
    
    
});

// START_CUSTOM_CODE_contactsView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    
})();
// END_CUSTOM_CODE_contactsView
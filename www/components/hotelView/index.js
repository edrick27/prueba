'use strict';

app.hotelView = kendo.observable({
    
    occupancyDataSource: [],
    justLoggedIn:        true,
        
    
    hotelViewOptions: {
        group: true,        
        showTasks: true
    },
    
    initializeCreateTasks: true,
    staffDataSourceNoGrouping : [],  // for the dropdown when creating a task.        
    
    taskTypesDataSource    : [],
    task                   : {},
    
    occupancy              : {},
    
    stats                  : {occupancy: '0', pax: 0, entran: 0, salen: 0},
    
    canCreateTasks: false,  // only maids cannot,
    
    occupancyRead          : false,
    newuuid : null,
    idalert : null,
    idfacility : null,
    
    
    goBack: function(e) {        
         if (e != null) e.preventDefault();
        app.mobileApp.navigate("#:back");      
    },
    
    
    onShow: function() {},
    
    
    clickListener: function() {
        alert('CLICK');
    },
    
    
    
    initViewOccupancy: function(e) {
        
        
        var scroller = e.view.scroller;    
        scroller.reset();
        app.hotelView.myscroller = scroller;
    },
   
    
     
    beforeShow: function() {
        
        if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAINTENANCECHIEF || app.user.role === globals.ROLE_OPERATIONS)
            app.hotelView.set('canCreateTasks', true);
        else
            app.hotelView.set('canCreateTasks', false);
        
        $("input[type='search']").attr('placeholder','Buscar');
        
        /*app.hotelView.getOccupancy()       
        .done(function() {
            helper.hideLoading();
        })
        */
       
    },
    
    
  
    
    
    afterShow: function() {
         var that = app.hotelView;
        // helper.showClock($("#clockCalendar"));
        
        helper.hideChat();
        //$smart.pauseSyncWorker();         
        
        
       /* $("#toggleSelect").kendoTouch({
            doubleTapTimeout: 2000,
            doubletap: function (e) {
                alert('double tap');
            }        
        });
        */
        
         if (!that.justLoggedIn) return;         
         that.justLoggedIn = false;         
         
         //that.updateOccupancy();        
    },
    
    init: function(e) {               
       
        helper.preparePullToRefresh(e, function() { app.hotelView.pullToRefresh(e) });                        
         
       // helper.setPlusCirclePosition();
        
        var scroller = e.view.scroller;    
        scroller.reset();
        app.hotelView.myscroller = scroller;
        
        
         $("#searchfacilityHotel").on("keyup", function(){
            console.info('search');
            app.hotelView.applyFacilityFilter();
            var scroller = e.view.scroller;
            scroller.reset();                          
        });
        
        
        app.hotelView.getOccupancy();
        
        
        return;
        
       $("#scheduler").kendoScheduler({
                  date: new Date(),     
                  showWorkHours: false,     
                  height: 1000,
                  footer:false,
                  selectable:false,
                  views: [
                      {type: "day"},
                      {type: "month", selected: true},
                      {type: "agenda", selectedDateFormat: "{0:ddd, M/dd/yyyy} - {1:ddd, M/dd/yyyy}"},
                  ],
                  mobile: "phone",
                  timezone: "Etc/UTC",
                  eventTemplate: $("#event-template").html(),
                  eventTimeTemplate: $("#event-time-template").html(),
                  allDaySlot:false,
                  editable: {
                     update: false,
                     move: false,
                     resize: false,
                     destroy: false,
                     create: true,
                     template: $("#editdate").text()
                  },
                  dataSource: {
                      batch: true,
                      transport: {
                          read: {
                              url: "http://demos.telerik.com/kendo-ui/service/tasks",
                              dataType: "jsonp"
                          },
                          update: {
                              url: "http://demos.telerik.com/kendo-ui/service/tasks/update",
                              dataType: "jsonp"
                          },
                          create: {
                              url: "http://demos.telerik.com/kendo-ui/service/tasks/create",
                              dataType: "jsonp"
                          },
                          destroy: {
                              url: "http://demos.telerik.com/kendo-ui/service/tasks/destroy",
                              dataType: "jsonp"
                          },
                          parameterMap: function(options, operation) {
                              if (operation !== "read" && options.models) {
                                  return {models: kendo.stringify(options.models)};
                              }
                          }
                      },
                      schema: {
                          model: {
                              id: "taskId",
                              fields: {
                                  taskId: { from: "TaskID", type: "number" },
                                  title: { from: "Title", defaultValue: "No title", validation: { required: true } },
                                  start: { type: "date", from: "Start" },
                                  end: { type: "date", from: "End" },
                                  startTimezone: { from: "StartTimezone" },
                                  endTimezone: { from: "EndTimezone" },
                                  description: { from: "Description" },
                                  recurrenceId: { from: "RecurrenceID" },
                                  recurrenceRule: { from: "RecurrenceRule" },
                                  recurrenceException: { from: "RecurrenceException" },
                                  ownerId: { from: "OwnerID", defaultValue: 1 },
                                  isAllDay: { type: "boolean", from: "IsAllDay" }
                              }
                          }
                      }
                  },
                  resources: [
                      {
                          field: "ownerId",
                          title: "Owner",
                          dataSource: [
                              { text: "Alex", value: 1, color: "#f8a398" },
                              { text: "Bob", value: 2, color: "#51a0ed" },
                              { text: "Charlie", value: 3, color: "#56ca85" }
                          ]
                      }
                  ]
              });
              
    },
    
    scrollTopWithFix: function() {
        
        var scroller = app.hotelView.myscroller;
        var touches = scroller.userEvents.touches;
        var dummyEvent = { event: { preventDefault: $.noop } };
        
        var scrollTop = window.scrollTop;

       for (var i = 0; i < touches.length; i ++) {
           touches[i].end(dummyEvent);
       }

        scroller.animatedScrollTo(0, 0);
         scroller.reset();
        
    },
    
    
    showSaveChanges: function() {
        alert('save changes');
        
    },
    
    updateDataSource :function($idfacility,$status) {
       var that = app.hotelView;
       var data = that.occupancyDataSource.data();
        
      if(data != null){
          $.map(data,
            function (dataItem) {
            
                if(dataItem.idfacility == $idfacility){
                    dataItem.iscleaningstatus = $status;
                }
            });
      }  
    },
    
     applyFacilityFilter: function() {
        var that = app.hotelView;
        var toFind =  $("#searchfacilityHotel").val();
        
                         
        that.occupancyDataSource.filter({
            logic: "and",
            filters: [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel},
                {field: "deleted", operator: "equals", value: 0}, 
             
                {field: "facilityname", operator: "contains", value: toFind},
        ]}  
        );
        
        
        
    },
    
    
    beforeShowViewOccupancy: function(e) {
        
        if (typeof app.hotelView.myscroller != 'undefined')
            app.hotelView.myscroller.reset();
        
        app.hotelView.set('hasChanges', false);
        
        $("#roomReady").data("kendoMobileSwitch").check(app.hotelView.occupancy.ready == 1);
        $("#occupancyStatus").removeClass();
        $("#occupancyStatus").addClass("label");
        $("#occupancyStatus").addClass("status" + app.hotelView.occupancy.status.toUpperCase());
        
    },
    
    
    toogleShowTasksAndAlerts: function(e) {
        var that = app.hotelView;
        var showTasks = !that.get('hotelViewOptions.showTasks');
        that.set('hotelViewOptions.showTasks', showTasks);
        if (showTasks == true) {              
            $("#iconShowTasksAndAlerts").css('color','#00bcd4');              
            $("#iconShowTasksAndAlerts").addClass('shadow');              
        }
        else {            
            $("#iconShowTasksAndAlerts").css('color','gray') ;
            $("#iconShowTasksAndAlerts").removeClass('shadow');              
         }
         that.get('occupancyDataSource').read();
        
        
    },
    
    toogleGroup: function(e) {
        var that = app.hotelView;
        var group = !that.get('hotelViewOptions.group');
        that.set('hotelViewOptions.group', group);
        if (group == true) {  
            that.get('occupancyDataSource').group({field: "status", dir: "desc"});
            $("#iconGroupOcupaction").css('color','#38b8a4');              
            $("#iconGroupOcupaction").addClass('shadow');              
        }
        else {
            that.get('occupancyDataSource').group([]);
            $("#iconGroupOcupaction").css('color','gray') ;
            $("#iconGroupOcupaction").removeClass('shadow');              
         }
    },
    
    doGroup: function() {
        return (app.hotelView.get('hotelViewOptions.group') == true);        
    },
    
    
    
    createTaskFromOccupancy: function(e) {
        var occupancy = e.data;        
        //app.reportAlertView.createTaskFromOccupancy(occupancy.idfacility);
        
    },
    
    createAlertFromOccupancy: function(e) {
        var occupancy = e.data;        
        //app.reportAlertView.createAlertFromOccupancy(occupancy.idfacility);
        
    },
    
    
    
    toggleRoomReady: function(e) {
        // ESTO ESTÁ SÚPER JALADO DEL PELO...todo porque no puedo setear //e.data.ready 
         if (!app.isOnline()){ 
             helper.smallBottomAlert("No hay Internet!...");
             return;
         }
        
        if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_OPERATIONS) { 
            var occupancy = e.data;                    
            var newState = (e.data.ready == 1 ? 0 : 1);       
            helper.showLoading('Espere...');
            $smart.setRoomReady(occupancy.idfacility, newState)
            .done(function()  {
                e.data.ready = newState;
                
            if (occupancy.status != 'Desocupada') {
                
                if ($("#broomReady" + occupancy.idoccupancy).length == 1) {                     
                     if ($("#broomReady" + occupancy.idoccupancy).css('color') == "rgb(229, 46, 134)") {              
                        newState = 0;        
                        $("#broomReady" + occupancy.idoccupancy).css('color', "rgb(76, 83, 86)");       
                         
                      }        
                     else {
                         newState = 1;
                         $("#broomReady" + occupancy.idoccupancy).css('color',"rgb(229, 46, 134)"  );                
                     } 
                }
                else //
                 if ($("#broomnotReady" + occupancy.idoccupancy).css('color') == "rgb(229, 46, 134)") {              
                        newState = 0;        
                        $("#broomnotReady" + occupancy.idoccupancy).css('color', "rgb(76, 83, 86)");       
                         
                      }        
                     else {
                         newState = 1;
                         $("#broomnotReady" + occupancy.idoccupancy).css('color',"rgb(229, 46, 134)"  );                
                     } 
                    
            }    
            else // Desocupada
            if ($("#broomReady" + occupancy.idfacility).length == 1) {                     
                     if ($("#broomReady" + occupancy.idfacility).css('color') == "rgb(229, 46, 134)") {              
                        newState = 0;        
                        $("#broomReady" + occupancy.idfacility).css('color', "rgb(76, 83, 86)");       
                         
                      }        
                     else {
                         newState = 1;
                         $("#broomReady" + occupancy.idfacility).css('color',"rgb(229, 46, 134)"  );                
                     } 
                }
                else //
                 if ($("#broomnotReady" + occupancy.idfacility).css('color') == "rgb(229, 46, 134)") {              
                        newState = 0;        
                        $("#broomnotReady" + occupancy.idfacility).css('color', "rgb(76, 83, 86)");       
                         
                      }        
                     else {
                         newState = 1;
                         $("#broomnotReady" + occupancy.idfacility).css('color',"rgb(229, 46, 134)"  );                
                     } 
                    
                    
                    
                    helper.hideLoading();
                })
                .fail(function(error) {
                    //helper.hideLoading();         
                    alert(error);
                }) 
                
            
            }
    },
    
    
    
    
    
    // From View Occupancy
    toggleRoomReady2: function(e) {
        var that = app.hotelView;
        helper.showLoading();    
        if (that.get('occupancy.ready') == 1) {
            $smart.setRoomReady(that.get('occupancy.idfacility'), 0)
            .done(function()  {
                app.hotelView.set('occupancy.ready',0);
                helper.hideLoading();         
                
            })
            .fail(function(error) {
                alert(error);
            }) 
        }
        else {
            $smart.setRoomReady(that.get('occupancy.idfacility'), 1)
            .done(function()  {
                app.hotelView.set('occupancy.ready',1);
                helper.hideLoading();         
            })
            .fail(function(error) {
                alert(error);
            });
        }
    },
    
    
     initCreateTasks: function(e) {
          var that = app.homeView;
        if (helper.isTablet()) {
            $('.sh-label').css('font-size', '24px');
            //$('.sh-select').css('font-size', '1.3em');
            $('.form-control').css('font-size', '20px');
            $('.form-control').css('height', '100%');
            
        }
    },
    
    
    beforeShowCreateTasks: function() {
        var that = app.hotelView;
        
       if (!that.initializeCreateTasks) return;        
        
        helper.showLoading();         
        $smart.getStaff()
        .done(function(staff) {                        
            staff.fetch(function() {
                that.set('staffDataSourceNoGrouping', staff);                         
                var staffView = that.staffDataSourceNoGrouping.view();
                that.set('task.idstaff', staffView[0].idstaff);
                $smart.getTaskTypes()
                .done(function(tasktypes) {            
                    tasktypes.fetch(function() {
                        that.set('taskTypesDataSource', tasktypes);
                        var data = that.taskTypesDataSource.view();
                        // Initialize tasktype object with first tasktype from source.         
                        that.set('task.idtype', data[0].idtasktype);                   
                        //that.set('firstTaskType', data[0].idtasktype);                   
                        helper.hideLoading();   
                        that.initializeCreateTasks = false;
                    })        
                })    
             })   
        })                
    
    },
    
    
    calculateOccupancyStats: function(ds) {
        
        var deferred = $.Deferred();
        
        var that = app.hotelView;
        var totalpax  = 0;
        var numFacilities = 0;
        var total     = 0;
        var entran    = 0;
        var salen     = 0;
                
         $smart.getFacilities(true)
        .done(function(rooms) {
            rooms.fetch(function() {
                var numRooms = rooms.total();
                var view = ds.view();           
                
                for (var i=0; i<view.length; i++) {
                    if (view[i].status == "Sale") salen++;
                    if (view[i].status == "Entra" || view[i].status == "Hospedado") {
                        if (view[i].status == "Entra") entran++;
                        totalpax += view[i].pax;
                        total++;
                    }
                }                
                var occupancyPercentage = Math.round((total / numRooms) * 100);
                that.set('stats.occupancy', occupancyPercentage + '%');
                that.set('stats.pax', totalpax);
                that.set('stats.entran', entran);                
                that.set('stats.salen', salen);                
                
                deferred.resolve();
            })            
        })

        return deferred.promise();
        
        
        /*    
        
        $("#occupancyPorcentage").html(occupancyPercentage);
        $("#guestCount").html(totalpax);
        */
        
        
    },
    
    
    getOccupancy: function() {
        var deferred = $.Deferred();         
        var that = app.hotelView;
                
        if (that.occupancyRead == true) 
            deferred.resolve();
        else {        
            that.occupancyRead = true;                     
            
            $smart.getOccupancy()
            .done(function(ds) {         
                ds.fetch(function() {       
                    app.hotelView.calculateOccupancyStats(ds)
                    .done(function() {
                        app.hotelView.set('noOccupancy', ds.total() === 0);
                        if (app.hotelView.doGroup())
                            ds.group({field: "status", dir: "desc"});           
                        
                        app.hotelView.set('occupancyDataSource', ds);    
                        app.refreshinOccupancy = false;
                        deferred.resolve();                        
                    })
                    
                })
            });
        }
        
        return deferred.promise();
    },
    
     updateOccupancy: function() {        
        var deferred = $.Deferred();                        
        var that = app.hotelView;
         
        app.refreshinOccupancy = true;
        that.occupancyRead = false;
         
        $smart.updateOccupancy()
        .done(function() {                                  
            app.hotelView.getOccupancy()       
            .done(function() {
                helper.hideLoading();
                deferred.resolve();
            })
        })
        .fail(function(error) {            
            app.refreshinOccupancy = false;
            helper.hideLoading();
            deferred.reject(error); 
        });
        return deferred.promise();
    },
    
    
     pullToRefresh: function(e) {              
              
        if (!app.isOnline()){ helper.smallBottomAlert("Falló conexión!"); return;}
        if (app.refreshinOccupancy == true)  return;
        // if (!app.idle) return;
        
        e.view.scroller.pullHandled();                        
        helper.smallBottomAlert('<i class="fa fa-refresh fa-spin "></i>' + "  Refrescando...");
        
      app.refreshinOccupancy = true; 
      $smart.syncToServerAlertsNow().done(function() {
        app.idle = false;
        app.hotelView.updateOccupancy()        
        .done(function() {
            app.refreshinOccupancy = true; 
            $smart.updateAlerts()
              .done(function(hasChanges) { 
                 helper.smallBottomAlert("Listo!");
                 app.refreshinOccupancy = false;
                 app.idle = true;
              })
              .fail(function() {            
                 helper.smallBottomAlert("Falló conexión!");
                 app.refreshinOccupancy = false;
                 app.idle = true;
              }); 
        })                
        .fail(function() {            
            helper.smallBottomAlert("Falló conexión!");
            app.idle = true;
        })        
      })        
    },
    
    
    toggleShowByEntries: function() {
          return;
        var elem = $("#occupancyEntriesInfo");
        
        if (elem.hasClass('selectedData')) {
            elem.removeClass('selectedData');            
        }
        else {
            elem.addClass('selectedData');
        }
    },
    
    
     toggleShowByExits: function() {
         return;
      
        var elem = $("#occupancyExitsInfo");
        
        if (elem.hasClass('selectedData')) {
            elem.removeClass('selectedData');            
        }
        else {
            elem.addClass('selectedData');
        }
    },
    
    
    
    toggleSelectOccupancy: function(e) {        
        //e.item.toggleClass("listview-selected");        
        var id = e.data.idfacility; //e.touch.target.data().id;
        //$("#occupancy" + id).parent().toggleClass("listview-selected");
        $(".facility" + id).parent().toggleClass("listview-selected");
        
        //e.target.toggleClass("listview-selected");
    },
    
    viewTask: function(e) {
        var idtask = e.touch.target.data().idtask;              
        
        $smart.getTask(idtask)
        .done(function(task) {
            app.homeView.isAlert = false;
            app.homeView.checkingFromProfile = true;
            app.homeView.prepareTaskInfo(task)
            .done(function() {
                app.mobileApp.navigate('components/homeView/viewTaskHousekeeper.html');    
             })                                    
        })
    },
    
    viewAlert: function(e) {
        var idalert = e.touch.target.data().idalert;
         $smart.getAlert(idalert)
        .done(function(alert) {
            app.homeView.isAlert = true;
            app.homeView.checkingFromProfile = true;
            app.homeView.prepareAlertInfo(alert)
            .done(function() {
                app.mobileApp.navigate('components/homeView/viewAlertHousekeeper.html');    
             })                                    
        })
        
    },
        
    
    
   showOccupancy: function(e) {       
       var that = app.hotelView;
       that.set('occupancy',e.data);       
       that.set('occupancy.facility', helper.getFacilityName(e.data.idfacility));
       that.set('occupancy.facilitytype', helper.getFacilityTypeName(e.data.idfacility));
              
       
       if (e.data.checkin != null)       
           that.set('occupancy.ingreso', $date.datefNoUTC(e.data.checkin, "DD MMMM", true));
       else
           that.set('occupancy.ingreso', 'n/a');
       if (e.data.checkout != null)       
           that.set('occupancy.salida', $date.datefNoUTC(e.data.checkout, "DD MMMM", true));
       else
           that.set('occupancy.salida', 'n/a');
       
       that.set('occupancy.hasguestlog', e.data.guestlog !== null && e.data.guestlog !== '');
       that.set('occupancy.hascomplaints', e.data.complaints !== null && e.data.complaints !== '');
       
       that.set('occupancy.showComments', e.data.status != 'Desocupada');
       
       that.set('occupancy.guestactivity', helper.getGuestActivityName(e.data.guestactivity));
              
       
       
       app.mobileApp.navigate('components/hotelView/viewOccupancy.html');                                
   },
    
    
    goCreateTasks: function(e) {        
        var that = app.hotelView;
        that.set('selectedFacilities', []);
        var facilities = [];
        
        // Get selected facilities....
        $('.listview-selected .facilityinfo').each(function(index) {                        
            facilities.push({idfacility: $(this).data('id'), stats: $(this).data('stats') });
        });
        facilities = that.removeDuplicatesFromObjArray(facilities,'idfacility');
        
        that.set('selectedFacilities', facilities);        
        app.mobileApp.navigate('components/hotelView/createTasks.html');                                
        
    },
    
    
    removeDuplicatesFromObjArray:  function(arr, field) {
        var u = [];
        arr.reduce(function (a, b) {
            if (a[field] !== b[field]) u.push(b);
            return b;
        }, []);
        return u;
    },
    
    
    createTasks: function(e) {        
        var that = app.hotelView;
        helper.pleaseWait();
        that._createTasks()
        .done(function() {
            helper.hideLoading();
            app.sounds.snap.play();            
            // Send push notifications...
             if (that.get('task.idstaff') !== 0)  
                that.sendPushNotificationTasksAssigned(that.get('task'));   
            that.goBack();
            //Refresh...since we need to show details in viewHotel...
        })
    },
    
    
     _createTasks: function(e) {                 
         
         var that = app.hotelView;
        
         var promises = [];
         var facilities = that.get('selectedFacilities');
         that.numTasksAssigned = facilities.length;
         
        
        for(var i=0; i<facilities.length; i++) {                
            promises.push(that.createTask(facilities[i]));
        }           
        app.homeView.justLoggedIn = true;        
        $smart.updateTasks()
        .done(function name() {
             $smart.getOccupancy()
            .done(function(ds) {             
            ds.fetch(function() {                                    
                app.hotelView.set('noOccupancy', ds.total() === 0);
                ds.group({field: "status", dir: "desc"});           
                app.hotelView.set('occupancyDataSource', ds);                   
           })
        })
        	
        });                               
        
        return $.when.apply($,promises);
        
    },
    
    
    createTask: function(facility) {
        var that = app.hotelView;
        var deferred = $.Deferred();        
        
        // Create task remotely, but do not syncronize locally yet, to avoid conflicts.
        $smart.createTask({
            createdby     : app.user.idstaff,            
            createddate   : $date.timestamp(),
            start         : $date.timestamp(), //that.get('task.start'),
            //instructions  : that.get('task.instructions'),
            idtype        : that.get('task.idtype'),
            idstaff       : that.get('task.idstaff'),
            idpriority    : 2, // Medium for now
            idfacility    : facility.idfacility,               
        }, false) 
        .done(function() {            
            
            
            
            deferred.resolve();
        });        
        return deferred.promise();        
    },
    
    
     sendPushNotificationTasksAssigned: function(task) {     
        var that = app.hotelView;        
        
        // Si yo mismo cree la tarea, no enviar push
        if (task.idstaff === app.user.idstaff) return;        
        var quien = app.user.fullname.split(" ")[0];
        var customdata = {sound: globals.SOUND_ALERT_DING };                        
        
        var message = quien + " te asignó " + that.numTasksAssigned + " tarea(s) de " + helper.getTaskTypeName(task.idtype);
        $smart.sendPushNotification('Tarea(s)',task.idstaff, message, customdata);                                               
     },
    
    startCleaningTaskFromSlider: function(idfacility,facilityname,DND,idalertasig) {
        var deferred = $.Deferred();
         var that = app.hotelView;  

        if(idalertasig !== 0 && idalertasig !== null){
          
         /* if(!app.isOnline()){
              helper.showDialogMessage("Occurio un problema","No tiene conexion a internet");
              deferred.resolve(false);
          }else{*/
            
          helper.showLoading('Iniciando Tarea...'); 
         /* $smart.updateAlerts()
          .done(function(hasChanges) {*/    
           app.hotelView.findAlert(idalertasig,0)
            .done(function(alert){
               if(alert !== null){
                  if(!DND){  
                    $smart.getAlertTypesCleaningTask()
                     .done(function(result) {
                       result.fetch(function(){                        
                       var alertType = result.view().at(0);    
                       console.log("alertType",alertType);
                       $smart.createAlertChecklist(alertType.idchecklist,alert.idalert,alert.uuid)
                         .done(function() { 
                           $smart.startAlert(alert)
                            .done(function(startdate){  
                             app.hotelView.updateDataSource(idfacility,1);
                             localStorage.setItem("newuuid", alert.uuid);
                       
                             app.sounds.ding.play(); 
                             helper.hideLoading();
                             $smart.syncToServerAlertsNow();
                             deferred.resolve(true);
                            });
                         });
                      });
                    }).fail(function() { helper.hideLoading(); deferred.resolve(false);});
                  }else{
                    $smart.markAlertAsDND(alert,app.user.idstaff)
                      .done(function(){ 
                        $smart.setRoomCleaninigStatus(idfacility, 4,0,app.user.fullname)
                         .done(function()  {  
                             app.hotelView.updateDataSource(idfacility,4);
                             app.sounds.ding.play(); 
                             helper.hideLoading();
                             $smart.syncToServerAlertsNow(); 
                             deferred.resolve(true);
                         });
                      });
                  }
               }else{
                 helper.hideLoading();
                 deferred.resolve(false);
               }
            });
          //});
         //}
        }else{
            $smart.getAlertTypesCleaningTask()
             .done(function(result) {
                 result.fetch(function() {                        
                   var alertType = result.view().at(0);    
                   that._createCleaningTask(idfacility,alertType,facilityname,DND).done(function(){
                     deferred.resolve(true);
                   })
                })  
             })
             .fail(function() {deferred.resolve(false);})
        }
        
         return deferred.promise();
    },
    
  
    _createCleaningTask: function(idfacility,alertType,facilityname,markDND) { 
         var deferred = $.Deferred();
         var idstatus = globals.ALERT_STATUS_IN_PROGRESS;
         var tag = globals.TAG_TAKEN;
         var action = globals.ACTION_STARTED;
         var roomstatus = 1;
        /* var idalert = idalertasig;
        if(idalertasig != null || idalertasig == 0){
             idalert = globals.MAX_INT;
        }*/
         if(!markDND){
             helper.showLoading('Creando alerta...'); 
         }else{
             helper.showLoading('Marcando como no molestar...'); 
             idstatus = globals.ALERT_STATUS_RESOLVED;
             tag = globals.TAG_DND;
             action = globals.ACTION_RESOLVED;
             roomstatus = 4
         }
        
        
         var that = app.hotelView;
         that.newuuid = helper.guid();
         $smart.pauseSyncWorker();  
        
         $smart.createAlert({                        
            idalert       : globals.MAX_INT,      
            uuid          : that.newuuid,
            insync        : false,
            byhousekeeper : 1,
            byguest       : 0,            
            idhotel       : app.hotel.idhotel,      
            iscleaningtask : 1,
            idcategory    : 2,
            idtypecategory: alertType.idcategory,
            idchecklist   : alertType.idchecklist,
            name          : "Limpieza "+facilityname,
            idstaff       : app.user.idstaff,
            idmodule      : 3,
            idtype        : alertType.idalerttype,
            idtypename    : alertType.name,
            iditem        : 0,
            iditemname    : "",
            idlocation    : null,
            idpriority    : 2,
            idstatus      : idstatus,
            idfacility    : idfacility,
            notes         : null,
            pictures      : null,
            tag           : tag ,
            action        : action,
            reporteddate  : $date.timestampUTC(),
            startdate     : $date.timestampUTC(),
            finishdate    : $date.timestampUTC(),
            resumedate    : 0,
            willcheckdate : 0,
            reportedby    : app.user.idstaff,            
            assignedby    : null,
            expectedduration : alertType.expectedduration
        })               
        .done(function() {   
          
          $smart.setRoomCleaninigStatus(idfacility, roomstatus,that.newuuid,app.user.fullname)
          .done(function()  {  
            if(!markDND){
                app.idle = false;
                if(alertType.idchecklist != 0 && alertType.idchecklist != null){
                     app.homeView.alert.idchecklist = alertType.idchecklist;
                 
                    $smart.createAlertChecklist(alertType.idchecklist,globals.MAX_INT,that.newuuid)
                        .done(function() { 
                            helper.hideLoading();
                            app.hotelView.updateDataSource(idfacility,1);
                            app.sounds.ding.play(); 
                            localStorage.setItem("newuuid", that.newuuid);
                            setTimeout(function() {      
                                 $smart.resumeSyncWorker();
                                 app.idle = true;     
                                 $smart.syncToServerAlertsNow();  
                             },500); 
         
                            deferred.resolve(true);
                        });
                   
                }else{
                        helper.hideLoading();
                        app.sounds.ding.play(); 
                        $smart.resumeSyncWorker();
                        deferred.resolve(false);
                } 
           }else{
               
               alert.facility = facilityname;
               app.hotelView.updateDataSource(idfacility,4);
               helper.hideLoading();
               app.sounds.ding.play(); 
               $smart.resumeSyncWorker();
               app.idle = true; 
               console.log("paso212",idfacility);
               deferred.resolve(false);
                
           }
          })
        })
        .fail(function(error) {
            app.idle = true;
            $smart.resumeSyncWorker();
            deferred.resolve();
            if (error !== 0)
               helper.showAlert(error,'Error')  ;
               helper.hideLoading();
        })
       return deferred.promise();
    },
    
    showFinishcleaningtask: function(uuid,idalert,idfacility) {  
       var that = app.homeView;
       
       helper.showDialogYN('¿Desea finalizar la tarea?', 
            function(solutiontext) {
             that.finishFromSlider = true;
             solutiontext = "Habitación limpia";
               
             app.hotelView.findAlert(idalert,uuid)
               .done(function(alert){
                if(alert != null){  
                  $localdb.updateAlertchecklistForAlertGuid(alert.idalert, uuid)
                    .done(function() {
                             
                     that.finishAlert(solutiontext); 
                     $smart.setRoomCleaninigStatus(idfacility, 100,0,"")
                       .done(function()  {
                          sliderOcuppacy.finish();
                          app.hotelView.updateDataSource(idfacility,100);
                          helper.hideLoading();
                          $smart.syncToServerAlertsNow();
                       })
                    })
                }
               });
           }, false);        
    }, 
    showPausecleaningtask: function(uuid,idalert,idfacility) {  
       var that = app.homeView;
     
       helper.showDialogYNJ('¿Desea Pausar la tarea?', 
            function(solutiontext) {
                that.finishFromSlider = true;
               
                app.hotelView.findAlert(idalert,uuid)
                .done(function(alert){
                 if(alert != null){     
                      that.pauseAlert(solutiontext); 
                      $smart.setRoomCleaninigStatus(idfacility, 2,0,0,app.user.fullname)
                         .done(function()  {
                             sliderOcuppacy.pause();
                             app.hotelView.updateDataSource(idfacility,2);
                             helper.hideLoading();
                             $smart.syncToServerAlertsNow();
                         })
                 }
                });
            }, false);        
    },
    showReanudarcleaningtask: function(uuid,idalert,idfacility) {  
       var that = app.homeView;
     
        
       helper.showDialogYN('¿Desea Reanudar la tarea?', 
            function(solutiontext) {
                that.finishFromSlider = true;
               
                app.hotelView.findAlert(idalert,uuid)
                .done(function(alert){
                  if(alert != null){   
                      that.resumeAlert(); 
                      $smart.setRoomCleaninigStatus(idfacility, 1,0,"")
                         .done(function()  {
                             sliderOcuppacy.resume();
                             app.hotelView.updateDataSource(idfacility,1);
                             helper.hideLoading();
                             $smart.syncToServerAlertsNow();
                         })
                  }
                });
            }, false);        
    },
    
    showstartcleaningtask: function(idalert,facilityname) {  
       var that = app.homeView;
       var deferred = $.Deferred();
       helper.showDialogYN('¿Desea inciar la limpieza?', 
            function(solutiontext) {
                  
                  deferred.resolve(true); 
                
               }, false);     
        return deferred.promise();
    },
    
    showmarkDND: function(idfacility,facilityname,idalerttosig) {  
       var that = app.homeView;
       var deferred = $.Deferred();
      if(!app.isOnline() && idalerttosig !== 0 && idalerttosig !== null){
              helper.showDialogMessage("Occurio un problema","No tiene conexion a internet");
              deferred.resolve(false);
      }else{  
       helper.showDialogYNJ('¿Desea Marcar como no molestar?', 
            function(solutiontext) {
                if(solutiontext == " ") solutiontext = "No molestar";
                console.log("idalerttosig",idalerttosig);
                  app.hotelView.startCleaningTaskFromSlider(idfacility,facilityname,true,idalerttosig)
                    .done(function(){
                      app.hotelView.findAlert(idalerttosig,app.hotelView.newuuid)
                       .done(function(alert) {
                           console.log("alert===>",alert);
                           console.log("that.newuuid",app.hotelView.newuuid);
                         $smart.createComment(alert, app.user.idstaff, solutiontext, null)
                            .done(function() {
                                $smart.syncToServerAlertsNow();
                                deferred.resolve(true); 
                            });
                        });
                    });
               }, false);  
        $("#dialogYNJreason").val(" ");
      }
        return deferred.promise();
    },
    
    showChecklist: function(uuid,idalert) {  
       var that = app.homeView;
      
        app.hotelView.findAlert(idalert,uuid)
         .done(function(alert){
           if(alert != null){    
             if(idalert == null || idalert == 0){
               app.homeView.alert.idalert = globals.MAX_INT;
             }else{ 
                app.homeView.alert.idalert = idalert;
             }
              app.homeView.alert.idchecklist = alert.idchecklist;
              app.homeView.alert.uuid = uuid;
                    
              setTimeout(function() {                                        
                 app.homeView.showChecklist();        
              },200); 
           }
         });
   },
    
    findAlert: function(idalert,uuid) { 
    
       var that = app.homeView;
       var deferred = $.Deferred();
        
         if(idalert == null || idalert == 0){
            $smart.getAlertbyuuid(uuid)
               .done(function(alert) {
                   if(alert == null){
                      helper.showDialogMessage("Occurio un problema", "Intente hacer un refresh de ocupación!1");
                      deferred.resolve(null); 
                  }else{
                   that.prepareAlertInfo(alert)
                       .done(function() {
                         deferred.resolve(alert); 
                      })
                  }
               })
        }else{
            $smart.getAlert(idalert)
               .done(function(alert) {
                  if(alert == null){
                      helper.showDialogMessage("Occurio un problema", "Intente hacer un refresh de ocupación!2");
                      if(app.isOnline()){
                          $smart.updateAlerts();
                      }
                      deferred.resolve(null); 
                  }else{
                      that.prepareAlertInfo(alert)
                       .done(function() {
                          deferred.resolve(alert); 
                       })
                  }
               })
        }
      return deferred.promise();
    }
});

// START_CUSTOM_CODE_homeView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    app.hotelView.set('title', 'Eventos');
    
    
})();
// END_CUSTOM_CODE_homeView
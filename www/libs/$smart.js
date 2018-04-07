// Matthias Malek
// SuisseWorks, 2015

// Module Pattern Object for coordinating calls between objects.
// This is a Facade/Mediator object,

(function(window) {
    
    function Smart() {
                                
        var DEBUG      = true;                
        var log = function(msg) {
            if (DEBUG) console.log(msg);
        }
        
        window.syncWorker = null;
        
        window.intervalRefreshStaff     = null;
        window.intervalSyncToServer     = null;
        window.intervalRefreshOccupancy = null;
        
        window.pauseIntervals           = false;
        window.resumeRefreshTimeout     = null;
        
        window.updatecurrentactivity    = null;
        
        
        this.sendGeolocationEvery     = 2; // After how many pings to server, we send user lat/long
        this.pingCount                = 0;
        
        
                
                         
        
/*********************************** LOGIN ******************************************************************/
        
        this.isLoggedIn = function() {
            return loginController.isLoggedIn();
        }        
        
        this.login = function(code, username, password) {            
           return loginController.login(code, username, password);                    
        }
        
        
        this.logout = function() {                       
            loginController.logout();            
            app.profileView.justLoggedIn = true;
            app.profileView.ishousekeeper = false;
            app.homeView.justLoggedIn = true;
            app.homeView.initializeCreateTask = true;
            app.hotelView.initializeCreateTasks = true;
            app.hotelView.justLoggedIn = true;
            
            $smart.setAvailability(app.user.idstaff,0)
            .done(function(result) {                                                                                        
                helper.sendPushNotificationDONE();
             });
            
            // worker
            if (window.syncWorker !== null)
                window.syncWorker.terminate(); 
            window.syncWorker = null;
            
            clearInterval(window.intervalRefreshStaff);
            clearInterval(window.intervalSyncToServer);
            clearInterval(window.intervalRefreshOccupancy);
       
        }
        
       
        this.showExitDialog = function() {                
            helper.showDialogYN("<i  class='mdi mdi-logout c-main' style='font-size: 20px;'></i>     ¿Está seguro que desea salir?", function() {$smart.logout()});
        },
        
        
        this.closeMessageDialog = function(e) {        
             app.homeView.get('dialogMessage').data("kendoWindow").close();    
        },
                
        this.showMessageDialog = function(msg) {                
            helper.showDialogMessage('',msg,null);
        },
        

        this.onDingDoneClick = function(e) {           
            var that = this;
            var available = $("#ding-done").data("kendoMobileSwitch").check();
            
            
            
            app.user.available = available;
            app.user.insync    = false;
            $("#syncUserAvailable").show();
            $smart.pingNow(available);
            
            localStorage.setItem("dingdone:available", available);
            
            app.homeView.set('dingdone', available);
            app.profileView.set('dingdone', available);
            app.user.available = available; 
            
            if (app.user.available == 0)
                $("#userfullname").html('NO DISPONIBLE');
            else
                $("#userfullname").html(app.user.fullname);
            
            
        },
        
        
        
        
        
       

        
/********************************* INIT ***************************************************************/                
        this.init = function(e) {
            
            var that = this;
            
            app.idle = true;             
            that.pauseIntervals = false;
                      
            
            helper.smallBottomAlertRestore = function() {
                $(".bottomMessage").html('<i class="mdi mdi-checkbox-marked-circle"></i>');
}

            
            app.homeView.set('profile.avatar',app.user.avatar);
            app.homeView.set('profile.fullname', app.user.fullname);               
            app.homeView.set('profile.role',  helper.getRole(app.user.role));     
            app.homeView.set('profile.hotel',  app.hotel.name);     
            
            $('#userfullname').html(app.user.fullname);
            
            /*
            if (app.version != app.version_latest && app.version_latest != null) {
                $("#divnewversion").show();
                $("#hrefnewversion").text("Descargar versión " + app.version_latest);
                
                if (helper.isiOS()) {
                    $("#hrefnewversion").prop("href", app.backendurl + "app/ios/");                    
                }
                else {
                    app.download = { android: app.backendurl + "app/android/dingdone.apk" };
                    $("#hrefnewversion").prop("href", app.backendurl + "app/android/");     
                }
                
            }*/
            
            
            app.homeView.set('profile.isHousekeeper', app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAINTENANCECHIEF);
            helper.initTabStrip(e);                                      
            
            app.user.insync = false;
            app.homeView.set('dingdone', app.user.available);
            
            
                       
            setTimeout(function() {
               if (typeof app.profileView != 'undefined')
                   app.profileView.set('dingdone', app.user.available);
               
           }, 1000)
           
           $("#ding-done").data("kendoMobileSwitch").check(app.user.available == 1);
           

            
            // Select Home tabstrip
            helper.selectTabStripTab(0);            
            helper.preparePullToRefresh(e, function() { app.homeView.pullToRefresh(e) });                      
            app.homeView.set('profile.hotel',  app.hotel.name);     
            app.homeView.currentTab = null;
            
            
            // UPDATE OCCUPANCY EVERY XX TIME
          /*  clearInterval(window.intervalRefreshOccupancy);            
            window.intervalRefreshOccupancy = setInterval(function() {                                
                
                if (!app.idle) return;
                app.idle = false;
                
               
                app.hotelView.updateOccupancy()
                .done(function() {
                    app.idle = true;
                     if ( app.user.role === globals.ROLE_OPERATIONS || app.user.role === globals.ROLE_HOUSEKEEPER ||
                         app.user.role === globals.ROLE_MAID) {
                               var currentView = app.mobileApp.view().id; // Get current view..
                                if (currentView === "components/homeView/housekeeper.html" ||
                                    currentView === "components/homeView/maintenancechief.html" ||
                                    currentView === "components/homeView/maid.html" ||
                                    currentView === "components/homeView/maintenance.html" ||
                                    currentView === "components/homeView/manager.html" || 
                                    currentView === "components/homeView/operations.html") {
                                        
                                    console.info('UPDATE OCCUPANCY');    
                                    //app.homeView.updateOccupancyStateToCleaningTasks();
                                }
                             }
                })
                .fail(function() {
                   app.idle = true;  
                })
             },60000 * 30);    // cada media hora
            */
            
            // UPDATE STAFF EVERY XX TIME
           /* clearInterval(window.intervalRefreshStaff);            
            window.intervalRefreshStaff = setInterval(function() {                
                that.updatingStaff();
                
            },60000 * 5); // cada 10 min...
            */
          
            
            
            // DO SYNC TO SERVER EVERY XX SECS...
                
            clearInterval(window.intervalSyncToServer);
            window.intervalSyncToServer = setInterval(function() {               
                that.syncToServer();                                                                                                          
            
            }, 10000);
            
            
            
                       
            
            // SYNC WORKER
           // that.initSyncWorker();
            
            };
        
        
            this.updateCurrentActvityData = function() {
                
            }

        
            this.syncToServer = function() {
                var deferred = $.Deferred();
                
                var that = this;
                
                
                //console.info('SYNC TO SERVER...');
                
               // console.info('Pinging...');
                
                //console.log("Pause ==>",app.idle );
                //console.log("Pause ==>",window.pauseIntervals);
                
                
                if (app.idle == false ||  window.pauseIntervals == true || !app.isOnline() )  {
                    //console.info('Paused or not idle');
                    deferred.resolve();
                }
                else {
                    
                    app.idle = false;
                    
                    syncController.needToSyncToServer()  
                    .done(function(needsSync) {
                        //console.info('Needs sync : ' + needsSync );
                        
                        if (needsSync == false) {
                            //console.info('No sync Needed'); 
                            helper.smallBottomAlert('<i class="mdi mdi-cloud-upload c-main3"></i>' + ' <i class="mdi mdi-check "></i>');
                            app.idle = true;
                            deferred.resolve();
                        }
                        else {
                            that.pingData() 
                            .done(function(data) {                    
                                $api.ping(data)
                                .done(function(result) {
                                    if (result != null) {
                                         app.newversion =  (parseInt(result.replaceAll('.','')) > 
                                            parseInt(app.version.replaceAll('.','')));     
                                        app.homeView.set('newVersion', app.newversion);
                                        console.log("app.newversion",app.newversion);
                                        if(app.newversion){
                                            $("#divnewversion").show();
                                            $("#hrefnewversion").html("Nueva versión "+result);
                                        }
                                        }
                                    
                                    if (app.user.insync == false) {
                                        app.user.insync = true;  
                                        //that.updatingStaff();
                                    }
                                     $("#syncUserAvailable").hide();
                                    
                                    helper.smallBottomAlertRestore();
                                    syncController.syncAlertsToServer()
                                    .done(function(count) {                                                                
                                        console.info(count);                                      
                                            syncController.syncActionLogToServer()
                                            .done(function() {      
                                                syncController.syncAlertCheckListToServer()
                                                .done(function() {
                                                    helper.smallBottomAlert('<i class="mdi mdi-cloud-upload c-main3"></i>' + ' <i class="mdi mdi-check-all"></i>');                                     
                                                    app.idle = true;
                                                    deferred.resolve()
                                                })
                                            })
                                            .fail(function() {
                                                helper.smallBottomAlert('<i class="fa fa-info  c-main4 "></i>' + " ...");
                                                app.idle = true;
                                                deferred.resolve();
                                            })
                                            
                                    })
                                    .fail(function() {
                                        helper.smallBottomAlert('<i class="fa fa-info  c-main4 "></i>' + " ...");
                                        app.idle = true;
                                        deferred.resolve();
                                    })
                                })
                                .fail(function() {                            
                                    helper.smallBottomAlert('<i class="fa fa-refresh fa-spin c-main4 "></i>' + "  Buscando red...");
                                    app.idle = true;
                                    deferred.resolve();
                                })
                                
                            })
                            .fail(function() {
                                app.idle = true;
                                deferred.resolve();
                            })                    
                        }
                        
                       
                    }).fail(function() { deferred.resolve(false)})
                }
                
                return deferred.promise();
                
            }
        
        
        
            // just alerts, not actionlog..TO BE CALLED FOR INMEDIATE SYNC
            this.syncToServerAlertsNow = function(reload) {                
                var that = this;
                var deferred = $.Deferred();
               
               
                if (app.idle == false ||  window.pauseIntervals == true || !app.isOnline() )  {
                    console.info('Paused or not idle');
                    deferred.resolve();
                }else{
                
                    syncController.needToSyncToServer()  
                    .done(function(needsSync) {
                    
                        if (!needsSync) {
                             deferred.resolve();
                        }
                        else {
                            app.idle = false;
                            syncController.syncAlertsToServer()
                            .done(function(count) {     
                                app.idle = true;
                                console.info(count);
                            
                                if (reload == false)
                                    deferred.resolve();
                                else {
                                    app.homeView.reloadAlerts(count)
                                    .done(function() {
                                        app.idle = true;
                                        deferred.resolve();
                                    })                                
                                }
                            
                            })
                            .fail(function() {
                                helper.smallBottomAlert('<i class="fa fa-info  c-main4 "></i>' + " ...");
                                app.idle = true;
                                deferred.resolve();
                            })   
                        }
                    })  
                }
                return deferred.promise();
            }
        
            
        
            this.syncAlertsNOW = function() {
                setTimeout(function() {
                    $smart.syncToServerAlertsNow(false)
                    .done(function() {
                    })                
                 },100);
            }
        
        
            this.syncToServerActionLogNow = function() {
                var that = this;
                var deferred = $.Deferred();
                
              
                
                syncController.syncActionLogToServer()
                .done(function() {                                         
                    helper.smallBottomAlert('<i class="mdi mdi-cloud-upload c-main3"></i>' + ' <i class="mdi mdi-check-all"></i>');                                     
                    app.idle = true;
                    deferred.resolve()
                })
                .fail(function() {
                    helper.smallBottomAlert('<i class="fa fa-info  c-main4 "></i>' + "  Falló Sincronizar actionLog al Servidor...");
                    app.idle = true;
                    deferred.resolve();
                })
                
                return deferred.promise();
                                            
            }
        
             this.syncActionLogNOW = function() {
                setTimeout(function() {
                    $smart.syncToServerActionLogNow()
                    .done(function() {
                    })                
                 },100);
            }
        
        
            this.pingNow = function(available) {
                $smart.pingData() 
                .done(function(data) {                                         
                    $api.ping(data)
                    .done(function(result) {
                        console.info(result);
                        $("#syncUserAvailable").hide();
                    })
                    .fail(function(result) {
                       $("#syncUserAvailable").hide();
                       $("#ding-done").data("kendoMobileSwitch").check(!available);
                        
                    })                                        
                })
            }
            
        
         
            this.updatingStaff = function() {
                if (app.idle == false) return;
                
                console.info('ACTUALIZANDO STAFF');
                app.idle = false;        
                $smart.updateStaff()
                .done(function(haschanges) {   
                    $smart.getStaffDetails()
                    .done(function(staff) {
                        staff.fetch(function()  {                                                    
                            app.homeView.countCollaborators(staff); // needs to be done before grouping
                            app.homeView.set('staffDataSource', staff);                                
                            staff.group({field: "available", dir: "desc"});                          
                            app.profileView.set('staffDataSource',staff);                                                            
                            app.idle = true;
                            helper.smallBottomAlert("Listo!");
                        })
                    })
                 })                
                .fail(function() {                    
                    app.idle = true;
                    helper.smallBottomAlert("Falló conexión!");
                })        
                
            }
        
        this.pingData = function() {
            var deferred = $.Deferred();
                        
            
            /*var options = {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            };*/
            
            var data = {idstaff: app.user.idstaff, available: app.user.available == true ? 1 : 0};
            deferred.resolve(data);
            
            /// NOT WORKING BECAUSE SITE NEEDS TO BE HTTPS
            // See https://goo.gl/rStTGz
            
            // PLUGIN
            //http://www.transistorsoft.com/shop/products/cordova-background-geolocation
           /*             
            if (this.pingCount < this.sendGeolocationEvery) {             
                this.pingCount++;
                deferred.resolve(data);
             }
            else {
                this.pingCount = 0;
                navigator.geolocation.getCurrentPosition(                    
                    function(pos) {
                        console.info(pos);
                        data["latitude"] = pos.coords.latitude;
                        data["longitude"] = pos.coords.longitude;
                        deferred.resolve(data);
                    }, 
                    function(err) { console.warn(err.message); deferred.resolve(data);}, 
                    options);
                
            }
            */
            
            
            return deferred.promise();
            
        }
        
        
        
        
         this.initSyncWorker = function() {
            // Check if Web worker support
                           
            var that = this;
            if (typeof(Worker) !== 'undefined') {
                if (window.syncWorker === null) {                    
                    window.syncWorker = new Worker('./libs/workers/syncworker.js');
                    window.syncWorker.addEventListener('message', function(e) {                        
                        that.onMessageSyncWorker(e);
                    });
                    taskController.getMaxLastModifiedAlerts()
                    .done(function(lastmodified) {                        
                        var _lastmodified = (lastmodified == null ? null : $date.toMySQLFormat(lastmodified));
                        var limit = localStorage.getItem("limit");//limite de alertas a obtener
                        console.info('INIT SYNC WORKER');
                       
                        window.syncWorker.postMessage({
                            message: 'init', 
                            idhotel: app.hotel.idhotel,
                            idstaff: app.user.idstaff,
                            role   : app.user.role,
                            apiurl : $api.getURL(), 
                            limit  : limit,
                            alertsinterval: 15, // segundos                                
                            maxlastmodifiedalerts: _lastmodified, //$date.toMySQLFormat(lastmodified)});                                                                            
                         });
                                                
                        window.syncWorker.postMessage({message: "start"});                            
                       
                    })                    
                }
            }
        }


        
        this.pauseSyncWorker = function() {
            window.pauseIntervals = true;
            if (window.syncWorker == null) return;
            window.syncWorker.postMessage({message: "pause"});                                                     
            
        }
        
        this.resumeSyncWorker = function() {
            window.pauseIntervals = false;
            if (window.syncWorker == null) return;
            window.syncWorker.postMessage({message: "resume"});                                         
        }
        
        
        
        this.pauseSyncToServer = function() {            
            window.pauseIntervals = true;
        }
        
        this.resumeSyncToServer = function() {            
            window.pauseIntervals = false;
        }
        
        

/********************************* WORKERS STUFF *********************************************************/                                
       this.onMessageSyncWorker = function(e) {
           if (!app.idle || window.pauseIntervals) return;
           else {
                app.idle = false;
               // console.log('Worker says: ' + e.data);
                //console.log(e.data);
                      //  console.log("paso-> -2");    
                var that = this;
                app.ignoreErrors = true;
                var data = JSON.parse(e.data);                        
                app.ignoreErrors = false;            
                
               if (typeof data  == 'undefined' || data == null) {app.idle = true; return;}
               
                if (data.length > 0 ) { // udated alerts were returned
                        // we don´t peform updates is app is not idle...
                            
                    // We will perform updates only if we are at home (for now)
                   
                    var currentView = app.mobileApp.view().id; // Get current view..
                   
                    if (currentView === "components/homeView/housekeeper.html" ||
                        currentView === "components/homeView/maintenancechief.html" ||
                        currentView === "components/homeView/maid.html" ||
                        currentView === "components/homeView/maintenance.html" ||
                        currentView === "components/homeView/manager.html" || 
                        currentView === "components/hotelView/view.html" || 
                        currentView === "components/homeView/operations.html") {
                           
                            syncController.islocalDataDirty()
                            .done(function(dirty) {
                                if (!dirty) {                            
                                     syncController.synchronizeFromServer($localdb.db.Alerts, data)
                                    .done(function() {
                                        taskController.refreshData($localdb.db.Alerts)
                                        .done(function() {                                
                                            app.homeView.refreshAlerts()
                                            .done(function() {  
                                                app.homeView.refreshData(true);  
                                                //app.sounds.snap.play();  
                                                helper.smallBottomAlert('<i class="mdi mdi-cloud-download c-main"></i>' + ' <i class="mdi mdi-check-all "></i>');
                                                app.idle = true;                                    
                                                taskController.getMaxLastModifiedAlerts()
                                                .done(function(lastmodified) {
                                                    if (window.syncWorker != null)
                                                        window.syncWorker.postMessage({message: "updatelastmodifiedalerts", maxlastmodifiedalerts: $date.toMySQLFormat(lastmodified)});                                         
                                                }) 
                                            })                                
                                        })                 
                                    })
                                    .fail(function() {
                                        app.idle = true;
                                    })
                                }
                                else
                                    app.idle = true;                            
                            })
                     }
                }
               else {
                   app.idle = true;
                   helper.smallBottomAlert('<i class="mdi mdi-cloud-download c-main"></i>' + ' <i class="mdi mdi-check "></i>');
               }
               
               
           }
           
           
               
       }

        
/********************************* GENERAL ***************************************************************/                        
        
       this.getPriorities = function() {      
           return taskController.getPriorities();
       } 
                
       this.sendPushNotification = function(title, idstaff, message, customdata) {
           return everliveController.sendPushNotification(title, idstaff,message, customdata);
       }
        
       this.sendPushNotificationWithReminder = function(remind, activitytype, idactivity, title, idstaff, message, customdata) {
           return everliveController.sendPushNotificationWithReminder(remind, activitytype, idactivity, title, idstaff, message, customdata);
       }
        
       this.goSettings = function() {
           app.mobileApp.navigate('components/settingsView/view.html');                        
       }

       this.getNewVersionURL = function(condition) {
           return $api.getNewVersionURL(condition);
       }
        

 /********************************* ALERT TYPES ***************************************************************/                
        
        this.getAlertTypes = function(iditemtype, isTask) {        
            return taskController.getAlertTypes(iditemtype, isTask);            
        }
        
        this.getAlertTypesWithNoItem = function(isTask) {
            return taskController.getAlertTypesWithNoItem(isTask);
        }
        
        
        // Common Areas (no lodging) do not have itemtypes...Alert Types are directly associated to the facility.
        this.getAlertTypesFacility = function(idfacility) {
            return taskController.getAlertTypesFacility(idfacility);                
        }
        
        this.getAlertTypesRequest = function() {
            return taskController.getAlertTypesRequest();
        }
        
        this.getAlertTypeByID = function(idalerttype) {                        
            return taskController.getAlertTypeByID(idalerttype);
        }
        
       
        this.getAlerTypeLostAndFound = function() {
            return taskController.getAlerTypeLostAndFound();
        }
        
        this.getAlerTypeCleaningTask = function() {
            return taskController.getAlerTypeCleaningTask();
        }
        
        
        this.getCommonAlertTypes = function() {            
            return taskController.getCommonAlertTypes();
        }
        
        this.saveAlertCreatedToHistory = function(alert) {
            return taskController.saveAlertCreatedToHistory(alert);
        }
        
        this.updateAlertTypes = function() {
            return taskController.updateAlertTypes();
        }
        
       
        
        
        
        
        
        
 /********************************* ALERTS ******************************************************************/        
        
        // Retorna las alertas dependiendo del rol del usuario.        
        this.getAlerts = function(todayOnly) {
            return taskController.getAlerts(todayOnly);            
        }
        
        // Retorna las alertas del idstaff de HOY
        this.getStaffAlerts = function(idstaff) {
            return taskController.getStaffAlerts(idstaff);            
        }
        
        // Returns single alert info
        this.findAlert = function(idalert,uuid) {
            if(idalert == globals.MAX_INT){ 
                return taskController.getAlertbyuuid(uuid);
            }else{
                return taskController.getAlert(idalert);
            }
        } 
        
        this.getAlert = function(idalert) {
            return taskController.getAlert(idalert);
        }
        
        this.getAlertbyuuid = function(idalert) {
            return taskController.getAlertbyuuid(idalert);
        }
        
        
        this.getMaintenanceAlerts = function() {
            return taskController.getMaintenanceAlerts();
        }
        
        this.getCleaningTasks = function() {
            return taskController.getCleaningTasks();
        }
        
        this.getHousekeeperAlerts = function() {
            return taskController.getHousekeeperAlerts();
        }
        
        this.getHousekeeperTasks = function() {
            return taskController.getHousekeeperTasks();
        }
        
        
        this.getTeamAlerts = function() {
            return taskController.getTeamAlerts();
        }
        
        this.getTeamTasks = function() {
            return taskController.getTeamTasks();
        }
        
        // Actualiza la base de datos de alertas local
        // trayendo las alertas del backend.
        // Utiliza el lastmodified 
        // Retorna un asKendoDataSource con la base local actualizada si hubo actualizaciones 
        
        this.updateAlerts = function() {
            return taskController.updateAlerts();
        }
        
        this.syncAlertsToServer = function() {
            return taskController.syncAlertsToServer();
        }
        
        
        
        // Crea una nueva Alerta en el BE, notificando a la housekeeper o jefe de mantenimiento.
        // No se crean localmente. Housekeeping/Maintenancechief se encargan de determinar/delegar
        // quién debe encargarse de la misma. La persona a la cual se le asigne la alerta, le llegará una notificación.
        this.createAlert = function(alert) {             
            return taskController.createAlert(alert);            
        }

        this.startAlert = function(alert) {
            return taskController.startAlert(alert);
        }
        
        this.pauseAlert = function(alert, reason) {
            return taskController.pauseAlert(alert, reason);
        }
        
        this.resumeAlert = function(alert) {
            return taskController.resumeAlert(alert);
        }
        
        this.finishAlert = function(alert, solutiontext) {
            return taskController.finishAlert(alert, solutiontext);
        }
        
        this.moveLast = function(alert) {
            return taskController.moveLast(alert);
        }
        
        this.evaluateAlert = function(alert, rating) {
            return taskController.evaluateAlert(alert, rating);
        }
        
        this.markAlertAsFinished = function(alert, idstaff,idstatus) {
            return taskController.markAlertAsFinished (alert, idstaff,idstatus);
        }        
        
        this.markAlertAsDND = function(alert, idstaff) {
            return taskController.markAlertAsDND(alert, idstaff);
        }
        
        this.escalateAlert = function(alert) {
            return taskController.escalateAlert(alert);
        }
        
        this.alertToTask = function(alert) {
            return taskController.alertToTask(alert);
        },
        
        this.alertReopen = function(alert) {
            return taskController.alertReopen(alert);
        }
        
        this.markAlertAsTaskCreated = function(idalert, idtask, idstaff) {
            return taskController.markAlertAsTaskCreated(idalert, idtask, idstaff);
        }
        
        this.deleteAlert = function(alert) {
            return taskController.deleteAlert(alert);
        }
        
        this.assignAlert = function(alert, idstaff) {
            return taskController.assignAlert(alert, idstaff);
        }
        
        this.takeAlert = function(alert, idstaff) {
            return taskController.takeAlert(alert, idstaff);
        }
        
        this.pingReceived = function(alert) {
            return taskController.pingReceived(alert);
        }
        
        this.pingReceivedByOwner = function(alert) {
            return taskController.pingReceivedByOwner(alert);
        }        
        
        // Data with information regarding number of tasks/alerts, etc.
        this.getData = function() {
            return taskController.getData();
        }
        
        this.refreshData = function() {
            return taskController.refreshData();
        }
        
        // returns data for 'averías' chart
        this.getBreakdownsHistory = function(days) {
            return taskController.getBreakdownsHistory(days);
        }
        
        this.getBreakdownsHistoryRange = function(startdate, enddate) {
            return taskController.getBreakdownsHistoryRange(startdate, enddate);
        }
        
        
        this.alertSettings = function(alert, settingsaction, value) {
            return taskController.alertSettings(alert, settingsaction, value);
        }
        
        
        this.hasRunningTask = function(idstaff) {
            return taskController.hasRunningTask(idstaff);
        }
        
 /********************************* COMMENTS ******************************************************************/                        
        
        this.createComment = function(alert, idstaff, comment, picture) {
            return taskController.createComment(alert, idstaff, comment, picture);
        }
        
        /*this.sendComment = function(parenttype, idparent, idstaff, comment) {
            return taskController.sendComment(parenttype, idparent, idstaff, comment);
        }*/
        
        
        this.getActionLog = function(alert) {
            return taskController.getActionLog(alert);
        }
                
        // goes to BE for updates
        this.updateActionLog = function(idalert) {
            return taskController.updateActionLog(idalert);
        }
        
        // goes to BE for updates
        this.updateAlertChecklist = function(idalert) {
            return taskController.updateAlertChecklist(idalert);
        }
        
        this.getAlertChecklist = function(idalert, idchecklist) {
            return taskController.getAlertChecklist(idalert, idchecklist);
        }
        
       
        this.getAlertChecklistOptionsLocal = function(idalert,idchecklist) {
            return taskController.getAlertChecklistOptionsLocal(idalert, idchecklist);           
        }
        
        this.toggleChecklistOption = function(option) {
            return taskController.toggleChecklistOption(option);            
        }
        
        this.createAlertChecklist = function(option,idalert,alertuuid) {
            return taskController.createAlertChecklist(option,idalert,alertuuid);            
        }
      
        
 /********************************* TASK TYPES ******************************************************************/                

        this.getTaskTypeByID = function(idtasktype) {                        
            return taskController.getTaskTypeByID(idtasktype);
        }
        
        this.updateTaskTypes = function() {
            return taskController.updateTaskTypes();
        }
        
        this.getTaskTypes = function(iditem, module) {
            return taskController.getTaskTypes(iditem, module);
        }
        
        this.getGeneralTaskTypes = function(idmodule) {
            return taskController.getGeneralTaskTypes(idmodule);
        }
        
        this.getGeneralTaskType = function(iditem) {
            return taskController.getGeneralTaskType(iditem);    
        }

 /********************************* TASKS ******************************************************************/        
        
        // Retorna las tareas dependiendo del rol del usuario.        
        this.getTasks = function(todayOnly) {
            return taskController.getTasks(todayOnly);            
        }
        
        // Retorna las tareas del idstaff de HOY
        this.getStaffTasks = function(idstaff) {
            return taskController.getStaffTasks(idstaff);            
        }
        
        // Returns single task info
        this.getTask = function(idtask) {
            return taskController.getTask(idtask);
        }
        
        
        // Actualiza la base de datos local
        // trayendo las tareas del backend.
        // Utiliza el lastmodified 
        // Retorna un asKendoDataSource con la base local actualizada si hubo actualizaciones 
        
        this.updateTasks = function() {
            return taskController.updateTasks();
        }
        
        this.createTask = function(task, updatelocal) {
            return taskController.createTask(task, updatelocal );
        }
        
        this.createCleaningTasks = function(idstaff, role) {
            return taskController.createCleaningTasks(idstaff, role);
        }
        
         this.assignTask = function(idtask, idstaff) {
            return taskController.assignTask(idtask, idstaff);
        }
        
        this.deleteTask = function(idtask){
            return taskController.deleteTask(idtask);
        }
        
        this.startTask = function(idtask) {
            return taskController.startTask(idtask);
        }
        
        this.pauseTask = function(idtask, reason) {
            return taskController.pauseTask(idtask, reason);
        }
        
        this.resumeTask = function(idtask) {
            return taskController.resumeTask(idtask);
        }
        
        this.finishTask = function(idtask) {
            return taskController.finishTask(idtask);
        }
        
        this.evaluateTask = function(idtask, rating) {
            return taskController.evaluateTask(idtask, rating);
        }
        
        this.markTaskAsFinished = function(idtask, idstaff) {
            return taskController.markTaskAsFinished (idtask, idstaff);
        }
        
         this.markTaskAsDND = function(idtask, idstaff) {
            return taskController.markTaskAsDND(idtask, idstaff);
        }
        
        this.taskSettings = function(idtask, settingsaction, value) {
            return taskController.taskSettings(idtask, settingsaction, value);
        }
        
        this.pingReceivedTaskByOwner = function(idtask) {
            return taskController.pingReceivedTaskByOwner(idtask);
        }  
        

        
/***************************** STAFF **************************************************************************/                
        
        this.getStaff = function() {
            return taskController.getStaff();
        }
        
        // With each staff  it returns stats 
        this.getStaffDetails = function() {            
            return taskController.getStaffDetails();
        },
        
        this.updateStaff = function() {
            return taskController.updateStaff();
        }
        
        this.getWorkingHoursForStaff = function(idstaff) {
            return taskController.getWorkingHoursForStaff(idstaff);
        }
        
        // Gets/Updates working hours for the whole department/module
        this.updateWorkingHours = function(idmodule) {
            return taskController.updateWorkingHours(idmodule);
        }
                
        
        this.getAlertHistory = function(idstaff) {
            return taskController.getAlertHistory(idstaff);
        }
        
        // for imodule = 3 (housekeeping), select staff where role = "housekeeper", and so on....
        this.getModuleChiefs = function(idmodule) {
            return helper.getModuleChiefs(idmodule);
        }
        
        // Return all users whose role = manager.
        this.getManagers = function() {
            return helper.getManagers();
        }
                
        this.updateFilterPreferences = function(filterpreferences) {
            return taskController.updateFilterPreferences(filterpreferences);
        }
        
        this.updatePreferences = function(preferences) {
            return taskController.updatePreferences(preferences);
        }
        
        this.setAvailability = function(idstaff, available) {
            return taskController.setAvailability(idstaff, available);
        }
        
        this.setAvatar = function(idstaff, avatar) {
            return taskController.setAvatar(idstaff, avatar);
        }
        
        this.changePassword = function(idstaff, currentPassword, newPassword) {
           return taskController.changePassword(idstaff, currentPassword, newPassword);
           
        }
        
        
        
/***************************** FACILITIES, ITEM, OCCUPANCY  *********************************************************************/        
        
        
        this.updateFacilities = function() {
            return taskController.updateFacilities();
        }
                
        
        this.getAllFacilities = function() {   // returnes promise
            return taskController.getAllFacilities();  
        }
        
        this.getFacilities = function(lodging) {   // returnes kendo Data Source
            return taskController.getFacilities(lodging);  
        }
               
        
        this.getFacilitiesByType = function(idtype) { // facilityType
            return taskController.getFacilitiesByType(idtype);    
        }
        
        this.getFacilityOccupancy = function(idfacility) {
            return taskController.getFacilityOccupancy(idfacility);
        }
        
        
        
        this.getItems = function(lodging, request, idlocation, idfacilitytpe) {                                    
            return taskController.getItems(lodging, request, idlocation, idfacilitytpe);            
        }
        
        this.getItem = function(iditem) {
            return taskController.getItem(iditem);
        }
        
        this.getItemCategory = function(iditem) {
            return taskController.getItemCategory(iditem);
            
        }
        
        this.getLocations = function(lodging, request, idfacilitytype) {
             return taskController.getLocations(lodging, request, idfacilitytype);   
        }
                
        
        this.updateItems = function() {
            return taskController.updateItems();
        }
        
        this.updateOccupancy = function() {
            return taskController.updateOccupancy();
        }
        
        this.getOccupancy = function() {
            return taskController.getOccupancy();
        }
        
        this.setRoomReady = function(idfacility, ready) {
            return taskController.setRoomReady(idfacility, ready);
        }, 
        
        this.setRoomCleaninigStatus = function(idfacility, status,uuid,name) {
            return taskController.setRoomCleaninigStatus(idfacility, status,uuid,name);
        },
        
        this.getAlertTypesCleaningTask = function() {
            return taskController.getAlertTypesCleaningTask();
        }
        
        this.setFCMtoken = function(idstaff, token) {
            return taskController.setFCMtoken(idstaff, token);
        }
       

/*************************************************************************************************************/        
        
        // This methods determines if it needs to bring basic data from the backend,
        // like Priority and Status tables...
        // You can run with force = true, to cleanup database first and run as if first time.        
        
        this.initialSynchronization = function(force) {                        
           return syncController.initialSynchronization(force);            
        }
        
        
       
        
        // Actualiza los badges en la pantalla alertas/tareas y
        // actualiza los badges en el tabstrip
        // Lee la información de la base de datos local.        
        
        this.updateBadges = function() {
            log('Update Badges');
        }
        
        
        ///////// PRIVATE MEMBERS   ////////////////////////
        
        
        
       
                
        
        
       
        
      
        
        
        
        
    } // Smart
    
    
   

    
    window.Smart = Smart;
    
    
}) (window);
var $smart = new Smart();

// Matthias Malek
// SuisseWorks
// Dic, 2015
// Controller for handling synchronization between local and backend data
// This controller interfaces with RestAPI and LocalDB.
// Smart should not talk directly to RestAPI and LocalDB

(function (window) {
    
    function SyncController() {
         
        var _forceFullSync = false;                  
        var _DEBUG         = true;                
        var log = function(msg) {
            if (_DEBUG) console.log(msg);
        }
        
        
        
        // We need a method that does 2 way synchronization.        
        // From Server and to Server
        // For local to Server synchronization, we can use the localkey and inSync fields of the entityset.        
        // maybe... synchronizeToServer ???
        this.synchronize = function(entitySet) {
            var deferred = $.Deferred();    
            var that = this;   
                                    
            $localdb.getMaxLastmodified(entitySet)
            .done(function(lastmodified) {                                            
                var criteria = {};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get any new alerts from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getEntity(entitySet.name, criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                        
                        deferred.resolve(false);                            
                    else                         
                        syncController.synchronizeFromServer(entitySet, rows, true)
                        .done(function() {
                            deferred.resolve(true);    
                        })                    
                })
            })          
                       
            return deferred.promise();             
        }
        
        
        // Receives rows read from the server and tries to determine which ones
        // are new and which ones need to be updated (locally)
        this.synchronizeFromServer = function(entitySet, rows, insync) {
            var deferred = $.Deferred();

            _synchronizeFromServer(entitySet, rows, insync)
            .done(function() {
                $localdb.db.saveChanges(entitySet);                
                deferred.resolve();
            }).fail(function(error) {deferred.reject(error);});  
            
            return deferred.promise();
            
            /*return;
            if (rows.length === 0) return $.Deferred().resolve();
            if ($localdb.isEmpty(entitySet)) {
                log('synchronize: empty -> AddRows');
                return $localdb.addRows(entitySet,rows);
            }
            else
                return _synchronizeFromServer(entitySet, rows);
            */
        }
        
        // Assumes rows and entitySet are not empty
        _synchronizeFromServer = function(entitySet, rows, insync) {
            log('Synchronize from Server');
            //log(rows);            
            var promises = [];
            for(row in rows) {                
                promises.push(syncRowFromServer(entitySet, rows[row], insync));
            }    
            return $.when.apply($,promises);
        }
        
        // Syncronizes one single row from server into the local db
        syncRowFromServer = function(entitySet, row, insync) {
            var deferred = $.Deferred();            
            log('syncRowFromServer');
            $localdb.exists(entitySet, row)
            .done(function(entity) {                
                if (entity == null) {// if row does not exist locally, then insert.                    
                    log('Row does not exist (syncFromServer) -> Insert');
                    console.log(row);
                    row["insync"] = insync;
                    $localdb.addRow(entitySet,row);
                    deferred.resolve();
                } else {
                    if(row.deleted == 1)
                    {
                      log('Row exists -> row.deleted');
                      entitySet.remove(entity);
                      $localdb.db.saveChanges();
                      deferred.resolve();
                    }else{
                    log('Row exists -> Update');
                    row["insync"] = insync;
                    $localdb.updateRow(entity, row)
                    .done(function() {
                        deferred.resolve();
                    }).fail(function(error) {deferred.reject(error);});      
                        }
                }                
            }).fail(function(error) {deferred.reject(error);});           
           return deferred.promise();
        }
        
        
        
        
        // This methods determines if it needs to bring basic data from the backend,
        // like Priority and Status tables...
        // You can run with force = true, to cleanup database first and run as if first time.                
        
         this.initialSynchronization = function(force) {            
            var deferred = $.Deferred();            
             console.info(' FULL SYNC=> ' + force);
             
            isFullSyncNeeded(force || _forceFullSync)
            .done(function(needed) {                             
                if (needed) {
                    log('FULL SYNC NEEDED');            	            
                    localStorage.setItem("dingdone:fullsync", false);
                    syncController.pullFull($localdb.db.AlertTypes)
                    .done(function() {
                       /* syncController.pullFull($localdb.db.Priorities)
                        .fail(function(error)  { deferred.reject(error); })
                        .done(function() { */
                            syncController.pullFull($localdb.db.Facilities)
                            .fail(function(error)  { deferred.reject(error); })
                            .done(function() {
                                console.log("paso");
                                //app.reportAlertView.loadFacilities();
                                syncController.pullFull($localdb.db.Items)
                                .fail(function(error)  { deferred.reject(error); })
                                .done(function() {
                                    syncController.pullFull($localdb.db.Locations)
                                    .fail(function(error)  { deferred.reject(error); })
                                    .done(function() {
                                        syncController.pullFull($localdb.db.ItemLocations)
                                        .fail(function(error)  { deferred.reject(error); })
                                        .done(function() {
                                            syncController.pullFull($localdb.db.Staff)
                                            .fail(function(error)  { deferred.reject(error); })
                                            .done(function() {
                                                        syncController.pullFullAlerts() //($localdb.db.Alerts, true)
                                                        .fail(function(error)  { deferred.reject(error); })
                                                        .done(function() {                                                           
                                                                syncController.pullFull($localdb.db.Occupancy)
                                                                .fail(function(error)  { deferred.reject(error); })
                                                                .done(function() {                                                                                                               
                                                                        syncController.pullFull($localdb.db.RulesFacilityTypeItem)
                                                                        .fail(function(error)  { deferred.reject(error); })
                                                                        .done(function() {                                                                
                                                                            syncController.pullFull($localdb.db.RulesFacilityTypeLocation)
                                                                            .fail(function(error)  { deferred.reject(error); })
                                                                            .done(function() {   
                                                                                syncController.pullFull($localdb.db.ChecklistOption)
                                                                                .fail(function(error)  { deferred.reject(error); })
                                                                                .done(function() {   
                                                                                    syncController.cleanActionLog()
                                                                                    .fail(function(error)  { deferred.reject(error); })
                                                                                    .done(function() {
                                                                                        syncController.cleanAlertChecklist()
                                                                                        .fail(function(error)  { deferred.reject(error); })
                                                                                        .done(function() {
                                                                                            syncController.pullFull($localdb.db.GuestActivity)
                                                                                            .fail(function(error)  { deferred.reject(error); })
                                                                                            .done(function() {
                                                                                                helper.prepareGlobals()
                                                                                                .done(function() {
                                                                                                    localStorage.setItem("dingdone:fullsync", true);
                                                                                                    deferred.resolve();        
                                                                                                 })    
                                                                                            })    
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })                                                                
                                                                })        
                                                      
                                                })
                                            })
                                        })
                                    })
                                })
                           // })                                            
                        })    
                    })
                                                                                                        
                }               
                else {
                    log('NO FULL SYNC ');                            
                    localStorage.setItem("dingdone:fullsync", false);
                    syncController.pullFullAlerts()
                    .done(function() {
                        syncController.pullFull($localdb.db.Occupancy)
                        .done(function() {
                            syncController.cleanActionLog()
                            .done(function() {
                                 syncController.cleanAlertChecklist()
                                 .done(function() {
                                    helper.prepareGlobals()
                                    .done(function() {
                                        localStorage.setItem("dingdone:fullsync", true);
                                            deferred.resolve();        
                                    })      
                                 })
                            })
                        })        
                            
                    })
                }                                      
            })            
           return deferred.promise();            
        }
        
        
      
        // TODO: no borrar lo que está sin sincronizar
        this.cleanActionLog = function() {
            var deferred = $.Deferred();                       
            
            log('Cleaning ActionLog table...');
            
            $localdb.cleanEntity($localdb.db.ActionLog)
                .fail(function(){ deferred.reject()})
                .done(function(count){      
                    deferred.resolve();
                });
                    
            return deferred.promise();
        }
        
        
        
        // No borrar lo que está sin sincronizar
        this.cleanAlertChecklist = function() {
            var deferred = $.Deferred();
                      
            log('Cleaning AlertChecklist table...');
            
            $localdb.cleanEntity($localdb.db.AlertCheckList)
                .fail(function(){ deferred.reject()})
                .done(function(count){      
                    deferred.resolve();
                });
                    
            return deferred.promise();
            
        }
        
        this.pullFullAlerts = function() {
            var deferred = $.Deferred();
            var limit = localStorage.getItem("limit");//limite de alertas a obtener
            var condition = {
                idstaff: app.user.idstaff,
                role   : app.user.role,
                limit :limit
            };
            
            var from = moment().subtract(1,"day").valueOf();
            
            if (app.user.role === globals.ROLE_MANAGER)
                from = moment().subtract(1,"week").valueOf();
            
            
            condition['condition'] = "((t.lastmodified>'" + $date.toMySQLFormat(from) + "' or t.idstatus != 100) and t.deleted = 0)"; 
            
            
            if (!app.isOnline()) 
                deferred.reject(globals.OFFLINE);
            else {
            
                log('Starting Full Synchronization for Alerts');
                helper.showLoading(loc.t("Espere...")); 
                $localdb.removeAll($localdb.db.Alerts)
                .fail(function(){ deferred.reject()})
                .done(function(count){             
                    $api.getEntity($localdb.db.Alerts.name, condition)
                    .done(function(rows) {
                        $localdb.addRows($localdb.db.Alerts,rows)
                        .done(function() {                                                
                            $localdb.showCount($localdb.db.Alerts, " [after FullSync]");
                            deferred.resolve();  
                        })   
                        .fail(function() {
                            helper.hideLoading();
                            deferred.reject();  
                        })
                    })        
                })
            }               
            return deferred.promise();
        }
        
        
        this.pullFullTasks = function() {
            var deferred = $.Deferred();
            var condition = {
                idstaff: app.user.idstaff,
                role   : app.user.role                                
            };
            
            var from = moment().subtract(1,"day").valueOf();
            
            
            condition['condition'] = "((t.lastmodified>'" + $date.toMySQLFormat(from) + "' or t.idstatus != 100) and t.deleted = 0)"; 
            condition['fullsync']  = "true";
            
            if (!app.isOnline()) 
                deferred.reject(globals.OFFLINE);
            else {
            
                log('Starting Full Synchronization for Tareas');
                helper.showLoading(loc.t("Sincronizando")); 
                $localdb.removeAll($localdb.db.Tasks)
                .fail(function(){ deferred.fail()})
                .done(function(count){             
                    $api.getEntity($localdb.db.Tasks.name, condition)
                    .done(function(rows) {
                        $localdb.addRows($localdb.db.Tasks,rows)
                        .done(function() {                                                
                            $localdb.showCount($localdb.db.Tasks, " [after FullSync]");
                            deferred.resolve();  
                        })   
                        .fail(function() {
                            helper.hideLoading();
                            deferred.reject();  
                        })
                    })        
                })
            }               
            return deferred.promise();
        }
        
        
        
         pullFullRegular = function(entitySet, condition) {
            var deferred  = $.Deferred();       
            log('Starting Full Synchronization (Regular) for : ' + entitySet.name);                
            $api.getEntity(entitySet.name, condition)
            .done(function(rows) {
                $localdb.addRows(entitySet,rows)
                .done(function() {
                    deferred.resolve();
                }) 
            })  
            .fail(function() {
                deferred.reject();
            })
            return deferred.promise();   
        }
        
        
        
        // Performs a full syncronization of the given entity.    
         this.pullFull = function(entitySet, userSpecific, doChunks) {
            var deferred  = $.Deferred(),
                condition = {};
            if (!app.isOnline())
                deferred.reject(globals.OFFLINE);
            else {
                log('Starting Full Synchronization for : ' + entitySet.name);
                //helper.showLoading(loc.t("Sincronizando")); //+ " " + entitySet.name);
                userSpecific =  typeof userSpecific == 'undefined' ? false : userSpecific;         
                doChunks =  typeof doChunks == 'undefined' ? false : doChunks;                
                if (userSpecific) {
                    condition['idstaff'] = app.user.idstaff;         
                    condition['role'] = app.user.role;         
                }
                $localdb.removeAll(entitySet)
                .fail(function(){ deferred.fail()})
                .done(function(count){                      
                    if (doChunks)                
                        pullFullChunk(entitySet, condition)
                        .done(function() { 
                            $localdb.showCount(entitySet);
                            deferred.resolve();  
                        })
                    else
                        pullFullRegular(entitySet, condition)
                        .done(function() { 
                            $localdb.showCount(entitySet, " [after FullSync]");
                            deferred.resolve();  
                        })   
                        .fail(function(error) {
                            deferred.reject(error);
                        })
                })        
            }
            
            return deferred.promise();
        }
        
        
        
        /// PRIVATE //////
        
        
      
         
        // Checks if full syncronization is needed
        // A full syncronization is needed when the app is first installed and its going to be used for the first time
        // For this, we check if the status table is empty. 
        isFullSyncNeeded = function(force) {            
            var deferred = $.Deferred();
            log('isFullsyncNeeded');
            log(force);
            if (force === true) 
                deferred.resolve(true);
             else {                                         
                 var rows = $localdb.db.Locations.filter( function( row ) {                            
                    return row.idhotel === this.idhotel 
                }, { idhotel: app.hotel.idhotel });
                
                rows.count(function(numRows) {
                    console.log(numRows);        
                    numRows == 0 ? deferred.resolve(true) : deferred.resolve(false);        
                });     
             }
            return deferred.promise();            
        }
        
        
         // Must be called by sync.pullFull, since this method does not delete all rows first.
        pullFullRegular = function(entitySet, condition) {
            var deferred  = $.Deferred();       
            log('Starting Full Synchronization (Regular) for : ' + entitySet.name);                
            $api.getEntity(entitySet.name, condition)
            .done(function(rows) {
                $localdb.addRows(entitySet,rows)
                .done(function() {
                    deferred.resolve();
                }) 
            })  
            .fail(function(error) {                
                deferred.reject(error);
            })
            return deferred.promise();   
        }


        
        // WE SHOULD NOT NEED TO DO CHUNCKING....(????)
        // ===> Do onDemand calls,etc...
        // Must be called by sync.pullFull, since this method does not delete all rows first.
        // TODO: Need to fix as above
        pullFullChunk = function(entitySet, condition) {
            var deferred = $.Deferred();
            var rows         = [];    
            //var lastid       = null;
            log('Full Synchronization (Chunks) for : ' + entitySet.name);    
            api.restService(entitySet.name, condition,
                function(apirows) {         
                    var fieldsToIgnore = smartdb.isStaticTable(entitySet) ? 0 : 4; // We ignore last 4 field (localkey, hasConflict, inSync, uid), which are not present remotely                                                
                    for (var n in apirows) {
                        lastid = apirows[n][keyName];                
                        var row = {};                
                        for (var i=0; i< fieldNames.length-fieldsToIgnore;i++)
                            row[fieldNames[i]] = apirows[n][fieldNames[i]];
                        rows.push(row);
                    }            
                    if (rows.length == 0)
                       deferred.resolve();
                    else {              
                        entitySet.addMany(rows);
                        condition['lastid'] = lastid;
                        localdb.saveChanges(function() {                    
                            sync.pullFullChunk(entitySet, condition) // recursive call
                            .done(function(){ deferred.resolve()})
                        })                    
                    }            
                })
            
            return deferred.promise();
        }
    
        
        
        
        /********************************/
        /***** SYNC TO SERVER ***********/
        /********************************/
        
        // If there is locally data that has not yet been sync to server, we cannot do
        // a refresh from server to local, since we can loose/overwrite those changes..
        this.islocalDataDirty = function() {
            var deferred = $.Deferred();
            
            var updatedRows = $localdb.db.Alerts.filter(function(e) { return !e.insync});
            updatedRows.count(function(count) {
                if (count > 0) 
                    deferred.resolve(true);
                else 
                    deferred.resolve(false);                
            });
            
            
            return deferred.promise();
            
        }
        
        this.isLocalActionLogDirty = function() {
            var deferred = $.Deferred();
            
            var updatedRows = $localdb.db.ActionLog.filter(function(e) { return !e.insync});
            updatedRows.count(function(count) {
                if (count > 0) 
                    deferred.resolve(true);
                else 
                    deferred.resolve(false);                
            });            
            
            return deferred.promise();            
        }
        
        this.isAlertChecklistDirty = function() {
            var deferred = $.Deferred();
            
            var updatedRows = $localdb.db.AlertCheckList.filter(function(e) { return !e.insync});
            updatedRows.count(function(count) {
                if (count > 0) 
                    deferred.resolve(true);
                else 
                    deferred.resolve(false);                
            });            
            
            return deferred.promise();        
            
        }
        
        
        // CHECK IF there are alerts of actionlogs dirty...
        // Need to include DING | DONE,
        this.needToSyncToServer = function() {
            var deferred = $.Deferred();          
            
            //console.info('userinsync', app.user.insync);
            
            if (!app.user.insync) deferred.resolve(true);
            syncController.islocalDataDirty()
            .done(function(alertsDirty) {
                if (alertsDirty) deferred.resolve(true);
                else
                    syncController.isLocalActionLogDirty()
                    .done(function(logDirty) {
                        if (logDirty) deferred.resolve(true)
                        syncController.isAlertChecklistDirty()
                        .done(function(checklistDirty) {
                            deferred.resolve(checklistDirty)
                       })                        
                    })
                    .fail(function() { deferred.resolve(true)})
            })
            .fail(function() { deferred.resolve(true)})
            
            return deferred.promise();
        }
        
        
        /*************************
            SYNC ALERTS TO SERVER
        *************************/
        this.syncAlertsToServer = function() {
            var deferred = $.Deferred();            
            var entitySet = $localdb.db.Alerts;
            
            console.info('SYNC ALERTS TO SERVER');
                        
            // include alerts created offline (idalert = -1)
            var updatedRows = entitySet.filter(function(e) { return !e.insync});
            
            updatedRows.toArray(function(rows) {
                console.info(rows.length);
                
                if (rows.length === 0) deferred.resolve(0);
                else {
                    sendUpdatedAlertRows(rows)
                    .done(function(result) {    
                       taskController.refreshData($localdb.db.Alerts)
                       .done(function() { 
                           
                           deferred.resolve(rows.length);     
                       })
                    })
                    .fail(function(error) {                      
                        deferred.reject(error);
                        
                    })
                }                
            });
            return deferred.promise();
        }
        
        
       var uris = "";
        
         getAlertData = function(row) {                                       
             var deferred = $.Deferred();
             var that = this;
             
             var data = {};            
             uris = "";
             
             data["guid"]       = row["guid"];
             data["uuid"]       = row["uuid"];           
             data["user"]       = app.user.idstaff;
             data["idalert"]    = row["idalert"];                        
             data["idcategory"] = row["idcategory"];        
             data["idlocation"] = row["idlocation"]; 
             data["idstatus"]   = row["idstatus"];
             data["idstaff"]    = row["idstaff"];
             data["action"]     = row["action"];    // ping received, etc             
             data["tag"]        = row["tag"];      
             data["startdate"]  = row["startdate"];
             data["finishdate"] = row["finishdate"];
             data["finish"]     = row["finish"];
             data["resumedate"] = row["resumedate"];
             data["expectedduration"] = row["expectedduration"];
             data["willcheckdate"] = row["willcheckdate"];
             data["evaluation"]    = row["evaluation"];
             data["duration"]      = row["duration"];
             data["alerttotask"]   = row["alerttotask"];
             data["byhousekeeper"] = row["byhousekeeper"]; 
             data["assignedby"]    = row["assignedby"]; 
             data["deleted"]       = row["deleted"];
             
             
             
             if (row["idalert"] == globals.MAX_INT) { // new alert{
                 data["reporteddate"]  = row["reporteddate"]; 
                 data["reportedby"]    = row["reportedby"];    
                 data["name"]          = row["name"];    
                 data["idfacility"]    = row["idfacility"];    
                 data["byguest"]       = row["byguest"];    
                 data["notes"]         = row["notes"];    
                 data["idtype"]        = row["idtype"];    
                 data["idpriority"]    = row["idpriority"];                     
                 
                 deferred.resolve(data);
             }
             else
                 deferred.resolve(data);
             
             return deferred.promise();             
            
        }
        
        
        sendPictures = function(pictures) {
            var promises = [];
            
            for(var i = 0; i < pictures.length; i++) {                   
                promises.push(sendPicture(pictures[i]));                    
            }                       
            return $.when.apply($,promises);            
        }
        
        sendPicture = function(picture) {
            var deferred = $.Deferred();
            
            everliveController.sendPicture(picture)
            .done(function(uri) {
                if (uris == "") uris += uri;
                else
                    uris += "," + uri;
                deferred.resolve();                
            }) 
            .fail(function() { deferred.resolve()})
           
            
            return deferred.promise();
        }
        
        
        sendUpdatedAlertCheckListRows = function(rows) {           
            var promises = [];            
                        
            for(var i = 0; i < rows.length; i++) {   
               if(rows[i].idalert == globals.MAX_INT) continue;
                 promises.push(sendUpdatedAlertCheckListRow(rows[i]));      
            }                       
            return $.when.apply($,promises);                 
        }
        
         sendUpdatedAlertCheckListRow = function(row) {
            var deferred = $.Deferred();
          /* $smart.getAlert(row.idalert)
             .done(function(alert) {
               if(alert !== null){
                   if(alert.idstatus == 100){    */      
                     $api.updateAlertCheckList({ 
                         idalert: row.idalert, idchecklistoption: row.idchecklistoption, value: row.value, user: app.user.idstaff })
                        .done(function(result) {  
                            console.info("Result updateAlertCheckList");
                            console.info(result);
                            row["insync"] = true;
                            row.save();
                            deferred.resolve(result);
                  
                         })    
                         .fail(function(error) {                
                             deferred.reject(error);    
                         })  
               /*    }else{
                       deferred.resolve(0);
                   }
              }else{
               deferred.resolve(nul);  
              }
             }); */  
            
            return deferred.promise();
        }
        
        
        
        // Solo se hace update del idstatus o el idstaff (asignar o reasginar offline)
        sendUpdatedAlertRows = function( rows) {
            var entitySet = $localdb.db.Alerts;
            var promises = [];            
                        
            
            for(var i = 0; i < rows.length; i++) {                    
                promises.push(sendUpdatedAlertRow(rows[i]));                    
            }                       
            return $.when.apply($,promises);            
        }
        
        
        
        
        
        sendUpdatedAlertRow = function(row) {
            var deferred = $.Deferred();
            
           // PASAR getAlertData aca....
            console.info('postAlert');
            console.info(row);
            
            getAlertData(row)
            .done(function(data) {
                $api.postAlert(data)
                .done(function(result) {   
                    console.info('postAlert result: ' + result);   
                    console.info(result);
                    result["insync"] = true;
                    if (row["idalert"] == globals.MAX_INT) {   // new rows
                        console.info('NEW ALERT update');
                        $localdb.updateAlertNew(result,row["guid"])
                        .done(function() {                                                 
                            // Update Any ActionLogs that were created before idalert was available!
                            $localdb.updateActionLogsBasedOnAlertGuid(result.idalert, row["guid"])
                            .done(function() {                                
                                //taskController.refreshData($localdb.db.Alerts)
                                //.done(function() {  
                                    console.info(result);
                                    $api.sendNotification({
                                        user : app.user.idstaff,
                                        idalert: result.idalert,
                                        notificationtype: result.notification.type,
                                        additionaltext: result.notification.additionaltext
                                    }).done(function(r) {
                                         var datatosend = {};
                                         datatosend["idhotel"] = row["idhotel"];
                                         datatosend["idalert"] = result.idalert;
                                         datatosend["pictures"] = row["pictures"];
                                           $api.SavePictures(datatosend).done(function(res) {
                                                console.info(res);
                                                deferred.resolve(data);
                                           }).fail(function() {
                                                console.info('URI FAIL');
                                                deferred.resolve(data);
                                           });
                                    });
                      
                                    $localdb.updateAlertchecklistForAlertGuid(result.idalert, row["uuid"])
                                        .done(function() {
                                               console.log("paso por el uno");
                                                deferred.resolve(result);
                                            })
                                
                                //})                                                     
                            })
                        })                    
                    }
                    else // UPDATES
                        $localdb.updateAlert(result)
                        .done(function() {  
                            console.info('HIDE spinner');
                            console.info("#spinner" + row["idalert"]);
                            $("#spinner" + row["idalert"]).hide();
                            
                             $api.sendNotification({
                                        user : app.user.idstaff,
                                        idalert: result.idalert,
                                        notificationtype: result.notification.type,
                                        additionaltext: result.notification.additionaltext
                                    });
                            deferred.resolve(result);  
                           /* taskController.refreshData($localdb.db.Alerts)
                            .done(function() {
                                deferred.resolve(result);                              
                            })   
                            */
                        })   
                })    
                .fail(function(error) {                
                    deferred.reject(error);    
                })                   
            })
                        
            
            return deferred.promise();
        }
        
        
        sendUpdatedAlertRowOLD = function(row) {
            var deferred = $.Deferred();
            
            if (row.idalert == -1) {
                console.info('SEND NEW ALERT...');                
            }
            // Se pudo cambiar el idstaff, action (received by module, received by owner)
            if (row.idstatus == globals.ALERT_STATUS_PENDING) {
                 $api.postAlert(row)
                .done(function(result) {   
                     result["insync"] = true;
                     $localdb.updateAlert(result)
                     .done(function() {                     
                         taskController.refreshData($localdb.db.Alerts)
                         .done(function() {
                             deferred.resolve(result);                              
                         })                     
                     })   
                 })    
                .fail(function(error) {                
                     deferred.reject(error);    
                 })   
            } else if (row.idstatus == globals.ALERT_STATUS_IN_PROGRESS) {                            
                $api.startAlert({ idalert: row.idalert, idstaff: app.user.idstaff, role: app.user.role,
                    startdate: row.startdate})
                .done(function(result) {   
                     result["insync"] = true;
                     $localdb.updateAlert(result)
                     .done(function() {                     
                         taskController.refreshData($localdb.db.Alerts)
                         .done(function() {
                             deferred.resolve(result);                              
                         })                     
                     })   
                 })    
                .fail(function(error) {                
                     deferred.reject(error);    
                 })   
            } else if (row.idstatus == globals.ALERT_STATUS_RESOLVED) {
                 $api.finishAlert({ idalert: row.idalert, idstaff: app.user.idstaff, role: app.user.role, 
                     finishdate: row.finishdate, startdate: row.startdate, resumedate: row.resumedate})
                .done(function(result) {    
                     result["insync"] = true;
                     $localdb.updateAlert(result)
                     .done(function() {                     
                         taskController.refreshData($localdb.db.Alerts)
                         .done(function() {
                             deferred.resolve(result);                              
                         })                     
                     })   
                 })    
                .fail(function(error) {                
                     deferred.reject(error);    
                 })   
                
            } else if (row.idstatus == globals.ALERT_STATUS_PAUSED) {
                 $api.pauseAlert({ idalert: row.idalert, idstaff: app.user.idstaff, role: app.user.role})
                .done(function(result) {    
                     result["insync"] = true;
                     $localdb.updateAlert(result)
                     .done(function() {                     
                         taskController.refreshData($localdb.db.Alerts)
                         .done(function() {
                             deferred.resolve(result);                              
                         })                     
                     })   
                 })    
                .fail(function(error) {                
                     deferred.reject(error);    
                 })   
            
            }    
            
            return deferred.promise();
        }
        
        
         /******************/
        /* CHECK LISTS     */
        /******************/
                  
        this.syncAlertCheckListToServer = function() {
            var deferred = $.Deferred();            
            var entitySet = $localdb.db.AlertCheckList;
            
            console.info('SYNC CHECKLIST TO SERVER');
                                   
            var updatedRows = entitySet.filter(function(e) { return !e.insync});
           // console.log("paso --++--->",updatedRows);
            updatedRows.toArray(function(rows) {
                if (rows.length === 0) deferred.resolve(0);
                else {
                    sendUpdatedAlertCheckListRows(rows)
                    .done(function(result) {  
                        deferred.resolve(rows.length);     
                    })
                    .fail(function(error) {                      
                        deferred.reject(error);                        
                    })
                  }               
            });
            return deferred.promise();
        }
        
        
        
        
        /******************/
        /* ACTION LOG     */
        /******************/
        
          // No updates, just new entries sent to BE where id = -1 are send to be created in BE
        this.syncActionLogToServer = function() {
            var deferred = $.Deferred();
            var entitySet = $localdb.db.ActionLog;
            
            var newRows = entitySet.filter(function(e) { return !e.insync && e.idalert != globals.MAX_INT});
            
            newRows.toArray(function(rows) {                
                
                if (rows.length === 0) deferred.resolve('Nothing to update!');
                else {
                    console.info(rows.length);
                    
                    sendNewActionLogRows(rows)
                    .done(function(result) {
                        deferred.resolve(result);
                    })
                    .fail(function(error) {
                        deferred.reject(error);
                    })
                }
                
            });
            return deferred.promise();            
        }
        
        sendNewActionLogRows = function(rows) {            
            var entitySet = $localdb.db.ActionLog;
            var promises = [];            
            
            for(var i = 0; i < rows.length; i++) {    
                //var data = getAlertData(rows[i]);                
                promises.push(sendNewActionLogRow(rows[i]));                
            }                       
            return $.when.apply($,promises);            
        }
        
        
        getUriFromPicture = function(row) {
            var deferred = $.Deferred();
            
            if (row.picture != null) {                     
                everliveController.sendPicture(row.picture)
                .done(function(uri) {
                    console.info('URI OK');                    
                         deferred.resolve(uri);  
                     })
                     .fail(function() {
                         console.info('URI FAIL');
                         deferred.resolve(null);
                     })
                 }
                 else
                     deferred.resolve(null);
            
            return deferred.promise();
            
        }
        
        
         sendNewActionLogRow = function(row) {
             var deferred = $.Deferred();
             
             console.info('Sending Action Log');
             console.info(row);
             
             getUriFromPicture(row)
             .done(function(uri) {
                  $api.createActionLog({ action: row.action, prompt: row.prompt, idalert: row.idalert, uris: uri,
                 idstaff: app.user.idstaff, lastmodified: row.lastmodified, user: app.user.idstaff, uidd: row.uidd })
                .done(function(result) {  
                    console.info("Result");
                    console.info(result);
                    result["insync"] = true;
                    console.info(result);
                    result["uris"] = uri;
                    
                    
                    $localdb.updateNewActionLog(result, row["guid"])
                    .done(function() {                                              
                        deferred.resolve(result);                                                       
                    })   
                 })    
                .fail(function(error) {                
                     deferred.reject(error);    
                 })                    
             })
         
            return deferred.promise();
        }
    }
    
    window.SyncController = SyncController;
    
})(window)

var syncController = new SyncController();
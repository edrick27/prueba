// Matthias Malek
// SuisseWorks, 2015
// LocalDB Pattern Module

(function(window) {
    
    function LocalDB() {
        
        this.db = null;
        
        /*var _chunkingTables = ["Items", "Tasks", "Alerts"],  // Potencially BIG Tables  */
        
        var _staticTables   = ["Status","TaskStatus","AlertStatus","Priorities", "ItemTypeCategories"];  // Tables that do not change                */
            
        var    _DEBUG = true;  // Prints useful information, like for instance number of rows after remove all...
         
        var log = function(msg) {            
            if (_DEBUG) console.log(msg);
        }
        
        this.sayHi = function() {
            alert('Hi');
        }
        
        // Inits local database
        this.init = function() {
            log('$locadb.init');
            createJayDataEntities();
            this.initLocalDatabase();                        
        }
        
        this.saveToLocalStorage = function(username, password, data) {            
            localStorage.setItem("dingdone:username", username);
            localStorage.setItem("dingdone:avatar", data.useravatar);
            localStorage.setItem("dingdone:password", password);    
            localStorage.setItem("dingdone:idstaff", data.idstaff);
            localStorage.setItem("dingdone:idmodule", data.idmodule);
            localStorage.setItem("dingdone:iddepartment", data.iddepartment);
            localStorage.setItem("dingdone:visibility", data.visibility);
            localStorage.setItem("dingdone:fullname", data.fullname);
            localStorage.setItem("dingdone:idhotel", data.idhotel);
            localStorage.setItem("dingdone:hotelname", data.hotelname);
            localStorage.setItem("dingdone:idcategory", data.idcategory);
            localStorage.setItem("dingdone:collaborative", data.collaborative);
            
            localStorage.setItem("dingdone:filterpreferences", data.filterpreferences);        
            localStorage.setItem("dingdone:stafftype", data.stafftype);
            localStorage.setItem("dingdone:role",     data.userrole);   
            localStorage.setItem("dingdone:appversion",     app.version);   
            
        }
        
       
        
        this.cleanLocalStorage = function() {            
            localStorage.removeItem('dingdone:username');
            localStorage.removeItem('dingdone:password');
            localStorage.removeItem('dingdone:avatar');
            
            localStorage.removeItem('dingdone:idstaff');
            localStorage.removeItem('dingdone:idmodule');
            localStorage.removeItem('dingdone:iddepartment');
            localStorage.removeItem('dingdone:visibility');
            localStorage.removeItem('dingdone:fullname');
            localStorage.removeItem('dingdone:idhotel');
            localStorage.removeItem('dingdone:hotelname');
                
            localStorage.removeItem('dingdone:managername');
            localStorage.removeItem('dingdone:filterpreferences');
            localStorage.removeItem('dingdone:stafftype');
            localStorage.removeItem('dingdone:role');    
           
           
        }
        
        
        
        
       
        

        
        this.addRows = function(entitySet, newRows) {            
            var deferred = $.Deferred();
            var fieldNames = entitySet.elementType.getFieldNames()                
            var rows         = [];               
            for (var r in newRows) {        	                 
                var row = {};                    
                for (var i=0; i < fieldNames.length - fieldsToIgnore(entitySet.name); i++) {  
                    row[fieldNames[i]] = newRows[r][fieldNames[i]];                                                  
                }                                      
                rows.push(row);                          
            }                        
            entitySet.addMany(rows);            
            $localdb.db.saveChanges( function() {                 
                deferred.resolve() 
            })                      
            
            return deferred.promise();
        }
        
        
        
        
        this.addRow = function(entitySet, row) {
            
            console.log("entitySet ===> ");
            console.log(entitySet);
            console.log(row);
            entitySet.add(row);             
        }
        
        
        
        
        this.updateRow = function(entity, data) {            
            var deferred = $.Deferred();        
         
            log('Updating Entity =>');
            log(data);
            log(entity);
            // map data to entity fields...
            for(f in data) {                 
                entity[f] = data[f];        
            }

            entity.save().
            done(function() {
               console.log('ENTITY UPDATED');
                deferred.resolve('success!');
            });
             return deferred.promise();
        }
        
        
        // Check if entitySet has 0 rows..
        this.isEmpty = function(entitySet) {
            var deferred = $.Deferred();
            entitySet.count(function(n) {
                n === 0 ? deferred.resolve(true) : deferred.resolve(false);                
            })            
            return deferred.promise();            
        }
        
        
        
        
        // Get max Lastmodified entitySet filtered by current user
        // If role = maid or maintenance, we filter by idstaff.
        // TODO: If role = housekeeper or maintenancechief, we filter by idmodule..
        // TODO: if role = manager, wer filter by idhotel.
        // If noRole = true, we don not filter by anything.
        
        this.getMaxLastmodifiedByRole = function(entitySet, role) {
            var deferred = $.Deferred();            
            
            // We consider lastmodified from deleted rows as well (we don't filter deleted)
            
                        
            var role = (typeof role === 'undefined' ? null: role);                        
            var rows = null;
            
            if (role === globals.ROLE_MAID ) {
                  rows = entitySet.filter( function( row ) {                                
                    return row.idhotel === this.idhotel // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idhotel: app.hotel.idhotel })
                .orderByDescending("it.lastmodified").take(1);  
                
              /*  
               rows = entitySet.filter( function( row ) {                            
                    return row.idstaff === this.idstaff || row.idstaff === 0  // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idstaff: app.user.idstaff})
                .orderByDescending("it.lastmodified").take(1);  
                */
            }
            
            if (role === globals.ROLE_MAINTENANCECHIEF || role === globals.ROLE_MAINTENANCE ) {
               rows = entitySet.filter( function( row ) {                            
                    return (row.idmodule === this.idmodule || row.idstaff == app.user.idstaff)
                }, { idmodule: app.user.idmodule})
                .orderByDescending("it.lastmodified").take(1);  
            }
                        
            else if (role === globals.ROLE_HOUSEKEEPER) {
                rows = entitySet.filter( function( row ) {                            
                    return row.idhotel === this.idhotel // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idhotel: app.hotel.idhotel })
                .orderByDescending("it.lastmodified").take(1);  
                
            }
            else if (role === globals.ROLE_MANAGER || role === globals.ROLE_OPERATIONS) { 
                rows = entitySet.filter( function( row ) {                            
                    return row.idhotel === this.idhotel // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idhotel: app.hotel.idhotel })
                .orderByDescending("it.lastmodified").take(1);  
            }
                        
            
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }

        
        
          this.getMaxLastmodifiedTasksByRole = function(role) {
            var deferred = $.Deferred();            
              var entitySet = $localdb.db.Tasks
            
            // We consider lastmodified from deleted rows as well (we don't filter deleted)
            
                        
            var role = (typeof role === 'undefined' ? null: role);                        
            var rows = null;
            
            if (role === globals.ROLE_MAID || role === globals.ROLE_MAINTENANCE  ) {
               rows = entitySet.filter( function( row ) {                            
                    return row.idstaff === this.idstaff || row.idstaff === 0  // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idstaff: app.user.idstaff})
                .orderByDescending("it.lastmodified").take(1);  
            }
            
            if (role === globals.ROLE_MAINTENANCECHIEF || role === globals.ROLE_HOUSEKEEPER ) {
               rows = entitySet.filter( function( row ) {                            
                    return row.idmodule === this.idmodule
                }, { idmodule: app.user.idmodule})
                .orderByDescending("it.lastmodified").take(1);  
            }
            else if (role === globals.ROLE_MANAGER || role === globals.ROLE_OPERATIONS) { 
                rows = entitySet.filter( function( row ) {                            
                    return row.idhotel === this.idhotel // We consider lastmodified from deleted rows as well (we don't filter deleted)
                }, { idhotel: app.hotel.idhotel })
                .orderByDescending("it.lastmodified").take(1);  
            }
                        
            
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }

        
        
        // parenttype 1 = alerts, 2 = tasks
        this.getMaxLastmodifiedActionLog = function(idalert) {
            var deferred = $.Deferred();
                        
            var rows = $localdb.db.ActionLog.filter( function( row ) {            
                return row.idhotel === this.idhotel && row.idalert === this.idalert
            }, { idhotel: app.hotel.idhotel, idalert: idalert})
            .orderByDescending("it.lastmodified").take(1);  
                        
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }
        
        
        this.getMaxLastmodifiedAlertChecklist = function(idalert) {
            var deferred = $.Deferred();
                        
            var rows = $localdb.db.AlertCheckList.filter( function( row ) {            
                return row.idhotel === this.idhotel && row.idalert === this.idalert
            }, { idhotel: app.hotel.idhotel, idalert: idalert})
            .orderByDescending("it.lastmodified").take(1);  
                        
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }
        
         this.getMaxLastmodifiedAlertCheckList = function(idalert, idchecklist) {
            var deferred = $.Deferred();
                        
            var rows = $localdb.db.AlertCheckList.filter( function( row ) {            
                return row.idhotel === this.idhotel && row.idalert === this.idalert && row.idchecklist === this.idchecklist
            }, { idhotel: app.hotel.idhotel, idalert: idalert, idchecklist: idchecklist})
            .orderByDescending("it.lastmodified").take(1);  
                        
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }
        
        
         this.getMaxLastmodified = function(entitySet) {
            var deferred = $.Deferred();
            
            log('getMaxLastmodified');            
            var rows = entitySet.filter( function( row ) {            
                return row.idhotel === this.idhotel// We consider lastmodified from deleted rows as well      
            }, { idhotel: app.hotel.idhotel})
            .orderByDescending("it.lastmodified").take(1);  
                        
            rows.count(function(n){
                log('Rows count: ' + n);
                if (n == 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    rows.forEach(function(e) {
                        lastmodified = e.lastmodified;                        
                    })
                    .done(function() {
                        deferred.resolve(lastmodified);                        
                    })                    
                }    
            })                                    
            return deferred.promise();            
        }
        
        /// PRIVATE METHODS HERE FROM database.js
        
        isStaticTable = function(name) {    
            return ($.inArray(name, _staticTables) != -1);
        }
        
        fieldsToIgnore = function(name) {
           if (isStaticTable(name)) return 0;
           if (name === "AlertType" || "Facility") return 1;
           return 2; 
        }
        
        
        // JayData utility functions
        

        // There is only one lost and found alert type. Lost and Found Alert Category is 3..
        this.getAlerTypeLostAndFound = function() {
            var deferred = $.Deferred();           
            $localdb.db.AlertTypes.first( function( entity ) { return entity.idcategory === 3; }, null, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                         
        }
        
         // There can be more cleaning alert types..need to fix later..
        this.getAlerTypeCleaningTask = function() {
            var deferred = $.Deferred();           
            $localdb.db.AlertTypes.first( function( entity ) { return entity.iscleaningtask === 1; }, null, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                         
        }
        
        this.getAlerTypeByID = function(idalerttype) {
            var deferred = $.Deferred();                       
            $localdb.db.AlertTypes.single( function( entity ) { return entity.idalerttype === id; }, {id: idalerttype}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                    
        }
        
        
        this.getItem = function(iditem) {
            var deferred = $.Deferred();                       
            $localdb.db.Items.single( function( entity ) { return entity.iditem === id; }, {id: iditem}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                    
        }
        
        this.getGeneralTaskType = function(iditem) {
            var deferred = $.Deferred();                       
            $localdb.db.TaskTypes.single( function( entity ) { return entity.iditem === id && entity.idmodule == 4; }, {id: iditem}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();    
            
        }
        
        this.getItemCategory = function(iditemcategory) {
            var deferred = $.Deferred();                       
            $localdb.db.ItemCategories.single( function( entity ) { return entity.iditemcategory === id; }, {id: iditemcategory}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                    
        }
        
        /*this.getFacilityItemType = function(idfacility, iditemtype) {
            var deferred = $.Deferred();                       
            $localdb.db.FacilityItemType.single( function( entity ) { return entity.iditemtype === iditemtype && entity.idfacility === idfacility; }, {idfacility: idfacility, iditemtype: iditemtype }, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                 
        }
        */
        
         this.getTaskTypeByID = function(idtasktype) {
            var deferred = $.Deferred();                       
            $localdb.db.TaskTypes.single( function( entity ) { return entity.idtasktype === id; }, {id: idtasktype}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                    
        }
        this.getTaskTypByID = function(idtasktype) {
            var deferred = $.Deferred();                       
            $localdb.db.TaskTypes.single( function( entity ) { return entity.idtasktype === id; }, {id: idtasktype}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                    
        }
        
       
        this.getWorkingHours = function(idstaff) {
            return $localdb.db.WorkingHours.filter( function( row ) {            
                return row.idstaff === this.idstaff// We consider lastmodified from deleted rows as well      
            }, { idstaff: idstaff});
        }
        
        
        this.getWorkingHour = function(idstaff, weekDay) {
             return $localdb.db.WorkingHours.filter( function( row ) {            
                return row.idstaff === this.idstaff && row.weekday === this.weekDay
            }, { idstaff: idstaff, weekDay: weekDay}).take(1);
        }
        
        this.getCurrentActivity = function(type, id) {            
            var deferred = $.Deferred();
            
            if (id == null) deferred.resolve(null);
            if (type === globals.ACTIVITY_ALERT)
                return this.getAlertInfo(id)                
            if (type === globals.ACTIVITY_TASK)
                return this.getTaskInfo(id);
            else
                deferred.resolve(null);
            
            return deferred.promise();
        }
        
        this.getAlertInfo = function(idalert) {                        
            var deferred = $.Deferred();
                        
            $localdb.db.Alerts.single( function( entity ) { return entity.idalert === id; }, {id: idalert}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function (e) { console.log("error",e); deferred.resolve(null) }
            });     
                          
            return deferred.promise();
            
        },
        
        this.getAlertInfobyuuid = function($uuid) {                        
            var deferred = $.Deferred();
                        
            $localdb.db.Alerts.single( function( entity ) { return entity.uuid === uuid; }, {uuid: $uuid}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });     
                          
            return deferred.promise();
            
        }
        
        this.getTaskInfo = function(idtask) {            
            var deferred = $.Deferred();
                        
            $localdb.db.Tasks.single( function( entity ) { return entity.idtask === id; }, {id: idtask}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });     
                          
            return deferred.promise();
            
        }
        
        
         this.getFacilityOccupancy = function(idfacility) {
             return $localdb.db.Occupancy.filter( function( row ) {            
                return row.idfacility === this.idfacility 
            }, { idfacility: idfacility});
        }
        
        
        
        this.getResolvedAlerts = function(idstaff) {
             var alerts = $localdb.db.Alerts.filter( function( row ) {            
                return row.idstaff === this.idstaff && row.idstatus === globals.ALERT_STATUS_RESOLVED && row.deleted !== 1
            }, { idstaff: idstaff})
            .orderByDescending( function( alert ) { return alert.idalert; } ).take(30);
            return alerts;
        }
        
        
         // averías
         this.getBreakdownsCount = function(date) {                          
             var deferred = $.Deferred();
             
             var previousDay = moment(date.valueOf());
             previousDay.hours(0);
             previousDay.minutes(0);
             previousDay.seconds(0);
             previousDay.subtract(1, 'seconds');
             previousDay.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
             
             
             var nextDay = moment(date.valueOf());
             nextDay.hours(23);
             nextDay.minutes(59);
             nextDay.seconds(59);
             nextDay.add(1, 'seconds');
             nextDay.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
             
             var alerts = $localdb.db.Alerts.filter( function( row ) {            
                return row.reporteddate > previousDay.valueOf() &&                        
                       row.reporteddate < nextDay.valueOf()  &&
                       row.idcategory === globals.ALERT_CATEGORY_ISSUE   &&
                       row.deleted    === 0
            }, { previousDay: previousDay, nextDay: nextDay});
            
            alerts.count(function(n) {
                deferred.resolve(n);
            });
             
             return deferred.promise();
        }
        
          this.getBreakdowns = function(date) {                          
             var deferred = $.Deferred();
              
             var previousDay = moment(date.valueOf());              
             previousDay.hours(0);
             previousDay.minutes(0);
             previousDay.seconds(0);
             previousDay.subtract(1, 'seconds');
             previousDay.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
             
             
             var nextDay = moment(date.valueOf());
             nextDay.hours(23);
             nextDay.minutes(59);
             nextDay.seconds(59);
             nextDay.add(1, 'seconds');
             nextDay.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
             
             var alerts = $localdb.db.Alerts.filter( function( row ) {            
                return row.reporteddate > previousDay.valueOf() &&                        
                       row.reporteddate < nextDay.valueOf()  &&
                       row.idcategory === globals.ALERT_CATEGORY_ISSUE   &&
                       row.deleted    === 0
            }, { previousDay: previousDay, nextDay: nextDay});
            
              
            //alerts = addItems(alerts);
            alerts.count(function(n) {                                
                alerts.toArray( function( result ) { 
                    deferred.resolve(result, n);
                });

            });
             
             return deferred.promise();
        }
        
        
        addItems = function(alerts) {
            alerts.map( function( alert) {
                
                // 1. Get iditem from alertType
                // 2. Get item info from item
                // 3. Add item info to alert
                
                
                
                 
             })                        
        }
        
        
        
                
        this.getFinishedTasks = function(idstaff) {
            var tasks = $localdb.db.Tasks.filter( function( row ) {            
                return row.idstaff === this.idstaff && row.idstatus === globals.TASK_STATUS_FINISHED
            }, { idstaff: idstaff})
            .orderByDescending( function( task ) { return task.idtask; } ).take(30);
            return tasks;
            
        }
        
        
       
        // Checks if an entity with the given id in the row exists in the entitySet.
        // if so, the entity is returned. Otherwise, null is returned.
        this.exists = function(entitySet, row) {
            var deferred = $.Deferred();	    
            
            if (entitySet.name === "Alerts") 
                return existsAlertRow(row);                        
            else if (entitySet.name === "AlertTypes") 
                 return existsAlertTypeRow(row);                
            else if (entitySet.name === "Tasks") 
                 return existsTaskRow(row);                
            else if (entitySet.name === "Facilities") 
                 return existsFacilityRow(row);                
            else if (entitySet.name === "Items") 
                 return existsItemRow(row);                
            else if (entitySet.name === "WorkingHours") 
                 return existsWorkingHourRow(row);                
            else if (entitySet.name === "Staff") 
                 return existsStaffRow(row);                  
            else if (entitySet.name === "ItemCategories") 
                 return existsItemCategoryRow(row);      
            else if (entitySet.name === "ActionLog") 
                 return existsActionLogRow(row);      
            else if (entitySet.name === "Occupancy") 
                 return existsOccupancyRow(row);      
             else if (entitySet.name === "AlertCheckList") 
                 return existsAlertCheckListRow(row);   
            
            else             
                return deferred.resolve(null);
            
            return deferred.promise();
            
            /*
            var keyName =  $localdb.keyName(entitySet);
            var keyValue = $localdb.keyValue(entitySet, row);
            log('keyName');
            log(keyName);
            log('keyValue');
            log(keyValue);
            */
           // deferred.resolve(null);
            
            // Si no existe, da un error...
            
            //var result = entitySet.filter('this.idalert', "==", 3);
            
            // OPCIONES
            //hacer una función que use single para alertas y tareas...más eficiente..
            // Para las otras tables...usar filter y first para no tener que hacer una función para cada una...
            
            
            
            
                        
            /*var result = entitySet.filter(function(entity) { 
                return entity[keyName] === key; }, { key: 3, keyName: 'idalert'});*/ 
            return deferred.promise();   
        }
        
        // returns $data.Queryable
        this.facilityItemTypes = function(idfacility) {
            return $localdb.db.FacilityItemType.filter('idfacility', "==", idfacility);            
        }
        
        
        // retrieve te key Value from row, that corresponds to the given entitySet        
        this.keyValue = function(entitySet, row) {    
            return  row[$localdb.keyName(entitySet)];
        }
        
        
       
        
        //Removes not syn data if set has more than 500 rows...
        this.cleanEntity = function(entitySet) {                       
            var deferred = $.Deferred();
            log("Cleaning " + entitySet.name);
            
            entitySet.count(function(n) {  
                if (n < 10) { 
                    log('Clean no necesario...');
                    deferred.resolve();                                    
                    }
                else {     
                    log('Clean Necesario...');
                    entitySet.forEach(function (entity) {     
                        if (entitySet.insync == 1)
                           entitySet.remove(entity);
                    })
                    .then(function() { // success                                
                        $localdb.db.saveChanges();
                        deferred.resolve();                        
                    });      
                    }
            });
            
            
            
            return deferred.promise();
        }
        
        
        // Verifica a ver si hay tareas del usuario dado que estén en progreso.
        // Retorna booleano y la alerta en progreso.
        this.hasRunningTask = function(idstaff) {           
            var deferred = $.Deferred();
            
            var rows = $localdb.db.Alerts.filter(function(e) { 
                    return e.idstaff == this.idstaff && e.idstatus == globals.ALERT_STATUS_IN_PROGRESS && e.deleted == 0}, {idstaff: idstaff});  
            
            rows.count(function(n) {                    
                var alert = null;
                if (n > 0) {
                     rows.forEach(function(e) {
                         deferred.resolve(true , e );                      
                    })
                }
                else
                    deferred.resolve( false , null);
                
            })                        
            return deferred.promise();                          
        }
        
        // Unfortunatly, entitySet.removeAll triggers an error in some providers...so I implemented this method (Matthias)
        this.removeAll = function(entitySet) {                       
            var deferred = $.Deferred();
            log("Removing All Rows FROM " + entitySet.name);
            entitySet.forEach(function (entity) {                                 
                   entitySet.remove(entity);
            })
            .then(function() { // success                                
                $localdb.db.saveChanges();
                deferred.resolve();
                //smartdb.printCount(entitySet, function(){ deferred.resolve()});       
            });      
            
            return deferred.promise();
        }
        
        
        
        this.keyName = function(entitySet) {                                
            
            if (entitySet.tableName === 'Facilities')
                return 'idfacility';
            else if (entitySet.tableName === 'Staff')
                return 'idstaff';
            else if (entitySet.tableName === 'Hotel')
                return 'idhotel';           
            else if (entitySet.tableName === 'AlertTypes')
                return "idalerttype";
            else if (entitySet.tableName === 'Item')
                return "iditem";
            else if (entitySet.tableName === 'ActionLog')
                return "idactionlog";
            else if (entitySet.tableName === 'Occupancy')
                return "idoccupancy";
            else if (entitySet.tableName === 'AlertCheckList')
                return "idchecklistoption";
            
            else
                return 'id' + entitySet.tableName.toLowerCase().substring(0,  entitySet.name.length - 1);                        
        }
        
                
        this.showCount = function(entitySet, msg) {
            entitySet.count(function(n) {        
                console.info("Count of " + entitySet.name + " : " + n + msg);       
            })           
        }
        
        
        
        this.toArray = function(entitySet) {
            var deferred = $.Deferred();    
            var array = [];    
            entitySet.forEach(function(entity) {
                array.push(entity.toJSON())
            })
            .done(function() {
    	        deferred.resolve(array);    
            })    
            return deferred.promise();
        }
        
        
        
        /// UPDATING SINGLE ENTITIES
        
        this.updateAlert = function(row) {
            var deferred = $.Deferred();
            
            if (row.idalert == globals.MAX_INT) {                
                 existsAlertRowGuid(row.guid)
                .done(function(entity) {
                    if (entity == null) {// if row does not exist locally, then insert.                                                                            
                        $localdb.addRow($localdb.db.Alerts,row);
                        $localdb.db.saveChanges( function() {                 
                            deferred.resolve(null)  // hay que devolver guid del nuevo row
                        })                      
                    } else {
                        log('Row exists -> Update');
                        $localdb.updateRow(entity, row)
                        .done(function() {
                            deferred.resolve(entity.guid);
                        })                    
                    }      
                    
                })
                
            }
            else {
                $localdb.exists($localdb.db.Alerts, row)
                .done(function(entity) {     
                    if (entity == null) {// if row does not exist locally, then insert.                                                                            
                        $localdb.addRow($localdb.db.Alerts,row);
                        $localdb.db.saveChanges( function() {                 
                            deferred.resolve(null)  // hay que devolver guid del nuevo row
                        })                      
                    } else {
                        log('Row exists -> Update');
                        $localdb.updateRow(entity, row)
                        .done(function() {
                            deferred.resolve(entity.guid);
                        })                    
                    }                
                })                      
            }
            
            return deferred.promise();            
        }
        
        
        
         this.updateAlertNew = function(row, guid) {
            var deferred = $.Deferred();
                         
             
            existsAlertRowGuid(guid)
            .done(function(entity) {     
                if (entity == null) {// if row does not exist locally, then insert.                                                                            
                    /*$localdb.addRow($localdb.db.Alerts,row);
                    $localdb.db.saveChanges( function() {                 */
                        deferred.resolve() 
                    //})                      
                } else {
                    log('Row exists -> Update');
                    $localdb.updateRow(entity, row)
                    .done(function() {
                        deferred.resolve();
                    })                    
                }                
            })      
            
            return deferred.promise();            
        }
        
        
        
        
        
         this.updateTask = function(row) {
            var deferred = $.Deferred();
            
            $localdb.exists($localdb.db.Tasks, row)
            .done(function(entity) {                
                if (entity == null) {// if row does not exist locally, then insert.                                    
                    log('Row does not exist -> Insert');
                    console.log(row);
                    $localdb.addRow($localdb.db.Tasks,row);                                        
                    $localdb.db.Tasks.saveChanges();
                    deferred.resolve();
                } else {
                    log('Row exists -> Update');
                    $localdb.updateRow(entity, row)
                    .done(function() {
                        deferred.resolve();
                    })                    
                }                
            })      
            
            return deferred.promise();            
        }
        
        
        // Looks were alertguid = guid and updates idalert with idalert from backend.....
        this.updateActionLogsForAlertGuid = function(idalert, guid) {
            var deferred = $.Deferred();
            var that = this;
            
            var entitySet = $localdb.db.ActionLog;
            
            console.info('updateActionLogsForAlertGuid');
            console.info(idalert);
            console.info(guid);
            
            this.updateActionLogsBasedOnAlertGuid(idalert,guid);
            
            
            /*var rows = entitySet.filter(function(e) { return e.alertguid == this.guid}, {guid: guid});            
             
            that.updateActionLogBasedOnAlertGuid(rows, idalert)
            .done(function(result) {
                 $localdb.db.saveChanges( function() {                 
                    deferred.resolve(result) 
                 })  

             })
             .fail(function(error) {
                 deferred.reject(error);
             })
            */
            
            
            
            
                 
            return deferred.promise();
            
        }
        
         this.updateAlertchecklistForAlertGuid = function(idalert, guid) {
            var deferred = $.Deferred();
            var that = this;
            console.log("paso por el dos");
            var entitySet = $localdb.db.AlertCheckList;
            
            console.info(idalert);
            console.info(guid);
             if(guid == null || idalert ==  globals.MAX_INT ){
                 deferred.resolve();
             }
            
            this.updateAlertchecklistsBasedOnAlertGuid(idalert,guid).done(function(){
                deferred.resolve();
            });
         
            return deferred.promise();
        }
        
        this.updateActionLogsBasedOnAlertGuid = function( idalert, guid) {
            var that = this;
            var entitySet = $localdb.db.ActionLog;
            var promises = [];            
            console.log("guid====>",guid);
             $localdb.db.ActionLog.forEach(function(entity) {
                if (entity.alertguid == guid) {
                    console.info(entity);
                    promises.push(that.updateActionLogBasedOnAlertGuid(entity,idalert));
                }
            });
            
            
           /* rows.forEach(function(row) {
                promises.push(updateActionLogBasedOnAlertGuid(row, idalert));
            });
            */
                        
            return $.when.apply($,promises);         
            
        } 
        
        this.updateAlertchecklistsBasedOnAlertGuid = function( idalert, guid) {
            var that = this;
            var entitySet = $localdb.db.AlertCheckList;
            var promises = [];            
            console.log("paso por el tres");
            
         /*  var rows = $localdb.db.AlertCheckList.filter( function( row ) {            
                return row.alertguid == this.alertguid
            }, {alertguid: guid});
            
             rows.forEach(function(entity) {
                 console.log("paso por el cuatro");
                 
                if (entity.alertguid == guid) {
                    console.info("paso por el update");
                    promises.push(that.updateAlertchecklistBasedOnAlertGuid(entity,idalert));
                }
            });*/
            
            $localdb.db.AlertCheckList.forEach(function(entity) {
                if (entity.alertguid == guid && entity.idalert ==  globals.MAX_INT) {
                    promises.push(that.updateAlertchecklistBasedOnAlertGuid(entity,idalert));
                }
            });
                        
            return $.when.apply($,promises);           
        }
        
        this.updateActionLogBasedOnAlertGuid = function(row, idalert) {            
            var deferred = $.Deferred();
            
            console.info('');
            console.info(idalert);
            
            row.idalert = idalert;
            //deferred.resolve();
            row.save()
            .done(function() {
                deferred.resolve();
            })
            

            return deferred.promise();
        }
        
        this.updateAlertchecklistBasedOnAlertGuid = function(row, idalert) {            
            var deferred = $.Deferred();
            
            console.info('');
            console.info(idalert);
            
            row.idalert = idalert;
            //deferred.resolve();
            row.save()
            .done(function() {
                deferred.resolve();
            })
            

            return deferred.promise();
        }
      
        // Updates a new row (insync = false, idactionlog = -1) , using guid to search, and updating idactionlog        
        this.updateNewActionLog = function(row, guid) {
            var deferred = $.Deferred();
            
            console.info('ACA');
            console.info(guid);
            console.info(row);
            
            existsActionLogRowGuid(guid)
            .done(function(entity) {                
                console.info("EXISTS");
                if (entity == null) {// if row does not exist locally, then insert.                                    
                    deferred.resolve();
                } else {
                    log('Row exists -> Update');
                    $localdb.updateRow(entity, row)
                    .done(function() {
                        deferred.resolve();
                    })                    
                }                
            })  
            
            
            
            return deferred.promise();
            
        }
        
        this.updateActionLog = function(row) {
            var deferred = $.Deferred();
            
            $localdb.exists($localdb.db.ActionLog, row)
            .done(function(entity) {                
                if (entity == null) {// if row does not exist locally, then insert.                                    
                    deferred.resolve();
                } else {
                    log('Row exists -> Update');
                    $localdb.updateRow(entity, row)
                    .done(function() {
                        deferred.resolve();
                    })                    
                }                
            })      
            
            return deferred.promise();            
        }
        
        
        // Finds occupanices where idfacility matches...
        this.updateOccupancyRoomReady = function(idfacility, ready) {
            var deferred = $.Deferred();
            
            $localdb.db.Occupancy.forEach(function(entity) {
                if (entity.idfacility == idfacility) {
                    console.info(entity);
                    entity.ready = ready;              
                    entity.save();
                }
            })
            .done(function() {
                $localdb.db.Facilities.forEach(function(facility) {
                    if (facility.idfacility == idfacility) {                   
                        facility.ready = ready;              
                        facility.save();
                    }
                })
                .done(function() {
                    deferred.resolve();    
                });
            });
            
            
            return deferred.promise();            
        }
        // Finds occupanices where idfacility matches, to change status
        this.updateOccupancyRoomisclean = function(idfacility, status,uuid,name) {
            var deferred = $.Deferred();
            
            $localdb.db.Occupancy.forEach(function(entity) {
                if (entity.idfacility == idfacility) {
                    console.info(entity);
                    entity.iscleaningstatus = status;   
                    if(name !== "") entity.namestaff = name;   
                    if(uuid !== 0) entity.alertguid = uuid;
                    entity.save();
                }
            })
            .done(function() {
                    deferred.resolve();    
            });
            
            
            return deferred.promise();            
        }
        
        
        this.updateAlertChecklist = function(option) {
            var deferred = $.Deferred();
            console.log("*****option*****",option);
            existsAlertCheckListRow(option)
            .done(function(row) {         
                if (row == null) {deferred.resolve();}
                console.log("*****row*****",row);
                row.value = option.value;
                row.insync  = false;
                row.save();
                deferred.resolve();
            })
            
            
            
            return deferred.promise();            
        }
        
        this.createAlertChecklist = function(idchecklist,idalert,alertuuid) {
            var deferred = $.Deferred();
                      
            var rows = $localdb.db.ChecklistOption.filter( function( row ) {            
                return row.idhotel === this.idhotel && row.idchecklist === this.idchecklist
            }, { idhotel: app.hotel.idhotel, idchecklist: idchecklist});
          
            rows.count(function(n){                
                if (n === 0) deferred.resolve(null);                                    
                else {
                    var lastmodified = null;
                    
                    var $entity = $localdb.db.AlertCheckList;
                    rows.forEach(function(row) {
                        
                        var alertChecklist = {idhotel :  app.hotel.idhotel,idalert : idalert , idchecklist :idchecklist, idchecklistoption : row.idchecklistoption, optionsection: row.optionsection,optiontype : row.optiontype,
                                               optiontype: row.optiontype,value : 0,
                                               name: row.name,deleted : 0,
                                               insync: true,
                                               alertguid: alertuuid,
                            lastmodified : row.lastmodified};
                        
                        $localdb.addRow($entity,alertChecklist); 
                        console.log(alertChecklist);
                        console.log(idalert);
                    })
                    .done(function() {
                         $localdb.db.saveChanges(
                         function() {                 
                              deferred.resolve(null)  // hay que devolver guid del nuevo row
                            })                        
                    }) 
                }    
            })                                    
     
            return deferred.promise();            
        }
        
        ///// HIDDEN ///////////////
        
        // CHECK if a given alert exists..
        // It receieves the row retrieved normally from the backend.
        // Returns the entity if found. otherwise, null.
        existsAlertRow = function(row) {            
            var deferred = $.Deferred();           
            $localdb.db.Alerts.single( function( entity ) { return entity.idalert === this.id; }, { id: $localdb.keyValue($localdb.db.Alerts, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();       
        }
       
        
        existsAlertTypeRow = function(row) {
            var deferred = $.Deferred();
            log('existsAlertTypeRow');
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.AlertTypes.single( function( entity ) { return entity.idalerttype === this.id; }, { id: $localdb.keyValue($localdb.db.AlertTypes, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                   
        }
        
         existsTaskRow = function(row) {
            var deferred = $.Deferred();
            log('existsTaskRow');
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Tasks.single( function( entity ) { return entity.idtask === this.id; }, { id: $localdb.keyValue($localdb.db.Tasks, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                   
        }
        
         existsFacilityRow = function(row) {
            var deferred = $.Deferred();
            log('existsFacilityRow');
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Facilities.single( function( entity ) { return entity.idfacility === this.id; }, { id: $localdb.keyValue($localdb.db.Facilities, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                   
        }
        
        
        existsItemRow = function(row) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Items.single( function( entity ) { return entity.iditem === this.id; }, { id: $localdb.keyValue($localdb.db.Items, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                   
        }
        
        
        existsWorkingHourRow = function(row) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.WorkingHours.single( function( entity ) { return entity.idworkinghour === this.id; }, { id: $localdb.keyValue($localdb.db.WorkingHours, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                   
        }
        
        
         existsStaffRow = function(row) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Staff.single( function( entity ) { return entity.idstaff === this.id; }, { id: $localdb.keyValue($localdb.db.Staff, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                        
        }
        
        
        existsItemCategoryRow = function(row) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.ItemCategories.single( function( entity ) { return entity.iditemcategory === this.id; }, { id: $localdb.keyValue($localdb.db.ItemCategories, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });
                        
            return deferred.promise();                        
        }
        
        
         existsActionLogRow = function(row) {
            var deferred = $.Deferred();                                    
             
             
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.ActionLog.single( function( entity ) { return entity.idactionlog === this.id; }, { id: $localdb.keyValue($localdb.db.ActionLog, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                        
        }
        
        
         existsActionLogRowGuid = function(guid) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.ActionLog.single( function( entity ) { return entity.guid === this.id; }, { id: guid}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                        
        }
        
        
        existsAlertRowGuid = function(guid) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Alerts.single( function( entity ) { return entity.guid === this.id; }, { id: guid}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                        
        }
        
         existsOccupancyRow = function(row) {
            var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            $localdb.db.Occupancy.single( function( entity ) { return entity.idoccupancy === this.id; }, { id: $localdb.keyValue($localdb.db.Occupancy, row)}, {
                success: function ( result ){ deferred.resolve(result)},
                error: function () { deferred.resolve(null) }
            });                        
            return deferred.promise();                        
        }
        
        existsAlertCheckListRow = function(row) {
            
              var deferred = $.Deferred();                       
            // single retorna error si hay más de un registro que cumple el criterio....
            
            if(row.alertguid == null || row.alertguid == '0'){
            
                    $localdb.db.AlertCheckList.single( function( entity ) { return entity.idchecklistoption === this.id && entity.idalert === this.idalert; },
                         { id: $localdb.keyValue($localdb.db.AlertCheckList, row),
                           idalert: row.idalert}, {
                        success: function ( result ){ deferred.resolve(result)},
                        error: function () { deferred.resolve(null) }
                    });    
            }else{
                    $localdb.db.AlertCheckList.single( function( entity ) { return entity.idchecklistoption === this.id && entity.alertguid === this.alertguid; },
                         { id: $localdb.keyValue($localdb.db.AlertCheckList, row),
                           alertguid: row.alertguid}, {
                        success: function ( result ){ deferred.resolve(result)},
                        error: function () { deferred.resolve(null) }
                    });   
            }
            return deferred.promise();
                        
        }
        
        
        
        
        
        
        //// jayData Model
       
        createJayDataEntities = function() {
                                    
                        
            $data.Entity.extend("Hotel", {
                idhotel         : { type: "int"},
                name            : { type: String},
                onlyfreealerts  : { type: "int"},

                lastmodified   : { type: "int"},                                      
            });
            
            $data.Entity.extend("Occupancy", {
                idoccupancy   :       { type: "int"},
                idhotel       :       { type: "int"},
                status        :       { type: String},
                guest         :       { type: String},
                facilityname  :       { type: String},
                idfacility    :       { type: "int"},
                checkin       :       { type: "int"},
                checkout      :       { type: "int"},
                checkedin     :       { type: "int"},
                checkedout    :       { type: "int"},
                pax           :       { type: "int"},
                ready         :       { type: "int"},
                idalert       :       { type: "int"},
                iscleaningstatus :     { type: "int"},
                origin        :       { type: String},  // from were do they come from...USA, Canada, etc
                guestlog      :       { type: String},
                complaints    :       { type: String},
                
                hascredit     :       { type: "int"},
                guestactivity :       { type: "int"},
                activitytime  :       { type: "int"},
                
                
                lastmodified  : { type: "int"},
                deleted       : { type: "int"},
                alertguid     : { type: String, defaultValue: '0' },  
                namestaff     : { type: String, defaultValue: '0' },  
                guid          : { type: "int", key: true, computed: true},                                            
            });
            
            
            
             $data.Entity.extend("GuestActivity", {
                idguestactivity :       { type: "int"},
                idhotel         :       { type: "int"},
                name            :       { type: String},                
                
                lastmodified  : { type: "int"},
                deleted       : { type: "int"},
                
                guid          : { type: "int", key: true, computed: true},                                
            });
            
            
            $data.Entity.extend("Facility",{
                idfacility    : { type: "int"},
                idhotel       : { type: "int"},
                idtype        : { type: "int"}, 
                type          : { type: String},
                name          : { type: String},
                lodging       : { type: "int"},
                ready         : { type: "int"},
                
                zone          : { type: String},
                parentzone    : { type: String},
                
                guest         : { type: String},
                
                lastmodified  : { type: "int"},
                deleted       : { type: "int"},
                
                guid          : { type: "int", key: true, computed: true},                                
            });
            
                      
            
            
            $data.Entity.extend("Item", {
                iditem            : { type: "int"},                
                idhotel           : { type: "int"},
                iditemcategory    : { type: "int"},   // Baño, Muebles, Servicios, Instalaciones                             
                name              : { type: String},
                image             : { type: String, maxLength: 200},   
                //lodging           : { type: "int"},
                request           : { type: "int"},
                sortnumber        : { type: "int"},
                lastmodified      : { type: "int"},
                deleted           : { type: "int"},
                
                guid              : { type: "int", key: true, computed: true},    
            })
            
            
            
            $data.Entity.extend("Location", {
                idlocation        : { type: "int"},                
                idhotel           : { type: "int"},                
                name              : { type: String},                
                image             : { type: String, maxLength: 200},   
                lodging           : { type: "int"},
                request           : { type: "int"},
                
                lastmodified      : { type: "int"},
                deleted           : { type: "int"},
                
                guid              : { type: "int", key: true, computed: true},    
            })
            
            $data.Entity.extend("ItemLocation", {
                iditemlocation    : { type: "int"},                
                idhotel           : { type: "int"},                               
                iditem            : { type: "int"},
                idlocation        : { type: "int"},
                
                lastmodified      : { type: "int"},
                deleted           : { type: "int"},
                
                guid              : { type: "int", key: true, computed: true},    
            })
            
            
            $data.Entity.extend("Staff", {
                idstaff    : { type: "int"},
                idhotel    : { type: "int"},
                idmodule   : { type: "int"},
                idrole     : { type: "int"},
                name       : { type: String},
                lastname   : { type: String},
                type       : { type: String},
                role       : { type: String},
                avatar     : { type: String},
                available  : { type: "int"},
                
                currentactivitytype  : { type: "int"},
                currentactivityid    : { type: "int"},
                                
                
                lastmodified  : { type: "int"},
                deleted       : { type: "int"},
                
                guid          : { type: "int", key: true, computed: true},    
            })
            
            
              
            $data.Entity.extend("WorkingHour", {
                idworkinghour : { type: "int"},
                idhotel       : { type: "int"},
                idstaff       : { type: "int"},
                weekday       : { type: "int"},
                free          : { type: "int"},
                
                starttime     : { type: String},
                endtime       : { type: String},
                
                lastmodified  : { type: "int"},
                deleted       : { type: "int"},
                
                guid          : { type: "int", key: true, computed: true},    
            })
            
            
            
            
            
            
            /*************************/
            /*        ALERTS         */
            /*************************/
            
            $data.Entity.extend("Alert", {    
                idalert        : { type: "int", defaultValue: 0},                
                idhotel        : { type: "int"},
                
                idcategory     : { type: "int", defaultValue: 1},                
                idtypecategory : { type: "int"},  // issue, request, lost and found
                
                idcycletask    : {type: "int"}, // plan de trabajo
                
                idchecklist    : {type: "int"},
                
                name           : { type: String},     
                idstaff        : { type: "int"},
                idmodule       : { type: "int"},                
                iddepartment   : { type: "int"},
                
                idtype         : { type: "int"},
                idtypename     : { type: String},
                iditem         : { type: "int"},
                itemname       : { type: String},                
                itemimage      : { type: String},       
                
                idlocation     : { type: "int"},
                    
               // idtask         : { type: "int"},  // when creating task from alert
                iscleaningtask : { type: "int"}, 
                
                idcategory     : { type: "int"},        // Solicitud, Problema, L&F
                idpriority     : { type: "int"},       
                idstatus       : { type: "int"},
                
                idfacility     : { type: "int"},                                                    
                notes          : { type: String},   
                tag            : { type: "int"},
                action         : { type: "int"},
                
                pictures       : { type: String},   // offline  pictures before it has been sent to telerik backend...(only app)
                uris           : { type: String},   // url to picture(s) stored in telerik backend
                
                reporteddate   : { type: "int"},
                reportedby     : { type: "int"},
                
                assignedby      : { type: "int"},
                byguest         : { type: "int"},  // 1 = issue reported by guest...
                byhousekeeper   : { type: "int"},  // 1 = housekeeper can take ownership of maintenance alert
                
                alerttotask     : {type: "int"},
                
                willcheckdate  : { type: "int"},
                start          : { type: "int"},
                startdate      : { type: "int"},
                resumedate     : { type: "int"},
                
                //startdatelocal : { type: "int"},    // Para efectos del cronómetro..
                
                
                finish           : { type: "int"},
                finishdate       : { type: "int"},               
                expectedduration : { type: "int"},  // in minutes
                duration         : { type: "int"},  // in seconds
                evaluation       : { type: "int"},
                isapproved       : { type: "int"},
                
                guest            : { type: String},               
                
                movelast       : {type: "int", defaultValue: 0}, //move alert at the end of listview
                
                lastmodified   : { type: "int"},    // timestamp de última modificación en el servidor (NO local)    
                deleted        : { type: "int", defaultValue: 0},
                
                // If we create/change an alert while beeing offline,
                // we set inSync = false
                // Si fue creado offline, le idalert puede ser -1 por ejemplo,
                // por lo tanto no ocupamos localKey
                insync        : { type: Boolean, defaultValue: true },        
                
                // Unique identifier for local database...
                // Needed because without it sometimes some
                // records don´t get deleted, etc.
                guid          : { type: "int", key: true, computed: true},
                
                uuid          :  { type: String}
                
            });
            
           
            
            $data.Entity.extend("AlertType", {
                idalerttype      : { type: "int"},
                idhotel          : { type: "int"},
                idmodule         : { type: "int"},
                idcategory       : { type: "int"},                
                iditem           : { type: "int"}, // Zonas comunes no tiene items.                
                idfacility       : { type: "int"}, // Si es para zona común, se indica la facilidad acá.
                fortaskonly      : { type: "int"},
                iscleaningtask   : { type: "int"},
                
                // En el caso de una solicitud, no se usa este campo (name).
                // Para problemas -> Ej: W/C taqueado..
                name             : { type: String, maxLength: 45},   
                                
                idpriority       : { type: "int"},
                expectedduration : { type: "int"},  // seconds                
                count            : { type: "int"},
                
                idchecklist      : {type: "int"},
                
                requiressolutiontext : { type: "int"},   
                
                lastmodified     : { type: "int"}, 
                deleted          : { type: "int", defaultValue: 0},
                
                guid             : { type: "int", key: true, computed: true},            
                
            });
            
            
             $data.Entity.extend("AlertCheckList", {                 
                 idalertchecklist  : {type: "int"},
                 idchecklist       : {type: "int"},     
                 
                 idhotel           : {type: "int"},
                 idalert           : { type: "int"},                   
                 idchecklistoption : { type: "int"},
                 optiontype        : { type: "int"},
                 optionsection     : { type: String},
                 name              : { type: String}, 
                 value             : { type: String},     //0 | 1
                         
                 lastmodified     : { type: "int"}, 
                 deleted          : { type: "int", defaultValue: 0},
                 
                 insync           : { type: Boolean, defaultValue: true },       
                 alertguid        : { type: String, defaultValue: '0' },       
                
                 guid             : { type: "int", key: true, computed: true},            
                
            });
            
            
           $data.Entity.extend("ChecklistOption", {
               idchecklistoption     : { type: "int"},
               idhotel               : { type: "int"},   
               idchecklist           : { type: "int"}, 
               name                  : { type: String}, 
               optiontype            : { type: "int"}, 
               
                lastmodified     : { type: "int"}, 
                deleted          : { type: "int", defaultValue: 0},
                
                guid             : { type: "int", key: true, computed: true},                                     
           });
            
            
              
            $data.Entity.extend("CleaningTask", {
                idcleaningtask   : { type: "int"},
                idhotel          : { type: "int"},                                
                idfacility       : { type: "int"}, 
                idstaff          : { type: "int"}, 
                idtasktype       : { type: "int"}, 
                
                lastmodified     : { type: "int"}, 
                deleted          : { type: "int", defaultValue: 0},
                
                guid             : { type: "int", key: true, computed: true},            
                
            });
            
          
            
            // Task Queue for processing remote requests
            
            
             // Para manejo de comentarios/sugerencias/comunicados, etc.
            $data.Entity.extend("ActionLog", {
                idactionlog    : { type: "int"},            
                idhotel        : { type: "int"},
                idmodule       : { type: "int"},
                idstaff        : { type: "int"},
                action         : { type: "int"}, 
                prompt         : { type: String },                
                
                picture        : { type: String},   // offline  picture before it has been sent to telerik backend...(only app)
                uris           : { type: String},   // url to picture(s) stored in telerik backend
                
                idalert        : { type: "int"},                 
                alertguid      : { type: "int"},  // when actionlog is created and idalert not available yet (offline)  
                                
                lastmodified   : { type: "int"},
                deleted        : { type: "int"},
                
                insync         : { type: Boolean, defaultValue: true },                        
                uidd         : { type: String, defaultValue: '0' },                        
                
                guid           : { type: "int", key: true, computed: true}            
                
            });
            
            
            // Poder esconder/mostrar ciertos items según el tipo de facilidad escogido
            $data.Entity.extend("RuleFacilityTypeItem", {
                idrulefacilitytypeitem    : { type: "int"},            
                idhotel        : { type: "int"},
                
                idfacilitytype : { type: "int"},
                iditem         : { type: "int"},
                
                showonly       : { type: "int"}, 
                hidefrom       : { type: "int"},                                                
                                
                lastmodified   : { type: "int"},
                deleted        : { type: "int"},
                                                
                guid           : { type: "int", key: true, computed: true}            
                
            });
            
             // Poder esconder/mostrar categorías de item según la facilidad...
            $data.Entity.extend("RuleFacilityTypeLocation", {
                idrulefacilitytypelocation    : { type: "int"},            
                idhotel        : { type: "int"},
                
                idfacilitytype     : { type: "int"},
                idlocation         : { type: "int"},
                
                showonly       : { type: "int"}, 
                hidefrom       : { type: "int"},                                                
                                
                lastmodified   : { type: "int"},
                deleted        : { type: "int"},
                                                
                guid           : { type: "int", key: true, computed: true}            
                
            });
            
            
            $data.Entity.extend("Priority", {
                idpriority     : { type: "int"},            
                idhotel        : { type: "int"},
                
                name           : { type: String},
                
                color          : { type: String},                
                backgroundcolor: { type: String}, 
                
                iscritic       : { type: "int"},                                                
                                                
                                                
                guid           : { type: "int", key: true, computed: true}            
                
            });
            
            
            
            
            
            
        } 
        
        this.initLocalDatabase = function() {            
            $data.EntityContext.extend("SmartHotelDataBase", {    
                
               // Hotel:              { type: $data.EntitySet, elementType: Hotel },                                        
                Occupancy:          { type: $data.EntitySet, elementType: Occupancy },                                          
                GuestActivity:      { type: $data.EntitySet, elementType: GuestActivity },                                          
                
                Alerts:             { type: $data.EntitySet, elementType: Alert },                
                AlertTypes:         { type: $data.EntitySet, elementType: AlertType },
                AlertCheckList:     { type: $data.EntitySet, elementType: AlertCheckList },
                
                ChecklistOption:    { type: $data.EntitySet, elementType: ChecklistOption },
                
                CleaningTask:       { type: $data.EntitySet, elementType: CleaningTask },                
                
                Priorities:         { type: $data.EntitySet, elementType: Priority },                   
                
                Facilities:         { type: $data.EntitySet, elementType: Facility }, 
                Items:              { type: $data.EntitySet, elementType: Item}, 
                Locations:          { type: $data.EntitySet, elementType: Location}, 
                ItemLocations:      { type: $data.EntitySet, elementType: ItemLocation}, 
                
                Staff:              { type: $data.EntitySet, elementType: Staff}, 
                //WorkingHours:       { type: $data.EntitySet, elementType: WorkingHour}, 
                
                ActionLog:          { type: $data.EntitySet, elementType: ActionLog},    
                
                RulesFacilityTypeItem: { type: $data.EntitySet, elementType: RuleFacilityTypeItem},    
                
                RulesFacilityTypeLocation: { type: $data.EntitySet, elementType: RuleFacilityTypeLocation},    
                                
            }); 
            this.db = new SmartHotelDataBase('DingDone');                            
        }

    }  // localDB
    
    window.LocalDB = LocalDB;
    
    
}) (window)

var $localdb = new LocalDB();
$localdb.init();
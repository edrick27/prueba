// Matthias Malek
// SuisseWorks
// Dic, 2015
// Controller for handling Tasks and Alerts
// This controller interfaces with RestAPI and LocalDB.
// Smart should not talk directly to RestAPI and LocalDB


(function(window) {
    
    function TaskController() {
        
        
        var _DEBUG      = true;                
        var log = function(msg) {
            if (_DEBUG) console.log(msg);
        }
        
       
        // TaskController will always keep this numbers up to date.
        this.data = {
            alerts: {                
                pending: 0,
                inprogress: 0,
                paused: 0,
                resolved: 0,
                notresolved: 0,  /* pending + inprogress */
                total: 0,
                progress: 0,
            },             
            tasks: {
                pending: 0,
                inprogress: 0,
                paused: 0,
                resolved: 0,
                notresolved: 0,  /* pending + inprogress */
                total: 0,
                progress: 0,
            },
            all: {
                pending: 0,
                inprogress: 0,
                paused: 0,
                resolved: 0,
                notresolved: 0,  /* pending + inprogress */
                total: 0,
                progress: 0,
            },              
            effectivity    : 0,
            delay          : 0,  
            hasdelay       : 0,
                        
        };  
        
        
        
        var _tasks       =  [];
        var _alerts      =  [];
        var _facilities  =  [];  // stats
        
        var _breakdowns         = {};  // averías
        var _breakdownshistory  = {};  // averías
        
        
        
        this.getData = function() {
            return this.data;
        }
        
        this._gettasks = function() {
            return _tasks;
        }
        
        this._getfacilities = function() {
            return _facilities;
        }
        
        
        this.cleanData = function() {            
            this.data.alerts.pending = this.data.alerts.inprogress = this.data.alerts.resolved = this.data.alerts.total = this.data.alerts.notresolved = this.data.alerts.paused =0 ;            
            this.data.tasks.pending = this.data.tasks.inprogress = this.data.tasks.resolved = this.data.tasks.total = this.data.tasks.notresolved = this.data.tasks.paused =0 ;
        }
        
        
        
       // Updates data with the current number of tasks and alerts grouped by their status.
        // ONLY TODAY DATA..+ pending stuff
        this.refreshData = function() {
            var deferred = $.Deferred();           
            var that = this;
            
            
            this.cleanData();
            asKendoDataSourceNG($localdb.db.Alerts, generateFilterToday(),  {})                
            .done(function(ds) {
                ds.fetch(function() {                
                    view = ds.view();                                        
                        _alerts = view; // used globally
                        for (var n=0; n<view.length; n++) {         
                            
                            if (view[n].idcategory == globals.IS_ALERT) {
                                switch (view[n].idstatus) {
                                    case globals.ALERT_STATUS_PENDING: that.data.alerts.pending++; break;
                                    case globals.ALERT_STATUS_IN_PROGRESS: that.data.alerts.inprogress++; break;
                                    case globals.ALERT_STATUS_PAUSED: that.data.alerts.paused++ ; break;
                                    case globals.ALERT_STATUS_RESOLVED: that.data.alerts.resolved++; break;                                    
                                }
                            } else if (view[n].idcategory == globals.IS_TASK) {
                                switch (view[n].idstatus) {
                                    case globals.ALERT_STATUS_PENDING: that.data.tasks.pending++; break;
                                    case globals.ALERT_STATUS_IN_PROGRESS: that.data.tasks.inprogress++; break;
                                    case globals.ALERT_STATUS_PAUSED: that.data.tasks.paused++ ; break;
                                    case globals.ALERT_STATUS_RESOLVED: that.data.tasks.resolved++; break;                                    
                                }                                
                            }


                        }   
                    
                    that.data.tasks.notresolved = that.data.tasks.pending +  that.data.tasks.inprogress + that.data.tasks.paused;    
                    that.data.tasks.total = that.data.tasks.pending + that.data.tasks.inprogress + that.data.tasks.resolved + that.data.tasks.paused;
                    if (that.data.tasks.total > 0)
                        that.data.tasks.progress =  (that.data.tasks.resolved / that.data.tasks.total) * 100;       
                    
                   
                    
                   that.data.alerts.notresolved = that.data.alerts.pending +  that.data.alerts.inprogress + that.data.alerts.paused;
                   that.data.alerts.total = that.data.alerts.pending + that.data.alerts.inprogress + that.data.alerts.resolved + that.data.alerts.paused;                    
                   if (that.data.alerts.total > 0)
                       that.data.alerts.progress =  (that.data.alerts.resolved / that.data.alerts.total) * 100;       
                    
                   
                    
                    // Totals
                    
                    
                    that.data.all.pending  =  that.data.alerts.pending + that.data.tasks.pending;  
                    that.data.all.resolved = that.data.alerts.resolved + that.data.tasks.resolved;        
                    that.data.all.inprogress = that.data.alerts.inprogress + that.data.tasks.inprogress;        
                    that.data.all.paused     = that.data.alerts.paused + that.data.tasks.paused;        
                    
                    that.data.all.total = that.data.all.pending + 
                                          that.data.all.inprogress +
                                          that.data.all.paused + 
                                          that.data.all.resolved ;        
                    
                    
                     return deferred.resolve(that.getData());     
                    
                   /*
                    that.refreshFacilitiesData()
                    .done(function() {                        
                        return deferred.resolve(that.getData());                        
                    })
                    */
                    
                })    
                    
                 
            }).fail(function(error) {deferred.reject(error);}); 
                        
            return deferred.promise();
        }
        
        this.refreshFacilitiesData = function() {
            var deferred = $.Deferred();
            var that = this;
            _facilities = [];
            
             $localdb.db.Facilities.toArray(function(result) {    
                 for (var i=0; i<result.length; i++) {                     
                     _facilities.push({facility: result[i], stats: that.getFacilityStats(result[i].idfacility) })
                 }
                 deferred.resolve(_facilities);
             });
            
            return deferred.promise();
        }
        
        
        this.facilityStats = function(idfacility) {
            for(var i=0;i<_facilities.length;i++) {
                
                if (_facilities[i].facility.idfacility === idfacility)
                    return _facilities[i].stats;
            }
            return null;
        }
        
        
        
        /**********************************/
        /*          GENERAL               */
        /**********************************/
        
         this.getPriorities = function() {
            var deferred = $.Deferred();                                                 
            
            $localdb.db.Priorities.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "idpriority", dir: "asc"}                    
                }));                                    
            })                      
            return deferred.promise();            
        }

    
        
                
        /**********************************/
        /*          ALERTS                */
        /**********************************/
        
        
        this.getAlertTypesWithNoItem = function(isTask) {
            var deferred = $.Deferred();
            
            var filter = generateAlertTypesNoItem();  
             
            $localdb.db.AlertTypes.toArray(function(result) {                               
                 deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: { field:"name",dir:"asc"},     
                    filter: filter,
                    pageSize: 100
                }))                                    
            })       
            
            return deferred.promise();
        }
        
        
        
        // if iditem === null, return all alert types 
        this.getAlertTypes = function(iditem, isTask) {            
            //return $localdb.db.AlertTypes.asKendoDataSource(filter);                                    
            var deferred = $.Deferred();
            
            var filter = generateAlertTypeFilter(iditem, isTask);  
             
            $localdb.db.AlertTypes.toArray(function(result) {                               
                 deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: { field:"name",dir:"asc"},     
                    filter: filter,
                    pageSize: 100
                }))                                    
            })       
            
            return deferred.promise();
        }
        
        // Alert Types that are directly associated to the facility (no lodging/common areas) (no itemtype involved).
        this.getAlertTypesFacility = function(idfacility) {
            var deferred = $.Deferred();            
            var filter = generateAlertTypeFilterFacility(idfacility);
            
             
            $localdb.db.AlertTypes.toArray(function(result) {                                               
                 deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: { field:"name",dir:"asc"},     
                    filter: filter,
                    pageSize: 100
                }))                                    
            })       
            
            return deferred.promise();
            
            //return $localdb.db.AlertTypes.asKendoDataSource(filter);            
        },
        
        /*alert type to cleaning task*/
        this.getAlertTypesCleaningTask = function() {
            var deferred = $.Deferred();            
            var filter = {                
                    logic: "and",
                    filters: [
                        {field: "idhotel", operator: "equals", value: app.hotel.idhotel },
                        {field: "deleted", operator: "equals", value: 0 },                                                                                                
                        {field: "iscleaningtask", operator: "equals", value: 1},
                    ]                            
            }; 
            
             
            $localdb.db.AlertTypes.toArray(function(result) { 
                 deferred.resolve(new kendo.data.DataSource({
                    data : result,  
                    filter: filter
                }))                                    
            })       
            
            return deferred.promise();           
        }
        
        this.getAlertTypesRequest = function() {
            var filter = generateFilterByAlertTypeCategory(globals.ALERT_CATEGORY_REQUEST);
            return $localdb.db.AlertTypes.asKendoDataSource(filter);            
        }
        
        this.getAlertTypeByID = function(idalerttype) {
            return $localdb.getAlerTypeByID(idalerttype); 
        }
        
        this.getAlerTypeLostAndFound = function() {
           return $localdb.getAlerTypeLostAndFound(); 
            
        }
        
        this.getAlerTypeCleaningTask = function() {
            return $localdb.getAlerTypeCleaningTask();
        }
        
        // we don´t consider Lost & Found 
        this.getCommonAlertTypes = function() {            
            var deferred = $.Deferred();
             
            $localdb.db.AlertTypes.toArray(function(result) {                               
                 deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: { field:"count",dir:"desc"},     
                    filter: generateFilterCommonAlertTypes(),
                     pageSize: 15
                }))                                    
            })       
            
            return deferred.promise();
            
            //return $localdb.db.AlertTypes.asKendoDataSource(filter);                            
        }
        
        this.saveAlertCreatedToHistory = function(alert) {
            
        }
        
        
        this.updateAlertTypes = function() {
            var deferred = $.Deferred();                        
            var that = this;                        
                                    
            $localdb.getMaxLastmodified($localdb.db.AlertTypes)
            .done(function(lastmodified) { 
                var criteria = {};   
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" +  $date.toMySQLFormat(lastmodified) + "'";                 
                // Get any new alerttypes from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getEntity('alerttypes', criteria)
                .done(function(rows) {      
                    if (rows.length === 0) 
                        deferred.resolve(null); // nothing to update
                    else                       
                        syncController.synchronizeFromServer($localdb.db.AlertTypes, rows)
                        .done(function() {
                            deferred.resolve(that.getAlertTypes());    
                        })                    
                   
                })                                
            })          
                       
            return deferred.promise(); 
            
        }
        
        
        
        
        
        // Retorna las alertas dependiendo del rol del usuario 
        // Si es maid, se filtarn por idstaff. Si es housekeeper, se filtran por idmodule.
        // Además, si todayOnly es verdadero, solo se muestran las alertas de hoy => incluye alertas pasadas sin resolver        
        this.getAlerts = function(todayOnly) {                        
            var deferred = $.Deferred();                        
            var that = this;
                  
            // BEFORE I WAS RETURNING localdb.db.Alerts.asKendoDataSource(filter),
             // but the jayData way of creating a kendo DataSource raises an error when trying to group....
             // The solution was to construct the kendo DataSource directly, using the entityset array data                 
            
                        
            $localdb.db.Alerts.toArray(function(result) {                            
                
                if (app.user.role == globals.ROLE_MAINTENANCE) {
                    result = that.organizeAlerts(result);
                    deferred.resolve(new kendo.data.DataSource({
                        data : result,                     
                        //sort: [{field: "idalert", dir: "desc"}],
                        filter: todayOnly === true ? generateFilterTodayAlerts() : generateFilter()
                    })); 
                }
                else {
                    deferred.resolve(new kendo.data.DataSource({
                        data : result,                     
                        sort: [{field: "idalert", dir: "desc"}],
                        filter: todayOnly === true ? generateFilterTodayAlerts() : generateFilter()
                    })); 
                    
                }
                
                                               
            })                     
            return deferred.promise();
        }
        
        
       
        this.organizeAlerts = function(alerts) {
            var that = this;
            
            
            var finished = that.getFinishedAlerts(alerts);
            var myAlerts = that.getMyAlerts(alerts);
            //var inprogress  = that.getInProgressAlerts(alerts);
            
            //var r = orphan.concat(myAlerts,finished);
            var r = myAlerts.concat(finished);
            
            return r; 
            
        }
        
         this.organizeTeamAlerts = function(alerts) {
            var that = this;
            
            var team = that.getMyTeamAlerts(alerts);            
            var orphan  =  that.getOrphanAlerts(alerts);
            var last    = that.getMovedLastAlerts(alerts);
                                      
            var r = orphan.concat(team);
            r = r.concat(last);
            
            return r; 
            
        }
        
        // alerts = array
        this.getFinishedAlerts = function(alerts) {
            var r = $.grep(alerts, function(a) { return a.idstatus == globals.ALERT_STATUS_RESOLVED  && a.movelast == 0});            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
         this.getInProgressAlerts = function(alerts) {
            var r = $.grep(alerts, function(a) { return a.idstatus == globals.ALERT_STATUS_IN_PROGRESS && a.movelast == 0});            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
        this.getMyAlerts = function(alerts) { // not finished
            var r = $.grep(alerts, function(a) { return a.idstaff == app.user.idstaff && a.idstatus != 100 });            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
        this.getOrphanAlerts = function(alerts) {
            var r = $.grep(alerts, function(a) { return a.idstaff == 0 && a.movelast == 0});            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
        this.getMyTeamAlerts = function(alerts) { // not finished
            var r = $.grep(alerts, function(a) { return a.idstaff !== app.user.idstaff && a.idstaff != 0 && a.movelast == 0 });            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
         this.getMovedLastAlerts = function(alerts) { // not finished
            var r = $.grep(alerts, function(a) { return  a.idstaff == 0 && a.movelast == 1 });            
            r.sort(this.sortAlerts);
            return r.reverse();
        }
        
        
        
        this.sortAlerts = function(a,b) {
                if (a.idalert < b.idalert) return -1;
                if (a.idalert > b.idalert) return 1;
                return 0;
        }
        
        // Retorna las alertas de HOY de idstaff
        this.getStaffAlerts = function(idstaff) {
             var deferred = $.Deferred();                        
                         
            // BEFORE I WAS RETURNING localdb.db.Alerts.asKendoDataSource(filter),
             // but the jayData way of creating a kendo DataSource raises an error when trying to group....
             // The solution was to construct the kendo DataSource directly, using the entityset array data                 
            
            
            //First add all non-finished alerts
            $localdb.db.Alerts.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    //sort: [{field: "idstatus", dir: "asc"}, {field: "idalert", dir: "desc"}],
                    sort: [{field: "idalert", dir: "desc"}],
                    filter: generateFilterTodaysStaffAlerts(idstaff)
                }));                                    
            })                     
            return deferred.promise();
            
        }
        
        
         this.getAlert = function(idalert) {
            var deferred = $.Deferred();
            
            $localdb.getAlertInfo(idalert)
            .done(function(alert) {
                deferred.resolve(alert);                
            })
            
            return deferred.promise();
        } 
        
        this.getAlertbyuuid = function(uuid) {
            var deferred = $.Deferred();
            
            $localdb.getAlertInfobyuuid(uuid)
            .done(function(alert) {
                deferred.resolve(alert);                
            })
            
            return deferred.promise();
        }
        
        
        this.getMaintenanceAlerts = function() {
            var deferred = $.Deferred();            
            var departmentFilter;
               
            var filters =   [                                
                               // {field: "reportedby", operator: "eq", value: app.user.idstaff }, 
                                 {field: "idstaff", operator: "neq", value: app.user.idstaff},   
                                {field: "idmodule", operator: "eq", value: globals.MODULE_MAINTENANCE},                                 
                              // {field: "byhousekeeper", operator: "eq", value: 0}, 
                                {field: "deleted", operator: "eq", value: 0 },     
                                {field: "iscleaningtask", operator: "equals", value: 0  }, 
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                    
                                 ]                 
                               }
                            ];
            
               if (app.user.iddepartment > 0 ) { 
                
                 if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT) {  //1  
                     console.info('My Dept Plus Orphans');
                     departmentFilter = { 
                          logic: "or",
                          filters: [
                             {field: "iddepartment", operator: "equals", value: 0 }, // mostramos alertas que no pertenecen a un departamento
                             {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },                                    
                          ]                
                       };            
                     filters.push(departmentFilter);                
                 }
                else if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_ONLY) {    // 2
                    console.info('My Dept ONLY');
                    departmentFilter = { 
                            logic: "or",
                            filters: [                                
                                {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };        
                    filters.push(departmentFilter);   
                }
              }
            $localdb.db.Alerts.toArray(function(result) {
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    sort: [{field: "idalert", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: filters
                          }                 
                }));                
            })
            
            return deferred.promise();
        }
        
        
         this.getTeamAlerts = function() {
            var deferred = $.Deferred();  
            var that = this;
            var departmentFilter = null;
            
            $localdb.db.Alerts.toArray(function(result) {
                
                result = that.organizeTeamAlerts(result);
                
                var filters = [                                
                               {field: "idstaff", operator: "neq", value: app.user.idstaff }, 
                               // {field: "idstaff", operator: "neq", value: 0 }, 
                                  {field: "iscleaningtask", operator: "equals", value: 0  }, 
                                {field: "idmodule", operator: "eq", value: app.user.idmodule}, 
                                {field: "idcategory", operator: "eq", value: globals.IS_ALERT}, 
                                {field: "deleted", operator: "eq", value: 0 },                            
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                    
                                 ]                 
                               }             
                            ];
                
                  if (app.user.role === globals.ROLE_MAINTENANCE ) {
                        filters.push({field: "byhousekeeper", operator: "eq", value: 0}); 
                    }
               
                 if (app.user.iddepartment > 0 ) {  // Si el usuario no tiene departamento, no se filtra por departamento...
                    departmentFilter = {};
                
                     if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT) {  //1  
                         console.info('My Dept Plus Orphans');
                        departmentFilter = { 
                                logic: "or",
                                filters: [
                                    {field: "iddepartment", operator: "equals", value: 0 }, // mostramos alertas que no pertenecen a un departamento
                                    {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },                                    
                                ]                
                             };            
                         filters.push(departmentFilter);                
                    }
                    else if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_ONLY) {    // 2
                        console.info('My Dept ONLY');
                        departmentFilter = { 
                                logic: "or",
                                filters: [                                
                                    {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },                                   
                                ]                
                             };                           
                        filters.push(departmentFilter);                
                    }
                                    
                }
                var onlyfreealerts   = localStorage.getItem("onlyfreealerts");
                var role   = localStorage.getItem("userrole");
            if (role == globals.ROLE_MAINTENANCE && onlyfreealerts == 1) { 
                 var onlyMine = { 
                            logic: "or",
                            filters: [
                                {field: "idstaff", operator: "equals", value: 0},
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(onlyMine);     
                }
                var app_max_alerts = localStorage.getItem("app_max_alerts");
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    page: 1,
                    pageSize: app_max_alerts,
                    //sort: [{field: "idalert", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: filters
                          }                 
                }));                
            })            
            
            return deferred.promise();
        }
        
        
         this.getTeamTasks = function() {
             
             var deferred = $.Deferred();              
             
             var departmentFilter = null;
            
            $localdb.db.Alerts.toArray(function(result) {
                
                var filters =  [                                
                               {field: "idstaff", operator: "neq", value: app.user.idstaff }, 
                               // {field: "idstaff", operator: "neq", value: 0 }, 
                                {field: "idmodule", operator: "eq", value: app.user.idmodule}, 
                                {field: "idcategory", operator: "eq", value: globals.IS_TASK},
                                {field: "deleted", operator: "eq", value: 0 },                            
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                    
                                 ]                 
                               }             
                            ];
                
                 if (app.user.iddepartment > 0 ) {  // Si el usuario no tiene departamento, no se filtra por departamento...
                    departmentFilter = {};
                
                     if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT) {  //1  
                         console.info('My Dept Plus Orphans');
                        departmentFilter = { 
                                logic: "or",
                                filters: [
                                    {field: "iddepartment", operator: "equals", value: 0 }, // mostramos alertas que no pertenecen a un departamento
                                    {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },                                    
                                ]                
                             };            
                         filters.push(departmentFilter);                
                    }
                    else if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_ONLY) {    // 2
                        console.info('My Dept ONLY');
                        departmentFilter = { 
                                logic: "or",
                                filters: [                                
                                    {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },                                   
                                ]                
                             };                           
                        filters.push(departmentFilter);                
                    }                                    
                }                
                
                var onlyfreealerts   = localStorage.getItem("onlyfreealerts");
                var role   = localStorage.getItem("userrole");
            if (role == globals.ROLE_MAINTENANCE && onlyfreealerts == 1) { 
                console.log(role);
                 var onlyMine = { 
                            logic: "or",
                            filters: [
                                {field: "idstaff", operator: "equals", value: 0},
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(onlyMine);     
                }
                  filters.push(  {field: "iscleaningtask", operator: "equals", value: 0  });
                  filters.push({field: "startdate", operator: "lt", value: $date.tomorrow() });
                
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    sort: [{field: "idalert", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: filters
                          }                 
                }));                
            })            
            
            return deferred.promise();
        }
        
        
        
        
        this.getHousekeeperAlerts = function() {
            var deferred = $.Deferred();                                    
            
            $localdb.db.Alerts.toArray(function(result) {
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    sort: [{field: "idalert", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: [                                                               
                                {field: "deleted", operator: "eq", value: 0 },
                                {field: "iscleaningtask", operator: "equals", value: 0  },
                                {field: "startdate", operator: "lt", value: $date.tomorrow() },  
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idmodule", operator: "eq", value: globals.MODULE_HOUSEKEEPING },
                                    {field: "byhousekeeper", operator: "eq", value: 1 },                    
                                 ]                 
                               },             
                        
                        
                                //{field: "idmodule", operator: "eq", value: globals.MODULE_HOUSEKEEPING}, 
                                
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED },
                                    {field: "finishdate", operator: "greater", value: $date.yesterday() },                                 
                                 ]                 
                               }             
                            ]
                          }                 
                }));                
            })                        
            return deferred.promise();
        }
        
        
        
        this.getHousekeeperTasks = function() {
            var deferred = $.Deferred();                                    
            
            $localdb.db.Tasks.toArray(function(result) {
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    sort: [{field: "idtask", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: [                                                               
                                {field: "idmodule", operator: "eq", value: globals.MODULE_HOUSEKEEPING}, 
                                {field: "deleted", operator: "eq", value: 0 },                            
                        // FILTER OUT FUTURE TASKS
                                {field: "start", operator: "lt", value: $date.tomorrow() },           
                                {
                                  logic: "or",
                                  filters: [
                                    {field: "idstatus", operator: "ne", value: globals.TASK_STATUS_FINISHED},                                                                        
                                    {field: "ended", operator: "greater", value: $date.yesterday() },                    
                                 ]                 
                               }             
                            ]
                          }                 
                }));                
            })                        
            return deferred.promise();
        }
        
        this.getCleaningTasks = function() {
            var deferred = $.Deferred();                                    
            
            $localdb.db.Alerts.toArray(function(result) {
                deferred.resolve(new kendo.data.DataSource({
                    data: result,
                    sort: [{field: "idalert", dir: "desc"}],
                    filter: { 
                            logic: "and",
                            filters: [                                                               
                                {field: "idmodule", operator: "eq", value: globals.MODULE_HOUSEKEEPING}, 
                                {field: "idcategory", operator: "eq", value: globals.IS_TASK}, 
                                {field: "iscleaningtask", operator: "eq", value: 1}, 
                                {field: "deleted", operator: "eq", value: 0 },                            
                       
                            ]
                          }                 
                }));                
            })                        
            return deferred.promise();
        }
        
        
        // Considers role...
        this.getMaxLastModifiedAlerts = function() {
            var deferred = $.Deferred();
            
            $localdb.getMaxLastmodifiedByRole($localdb.db.Alerts,app.user.role)
            .done(function(lastmodified) {                 
                deferred.resolve(lastmodified);            
            }).fail(function(error) {deferred.reject(error);});
            return deferred.promise();            
        }
        
        
        this.getMaxLastModifiedTasks = function() {
            var deferred = $.Deferred();
            
            $localdb.getMaxLastmodifiedTasksByRole(app.user.role)
            .done(function(lastmodified) {                 
                deferred.resolve(lastmodified);            
            }); 
            return deferred.promise();            
        }

        
        
        
        
        // Update alerts from backend into localdb (based on current user role)
        // Checks for new or updated records  based on lastmodified column.    
        // Returns deferred(changes (bool), and all alerts from current context (role))
        this.updateAlerts = function() {          
            var deferred = $.Deferred();    
            var that = this;               
                                    
            that.getMaxLastModifiedAlerts()
            .done(function(lastmodified) {        
                var limit = localStorage.getItem("limit");//limite de alertas a obtener
                var criteria = {idstaff: app.user.idstaff, role: app.user.role, limit :limit };       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get any new alerts from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                
                $api.getAlerts(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                               
                        that.refreshData($localdb.db.Alerts)
                        .done(function() {                
                            deferred.resolve(false);    
                        }).fail(function(error) {deferred.reject(error);});    
                    else                        
                        syncController.synchronizeFromServer($localdb.db.Alerts, rows)
                        .done(function() {
                            that.refreshData($localdb.db.Alerts)
                            .done(function() {                
                                deferred.resolve(true);    
                            }).fail(function(error) {deferred.reject(error);});                    
                        }).fail(function(error) {deferred.reject(error);});                                 
               })
               .fail(function(error) {
                   deferred.reject(error);
               })
            }).fail(function(error) {deferred.reject(error);});    
                       
            return deferred.promise(); 
        }
        
        
        // SYNC TO SERVER...
        this.syncAlertsToServer = function() {
           // return syncController.syncAlertsToServer();
        }
        
        
                
        this.createAlert = function(alert) {
            var deferred = $.Deferred();
            
            
            console.info('CREATE ALERTS');
            
            $localdb.addRow($localdb.db.Alerts,alert);
                        
            $localdb.db.saveChanges( function() {                 
                deferred.resolve();
            }); 
            
            return deferred.promise();
        }
        
        
        
       /* this.createAlertXXX = function(alert) {
            var deferred = $.Deferred();
            var that = this;
                                    
            //var data = {idalert: -1, idstatus: globals.ALERT_STATUS_PENDING, insync: false, reporteddate: $date.timestampUTC()};
                        
            $localdb.updateAlert(alert)
            .done(function() {                     
                that.refreshData($localdb.db.Alerts)
                .done(function() {                    
                    deferred.resolve();                                                                                          
                })
            });  
            
            
            return deferred.promise();
        }*/
        
        
        // posts new alert to the backend 
        /*this.createAlertOLD = function(alert) {            
            var deferred = $.Deferred();            
            var that = this;
            
            $api.createAlert(alert)
            .done(function(idalert) {     
                that.refreshData($localdb.db.Alerts)
                .done(function() {                 
                    deferred.resolve(idalert);  
                })                
            })
            .fail(function(error) {              
                deferred.reject(error);      
            })
            
            return deferred.promise();
        }
        */
        
        
        // Starts alert LOCALLY and Created also locally the ACTION LOG ENTRY
        this.startAlert = function(alert) {            
            var deferred = $.Deferred();
            var that = this;
            
            var startdate = $date.timestampUTC();
                                    
            var data = {idalert: alert.idalert, guid: alert.guid, idstaff: app.user.idstaff, idstatus: globals.ALERT_STATUS_IN_PROGRESS, action: globals.ACTION_STARTED, insync: false, startdate: startdate};
            if (alert.idstaff == 0)
                data['tag'] = globals.TAG_TAKEN;
            
            
            $localdb.updateAlert(data)
            .done(function(guid) {                     
                that.refreshData($localdb.db.Alerts)
                .done(function() {                    
                    taskController.createActionLog({idactionlog: -1,  action: globals.ACTION_STARTED, prompt: 'Alerta Comenzada',
                                      idalert: alert.idalert, alertguid: alert.guid, insync: false, lastmodified: $date.timestampUTC()})
                    .done(function() {
                        deferred.resolve(startdate);                                                                      
                    })
                })
            });  
            return deferred.promise();
        }
        
        
        this.pauseAlert = function(alert, reason) {
            var deferred = $.Deferred();
            var that = this;
            
            var pauseDate = $date.timestampUTC();
            
             that.calculateDuration(alert,pauseDate)
            .done(function(duration) {
                var data = {idalert: alert.idalert, guid: alert.guid, idstatus: globals.ALERT_STATUS_PAUSED, action: globals.ACTION_PAUSED, duration: duration, insync: false };
            
                $localdb.updateAlert(data)
                .done(function() {                     
                    that.refreshData($localdb.db.Alerts)
                    .done(function() {
                         taskController.createActionLog({idactionlog: -1,  action: globals.ACTION_PAUSED, prompt: reason,
                                         idalert: alert.idalert,  alertguid: alert.guid, insync: false, lastmodified: $date.timestampUTC()})
                        .done(function() {
                            deferred.resolve();                                                                      
                        })
                    })   
                });  
            })
            
            return deferred.promise();
        }
        
        
        
        
         // Finished alert LOCALLY
        this.finishAlert = function(alert, solutiontext) {            
            var deferred = $.Deferred();
            var that = this;
            
            var finishDate = $date.timestampUTC(); 
                        
            that.calculateDuration(alert, finishDate)
            .done(function(duration) {
                console.info("Duración: " + duration);
                
                var data = {idalert: alert.idalert, guid: alert.guid, idstatus: globals.ALERT_STATUS_RESOLVED, action: globals.ACTION_RESOLVED, insync: false, duration: duration, finishdate: finishDate  };
            
                $localdb.updateAlert(data)
                .done(function() {                     
                    that.refreshData($localdb.db.Alerts)
                    .done(function() {
                         taskController.createActionLog({idactionlog: -1,  action: globals.ACTION_RESOLVED, prompt: 'Alerta Finalizada: ' + solutiontext,
                                         idalert: alert.idalert,  alertguid: alert.guid, insync: false, lastmodified: $date.timestampUTC()})
                        .done(function() {
                            deferred.resolve();                                                                      
                        })
                    })   
                });  
                
            })
            
            
            return deferred.promise();
        }
        
        
         this.moveLast = function(alert) {
            var deferred = $.Deferred();
            var that = this;
            
            var data = {idalert: alert.idalert, guid: alert.guid, movelast: 1};
            
             $localdb.updateAlert(data)             
             .done(function() {        
                deferred.resolve();                                                                                  
            })
            
            return deferred.promise();
        }
        
        // calulate duration when finishing or when pausing...
        this.calculateDuration = function(alert, currentDate) {
            var deferred = $.Deferred();
            
            var duration = 0;
          
            if (alert.startdate == null) {deferred.resolve(duration); }
            else if (alert.resumedate == null || alert.resumedate == 0) {
                
                duration = moment(currentDate).diff(moment(alert.startdate),'seconds');
                deferred.resolve(duration);
            }
            else { 
                duration = alert.duration + ( moment(currentDate).diff(moment(alert.resumedate),'seconds'));
                deferred.resolve(duration);
            }
                        
            return deferred.promise();
            
             
            /*if ($alert->startdate == null)
                $alert->duration = 0;
            else if ($alert->resumedate == null)
                $alert->duration = (toJavascriptTimestamp($alert->finishdate) - toJavascriptTimestamp($alert->startdate)) / 1000;   //in seconds
            else
                $alert->duration += (toJavascriptTimestamp($alert->finishdate) - toJavascriptTimestamp($alert->resumedate)) / 1000;   //in seconds
            */
        }
        
        
        this.resumeAlert = function(alert) {
            var deferred = $.Deferred();
            var that = this;
            
            var data = {idalert: alert.idalert, guid: alert.guid, idstatus: globals.ALERT_STATUS_IN_PROGRESS, action: globals.ACTION_RESUMED, insync: false, resumedate: $date.timestampUTC() };
            
            $localdb.updateAlert(data)
            .done(function() {                     
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                     taskController.createActionLog({idactionlog: -1,  action: globals.ACTION_RESUMED, prompt: 'Alerta Reanudada',
                                     idalert: alert.idalert,  alertguid: alert.guid, insync: false, lastmodified: $date.timestampUTC()})
                    .done(function() {
                        deferred.resolve();                                                                      
                    })
                })   
            });  
            return deferred.promise();
        }
        
       
        
        
        
        this.markAlertAsFinished = function(alert, idstaff,idstatus) {
            var deferred = $.Deferred();             
            var that = this;
            // Update Status remotely
            console.log("idstatus");
            console.log(idstatus);
                if(idstatus === 1){
                    var data = {idalert: alert.idalert, idstaff: idstaff, guid: alert.guid, idstatus: globals.ALERT_STATUS_RESOLVED, tag: globals.TAG_MARKED_AS_FINISHED,  action: globals.ACTION_RESOLVED, insync: false, finish: alert.finishdate };
                }else{
                    var data = {idalert: alert.idalert, idstaff: idstaff, guid: alert.guid, idstatus: globals.ALERT_STATUS_RESOLVED, tag: globals.TAG_MARKED_AS_FINISHED,  action: globals.ACTION_RESOLVED, insync: false, finishdate: $date.timestampUTC() };
                }
            
            console.log("idstatus");
            console.log(data);
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();                            
                })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
       
        
        
       
        
        // Mark Alert as finished and because of DND (tag = 1)
        this.markAlertAsDND = function(alert, idstaff) {
            var deferred = $.Deferred();             
            var that = this;            
            var data = {idalert: alert.idalert, guid: alert.guid, idstaff: idstaff, idstatus: globals.ALERT_STATUS_RESOLVED, tag: globals.TAG_DND,  action: globals.ACTION_RESOLVED, finishdate: $date.timestampUTC(), insync: false };            
            // Update alert locally: finished, 
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();        
                })                  
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        }
                 
        
        // remove byhousekeeper....so it belongs to maintenance again
        this.escalateAlert = function(alert) {
            var deferred = $.Deferred();             
            var that = this;            
            var data = {idalert: alert.idalert, guid: alert.guid,  idstaff: 0, byhousekeeper: false,  insync: false, tag: globals.TAG_ESCALATED };            
            // Update alert locally: finished, 
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();        
                })                  
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        }
        
         // remove byhousekeeper....so it belongs to maintenance again
        this.alertToTask = function(alert) {
            var deferred = $.Deferred();             
            var that = this;   
            
            var startdate  = $date.timestampUTC();
            var finishdate = moment().add(  moment().utcOffset() * (-1),'minutes').add(  alert.expectedduration,'minutes').utc().valueOf();
            
            var data = {startdate: startdate, finishdate: finishdate, idalert: alert.idalert, guid: alert.guid, alerttotask: 1,  insync: false, idcategory: globals.IS_TASK, action: globals.ACTION_ALERT_TO_TASK  };                        
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();        
                })                  
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        },
        
        this.alertReopen = function(alert) {
            var deferred = $.Deferred();             
            var that = this;   
            
            var data = { idalert: alert.idalert,idstatus: 1, guid: alert.guid, insync: false, action: globals.ACTION_REOPEN };                        
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    that.createActionLog({ idalert: alert.idalert,action: globals.ACTION_REOPEN, prompt: 'Tarea ReAbierta!', lastmodified: log.lastmodified})
                             .done(function() {
                                
                    deferred.resolve();        
                   })                  
                })                  
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        }
                
        
        
        
         // Mark Alert as task created (tag = 5)
        this.markAlertAsTaskCreated = function(idalert, idtask, idstaff) {
            var deferred = $.Deferred();             
            var that = this;            
            $api.markAlertAsTaskCreated({ idalert: idalert, idtask: idtask, idstaff: idstaff})
            .done(function(result) {                    
                // Update alert locally: finished, 
                 $localdb.updateAlert(result)
                 .done(function() {
                     that.refreshData($localdb.db.Alerts)
                     .done(function() {
                         deferred.resolve();        
                     })  
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        }
        
        
        this.evaluateAlert = function(alert, evaluation) {
            var deferred = $.Deferred();             
            var that = this;            
            var data = { idalert: alert.idalert, guid: alert.guid, evaluation: evaluation, insync: false };
            $localdb.updateAlert(data)
            .done(function() {                     
                deferred.resolve();                                        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
                

        this.deleteAlert = function(alert) {
            var deferred = $.Deferred();      
            var that = this;            
            var data = { idalert: alert.idalert, guid: alert.guid, deleted: 1,  insync: false };
            $localdb.updateAlert(data)
            .done(function() {
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();                            
                })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
            
        }
        
        
        
        this.assignAlert = function(alert, idstaff) {
            var deferred = $.Deferred();                        
            var that = this;
            var data = {idalert: alert.idalert, guid: alert.guid, idstaff: idstaff, action: globals.ACTION_ASSIGNED, assignedby: app.user.idstaff, insync: false};
            
            $localdb.updateAlert(data)
            .done(function() {                     
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();        
                })                                         
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            
            return deferred.promise();
        }
        
        
        
        
        
        this.takeAlert = function(alert, idstaff)  {
            var deferred = $.Deferred();                        
            var that = this;
            
            var data = { idalert: alert.idalert, guid: alert.guid, idstaff: idstaff, tag: globals.TAG_TAKEN, insync: false }            
            $localdb.updateAlert(data)
            .done(function() {                     
                that.refreshData($localdb.db.Alerts)
                .done(function() {
                    deferred.resolve();        
                })                     
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
            
        }
        
        
        
        
        
        
        this.pingReceived = function(alert) {
            var deferred = $.Deferred();
            var that = this;
            
            var data = {idalert: alert.idalert,  guid: alert.guid, action: globals.ACTION_RECEIVED_BY_MODULE , insync: false };
            
            
            
            $localdb.updateAlert(data)
            .done(function() {                     
                                
                        deferred.resolve();                                                                      
                    })
                               
            return deferred.promise();            
        }
        
        
        
        
        // This action in perfomred on the background
        this.pingReceivedByOwner = function(alert) {
             var deferred = $.Deferred();
            var that = this;
            
            var data = {idalert: alert.idalert, guid: alert.guid, action: globals.ACTION_RECEIVED_BY_OWNER , insync: false };
            
            $localdb.updateAlert(data)
            .done(function() {                     
                             
                        deferred.resolve();                                                                      
                   
                })               
            return deferred.promise();          
        }
        
        
        this.hasRunningTask = function(idstaff) {
            return $localdb.hasRunningTask(idstaff);            
        }
       
        
        
         // Remove all alerts from local Web SQL storage               
        this.removeAlerts = function() {
             return $localdb.removeAll($localdb.db.Alerts);
        }
        
        
        this.getBreakdownsHistory = function(days) {
            var deferred = $.Deferred();
            this._getBreakdownsHistory(days)
            .done(function() {
                 _breakdowns.days.reverse();   // from past to now
                 _breakdowns.alertscount.reverse();
                deferred.resolve(_breakdowns);                
            })            
            return deferred.promise();
        }
        
        this.getBreakdownsHistoryRange = function(startdate, enddate) {
            var deferred = $.Deferred();
            this._getBreakdownsHistoryRange(startdate, enddate) 
            .done(function() {
                _breakdownshistory.days.reverse();   // from past to now
                _breakdownshistory.alertscount.reverse();                                                
                deferred.resolve(_breakdownshistory);                     
            })
            
            return deferred.promise();
        },
        
        
        
        this.alertSettings = function(alert, settingsaction, value) {
            var deferred = $.Deferred();
            
            var data = { idalert: alert.idalert, guid: alert.guid, insync: false };
            
            
            if (settingsaction == 1) {  // Change Duration
                data["expectedduration"] = value;                
                data["action"]           = globals.ACTION_ESTIMATED_DURATION;
             }
            else { // will check
                data["willcheckdate"] = value;
                data["action"]           = globals.ACTION_WILLCHECK;
            }
            
            
            $localdb.updateAlert(data)
            .done(function() {                     
                deferred.resolve();                                             
            })
            
            return deferred.promise();
        },
        
        
        this.alertSettingsOLD = function(idalert, settingsaction, value) {
            var deferred = $.Deferred();
            
            $api.alertSettings({ idalert: idalert, settingsaction: settingsaction, value: value})
            .done(function(result) {
                $localdb.updateAlert(result)
                 .done(function() {                     
                     deferred.resolve();                             
                 })   
            })
            return deferred.promise();
        }
         
        this.taskSettings = function(idtask, settingsaction, value) {
            var deferred = $.Deferred();
            
            $api.taskSettings({ idtask: idtask, settingsaction: settingsaction, value: value})
            .done(function(result) {
                $localdb.updateTask(result)
                 .done(function() {                     
                     deferred.resolve();                             
                 })   
            })
            return deferred.promise();
        }
        
        
        // Reporte de Averías
        this._getBreakdownsHistory = function(days) {                   
            var promises = [];                    
            var today = moment();
            
            _breakdowns = { days: [], alertscount: []}; // global
            
            // Create days array
            for (var i=0; i<days; i++) {                                
                _breakdowns.days.push( this.getDateFrom(i).date());            
            }            
           
            
            // Create # alerts array
            for (i=0; i<days; i++) {                                
                promises.push(this.getBreakdownsCount(this.getDateFrom(i)));
            }
            return $.when.apply($, promises);                       
        }
        
        
        // Reporte de Averías
        this._getBreakdownsHistoryRange = function(startdate, enddate) {                   
            var promises = [];                    
            var today = moment();
            var enddatebackup = moment(enddate);
            
            _breakdownshistory = { days: [], alertscount: [], alerts: []}; // global
            
            var days = enddate.diff(startdate, 'days');             
            
            
            // Create days array
            _breakdownshistory.days.push(enddate.date());            
            for (var i=1; i<days; i++) {                  
                var d = moment(enddate.subtract(1,'days')).date();            
                _breakdownshistory.days.push(d);            
            }                       
            
            // Create alerts array
            enddate = enddatebackup;
            promises.push(this.getBreakdowns(enddate));
            for (i=1; i<days; i++) {  
                var e = moment(enddate.subtract(1,'days'));                
                promises.push(this.getBreakdowns(e));
            }
            
            return $.when.apply($, promises);                       
        }
        
        
        this.getBreakdownsCount = function(date) {            
            var deferred = $.Deferred();
            
            $localdb.getBreakdownsCount(date) 
            .done(function(alerts) {
                _breakdowns.alertscount.push(alerts);
                deferred.resolve(alerts);
                
            })
            return deferred.promise();            
        }
        
        
        this.getBreakdowns = function(date) {            
            var deferred = $.Deferred();
            
            $localdb.getBreakdowns(date) 
            .done(function(alerts, count) {
                _breakdownshistory.alertscount.push(count);
                _breakdownshistory.alerts.push(alerts);
                deferred.resolve(alerts);
                
            })
            return deferred.promise();            
        }
        
        
        
        
        this.getDateFrom = function(i) {
          return moment().subtract(i,'days');
        }
        
        
        
                
        /**********************************/
        /*          TASKS                 */
        /**********************************/
        
        this.getTaskTypeByID = function(idtasktype) {
            return $localdb.getTaskTypeByID(idtasktype); 
        }
        
        // Retorna tipos de tareas dependiendo del módulo (housekeeper o maintenance)
        this.getTaskTypes = function(iditem, module) {
             var deferred = $.Deferred();                                     
                        
                        
            $localdb.db.TaskTypes.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "name", dir: "asc"},
                    filter: generateFilterTaskTypes(iditem, module)
                }));                                    
            })                        
            return deferred.promise();      
            
        }
        
        this.getGeneralTaskTypes = function(idmodule) {
             var deferred = $.Deferred();                                     
                        
            
            $localdb.db.TaskTypes.toArray(function(result) {
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "name", dir: "asc"},
                    filter: generateFilterGeneralTaskTypes(idmodule)
                }));                                    
            })                        
            return deferred.promise();                  
        }
        
         this.getGeneralTaskType = function(iditem) {             
             return $localdb.getGeneralTaskType(iditem); 
            
        }
        
         this.updateTaskTypes = function() {          
            var deferred = $.Deferred();            
            
            var that = this;            
                        
            // Get max(lastmodified) from local database 
            $localdb.getMaxLastmodifiedByRole($localdb.db.TaskTypes, app.user.role)
            .done(function(lastmodified) {                                
                var criteria = {idstaff: app.user.idstaff, role: app.user.role};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get any new tasktypes from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getTaskTypes(criteria)
                .done(function(rows) {                                        
                    if (rows.length === 0) // nothing to update
                        deferred.resolve(false);    
                    else
                        syncController.synchronizeFromServer($localdb.db.TaskTypes, rows)
                        .done(function() {
                            deferred.resolve(true);                                
                        })                    
                })                                
            })          
                       
            return deferred.promise(); 
        }
        
        
        this.getTasks = function(todayOnly) {
            var deferred = $.Deferred();                        
            var that = this;
                         
            // BEFORE I WAS RETURNING localdb.db.Alerts.asKendoDataSource(filter),
             // but the jayData way of creating a kendo DataSource raises an error when trying to group....
             // The solution was to construct the kendo DataSource directly, using the entityset array data                 
            
            
            //First add all non-finished alerts
            $localdb.db.Alerts.toArray(function(result) {            
                
                if (app.user.role == globals.ROLE_MAINTENANCE) {
                    result = that.organizeAlerts(result);
                    deferred.resolve(new kendo.data.DataSource({
                        data : result,                     
                        //sort: [{field: "idalert", dir: "desc"}],
                        filter: todayOnly === true ? generateFilterTodayTasks() : generateFilter()
                    })); 
                }
                else {
                    deferred.resolve(new kendo.data.DataSource({
                        data : result,                     
                        sort: [{field: "idalert", dir: "desc"}],
                        filter: todayOnly === true ? generateFilterTodayTasks() : generateFilter()
                    })); 
                    
                }
                
                                               
            })                     
            return deferred.promise();
            
        }
        
        // Retorna las tareas dependiendo del rol del usuario.
        // Si es maid, se filtarn por idstaff. Si es housekeeper, se filtran por idmodule.
        this.getTasksOLD = function(todayOnly) {   
            var deferred = $.Deferred();                        
             
            // BEFORE I WAS RETURNING localdb.db.Tasks.asKendoDataSource(filter),
             // but the jayData way of creating a kendo DataSource raises an error when trying to group....
             // The solution was to construct the kendo DataSource directly, using the entityset array data                 
            $localdb.db.Tasks.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result,                     
                    //sort: [ {field: "idstatus", dir: "asc"}, {field: "start", dir: "asc"},  {field: "idtask", dir: "desc"}],
                    //sort: [ {field: "start", dir: "asc"},  {field: "idtask", dir: "desc"}],
                    sort: [ {field: "idtask", dir: "desc"}],
                    filter: todayOnly === true ? generateFilterTodayTasks() : generateFilter()
                }));                                    
            })                        
            return deferred.promise();                                
        }
        
         // Retorna las tareas de HOY de idstaff
        this.getStaffTasks = function(idstaff) {
             var deferred = $.Deferred();                        
                         
            // BEFORE I WAS RETURNING localdb.db.Alerts.asKendoDataSource(filter),
             // but the jayData way of creating a kendo DataSource raises an error when trying to group....
             // The solution was to construct the kendo DataSource directly, using the entityset array data                             
                        
            $localdb.db.Tasks.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    //sort: [{field: "idstatus", dir: "asc"}, {field: "idalert", dir: "desc"}],
                    sort: [{field: "idtask", dir: "desc"}],
                    filter: generateFilterTodaysStaffTasks(idstaff)
                }));                                    
            })                     
            return deferred.promise();
            
        }
        
        
        this.getTask = function(idtask) {
            var deferred = $.Deferred();
            
            $localdb.getTaskInfo(idtask)
            .done(function(task) {
                deferred.resolve(task);                
            })
            
            return deferred.promise();
        }
        
        
        // Update tasks from backend into localdb (based on current user role)
        // Checks for new or updated records  based on lastmodified column.    
        // Returns deferred(changes (bool), and all tasks from current context (role))
        this.updateTasks = function() {          
            var deferred = $.Deferred();            
            
            var that = this;                        
                        
            // Get max(lastmodified) from local database 
            $localdb.getMaxLastmodifiedTasksByRole(app.user.role)
            .done(function(lastmodified) {                                
                var criteria = {idstaff: app.user.idstaff, role: app.user.role};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get any new tasks from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getTasks(criteria)
                .done(function(rows) {                                        
                    if (rows.length === 0) // nothing to update
                        that.refreshData($localdb.db.Tasks)
                        .done(function() {                
                            deferred.resolve(false);    
                        })                            
                    else
                        syncController.synchronizeFromServer($localdb.db.Tasks, rows)
                        .done(function() {                            
                            that.refreshData($localdb.db.Tasks)
                            .done(function() {                
                                deferred.resolve(true);    
                            })                            
                        })                    
                })
                .fail(function(error) {
                    deferred.reject(error);
                })
            })          
                       
            return deferred.promise(); 
        }
        
        
         // Creates new task..
         // Sends it to the backend and when it receives confirmation of success, 
        // it adds the task locally (sync ?).
        this.createTask = function(task, updatelocal) {            
            var deferred = $.Deferred();            
            var that = this;
            var update = (typeof updatelocal != 'undefined' ? updatelocal : true);            
                        
            
            $api.createTask(task)
            .done(function(result) {                                     
                if (!update) deferred.resolve(result);
                else {
                    $localdb.updateTask(result) // creates locall row...
                    .done(function() {
                        that.refreshData($localdb.db.Tasks)
                        .done(function() {
                            deferred.resolve(result);
                        })                    
                    })
                }
            })
            .fail(function(error) {                   
                deferred.reject(error);      
            })     
            
            
            return deferred.promise();
        }
        
        this.createCleaningTasks = function(idstaff, role) {
            var deferred = $.Deferred();
             $api.createCleaningTasks(idstaff, role)
            .done(function(result) {                                                 
                deferred.resolve(result);
            })
            .fail(function(error) {                   
                deferred.reject(error);      
            })     
            
            return deferred.promise();
        }
        
        
        this.assignTask = function(idtask, idstaff) {
            var deferred = $.Deferred();                        
            var that = this;
            // Update task remotely
            $api.assignTask({ idtask: idtask, idstaff: idstaff})
            .done(function(result) {                                           
                // Update task locally: status, lastmodified, startdate                 
                $localdb.updateTask(result)
                .done(function() {                     
                    that.refreshData($localdb.db.Tasks)
                    .done(function() {
                        deferred.resolve();        
                    })                     
                })                
            })    
            .fail(function(error) {
                deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
        
        
        
        this.deleteTask = function(idtask) {
            var deferred = $.Deferred();             
            var that = this;            
            $api.deleteTask({ idtask: idtask})
            .done(function(result) {                                    
                 $localdb.updateTask(result)
                 .done(function() {
                     that.refreshData($localdb.db.Tasks)
                     .done(function() {
                         deferred.resolve();        
                     })  
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
        
        this.startTask = function(idtask) {
            var deferred = $.Deferred();                        
            var that = this;
            // Update Status remotely
            $api.startTask({ idtask: idtask, idstaff: app.user.idstaff, role: app.user.role})
            .done(function(result, log) {                    
                // Update task locally: status, lastmodified, started
                //result['startedlocal'] = moment().valueOf();  // for chronometer
                 $localdb.updateTask(result)
                 .done(function() {                     
                     that.refreshData($localdb.db.Tasks)
                     if (log.result === 1)
                         that.createActionLog({idactionlog: log.idactionlog,  action: globals.ACTION_STARTED, prompt: 'Tarea Comenzada',
                                                   parenttype: globals.IS_TASK, idparent: idtask, lastmodified: log.lastmodified})
                         .done(function() {
                             that.getActionLog(globals.IS_TASK, idtask)
                             .done(function(actionlog) {
                                 deferred.resolve(result,actionlog);                                                                  
                              })     
                        })                         
                      else
                         deferred.resolve(result,null);         // error with log                    
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
        
        
        this.pauseTask = function(idtask, reason) {
            var deferred = $.Deferred();
            var that = this;
            // Update Status remotely
            $api.pauseTask({ idtask: idtask, reason: reason, idstaff: app.user.idstaff, role: app.user.role })
            .done(function(result,log) {                    
                // Update alert locally: status, lastmodified 
                //result['pausedatelocal'] = moment().valueOf();  // for cronomether (????)
                 $localdb.updateTask(result)
                 .done(function() {                     
                     that.refreshData($localdb.db.Tasks)
                     .done(function() {
                         // Update ActionLog
                         if (log.result === 1)
                             that.createActionLog({idactionlog: log.idactionlog,  action: globals.ACTION_PAUSED, prompt: reason,
                                                   parenttype: globals.IS_TASK, idparent: idtask, lastmodified: log.lastmodified})
                             .done(function() {
                                 that.getActionLog(globals.IS_TASK, idtask)
                                 .done(function(actionlog) {
                                     deferred.resolve(result,actionlog);                                 
                                  })     
                             })                         
                         else
                             deferred.resolve(null);         // error with log
                     })                     
                 })   
             })    
            .fail(function(error) {                
                 deferred.reject(error);    
             })                           
            return deferred.promise();
        }
        
        
        
        this.resumeTask = function(idtask) {
            var deferred = $.Deferred();
            var that = this;
            // Update Status remotely
            $api.resumeTask({ idtask: idtask, idstaff: app.user.idstaff, role: app.user.role})
            .done(function(result,log) {                    
                // Update alert locally: status, lastmodified
                //result['pausedatelocal'] = moment().valueOf();  // for cronomether (????)
                 $localdb.updateTask(result)
                 .done(function() {                     
                     that.refreshData($localdb.db.Tasks)
                     if (log.result === 1)
                             that.createActionLog({idactionlog: log.idactionlog,  action: globals.ACTION_RESUMED, prompt: 'Tarea Reanudada',
                                                   parenttype: globals.IS_TASK, idparent: idtask, lastmodified: log.lastmodified})
                             .done(function() {
                                 that.getActionLog(globals.IS_TASK, idtask)
                                 .done(function(actionlog) {
                                     deferred.resolve(result,actionlog);                                 
                                  })     
                             })                         
                         else
                             deferred.resolve(result,null);         // error with log                        
                 })   
             })    
            .fail(function(error) {                
                 deferred.reject(error);    
             })               
            
            return deferred.promise();
        }
        
        
        this.finishTask = function(idtask) {
            var deferred = $.Deferred();             
            var that = this;
            // Update Status remotely
            $api.finishTask({ idtask: idtask, idstaff: app.user.idstaff, role: app.user.role})
            .done(function(result,log) {                    
                // Update task locally: status, lastmodified, finished
                 syncController.synchronizeFromServer($localdb.db.Tasks, [result])
                 .done(function() {
                     that.refreshData($localdb.db.Tasks)
                     .done(function() {
                          if (log.result === 1)
                             that.createActionLog({idactionlog: log.idactionlog,  action: globals.ACTION_RESOLVED, prompt: 'Tarea Finalizada',
                                                   parenttype: globals.IS_TASK, idparent: idtask, lastmodified: log.lastmodified})
                             .done(function() {
                                 that.getActionLog(globals.IS_TASK, idtask)
                                 .done(function(actionlog) {
                                     deferred.resolve(result,actionlog);                                 
                                  })     
                             })                         
                         else
                             deferred.resolve(result,null);         // error with log 
                     })  
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
        
         this.evaluateTask = function(idtask, rating) {
            var deferred = $.Deferred();             
            var that = this;            
            $api.evaluateTask({ idtask: idtask, rating: rating })
            .done(function(result) {             
                $localdb.updateTask(result)
                .done(function() {                     
                    deferred.resolve();                            
                })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
        
        // Same as finishTask, but we pass idstaff as paramter
         this.markTaskAsFinished = function(idtask, idstaff) {
            var deferred = $.Deferred();             
            var that = this;
            // Update Status remotely
            $api.finishTask({ idtask: idtask, idstaff: idstaff, role: app.user.role, tag: globals.TAG_MARKED_AS_FINISHED})
            .done(function(result) {                    
                // Update task locally: status, lastmodified, startdate
                 $localdb.updateTask(result)
                 .done(function() {
                     that.refreshData($localdb.db.Tasks)
                     .done(function() {
                         deferred.resolve();        
                     })  
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
        }
        
         // Mark Task as finished and because of DND (tag = 1)
        this.markTaskAsDND = function(idtask, idstaff) {
            var deferred = $.Deferred();             
            var that = this;            
            $api.markTaskAsDND({ idtask: idtask, idstaff: idstaff})
            .done(function(result) {                    
                // Update alert locally: deleted, 
                 syncController.synchronizeFromServer($localdb.db.Tasks, [result])
                 .done(function() {
                     that.refreshData($localdb.db.Tasks)
                     .done(function() {
                         deferred.resolve();        
                     })  
                 })   
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();
            
        }

        
         /**********************************/
        /*          COMMENTS               */
        /**********************************/
        
        
        this.createComment = function(alert, idstaff, comment, picture) {
            var deferred = $.Deferred();
            
            var action = ( picture == null ? globals.ACTION_COMMENT : globals.ACTION_PICTURE );
            
            taskController.createActionLog({idactionlog: -1,  action: action, prompt: comment,
                    idalert: alert.idalert, alertguid: alert.guid, picture: picture, insync: false, lastmodified: $date.timestampUTC()})
            .done(function() {
                deferred.resolve();                                                                      
            })                
                        
            return deferred.promise();
        }
            
        
        // NO OFFLINE version
        /*this.sendComment = function(parenttype, idparent, idstaff, comment) {
            var deferred = $.Deferred();
            var that = this;
            $api.sendComment({parenttype: parenttype, idparent: idparent, idstaff: idstaff, comment: comment})
            .done(function(result) {                                               
                result['idstaff']    = app.user.idstaff;
                result['idparent']   = idparent;
                result['parenttype'] = parenttype;                
                result['prompt']     = comment;
                result['idhotel']    = app.hotel.idhotel;
                result['deleted']    = 0;
                                
                
                syncController.synchronizeFromServer($localdb.db.ActionLog, [result])
                 .done(function() {   
                     that.getActionLog(parenttype, idparent)
                     .done(function(comments) {
                         deferred.resolve(comments);                                 
                     })                     
                 })                 
            })
            .fail(function(error) {
                deferred.reject(error);                
            })            
            
            return deferred.promise();
        }
        */
        
        
        
        // CREATES **NEW** ACTION LOG...LOCALLY
        this.createActionLog = function(log) {            
            var deferred = $.Deferred();
            
            log['idhotel'] = app.hotel.idhotel;
            log['idstaff'] = app.user.idstaff;            
            log['uidd'] = helper.guid();   
            log['deleted'] = 0;            
            log["insync"] = false;
            
            $localdb.addRow($localdb.db.ActionLog,log);
            $localdb.db.saveChanges( function() {                 
                deferred.resolve();
            });
            
            /*
            syncController.synchronizeFromServer($localdb.db.ActionLog, [log], false)
            .done(function() {                   
                deferred.resolve();                                 
            })*/
            
            
            
            return deferred.promise();
        }
        
       
        // type => 1 = alert ; 2 = task
        this.getActionLog = function(alert) {
            var deferred = $.Deferred();
            
            var filters = [{field: "deleted", operator: "eq", value: 0 }];
            
            if (alert.idalert == globals.MAX_INT)
                filters.push({field: "alertguid", operator: "eq", value: alert.guid });
            else
                filters.push({field: "idalert", operator: "eq", value: alert.idalert });
            
            
            
            
            $localdb.db.ActionLog.toArray(function(result) {                                   
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                       // sort: {field: "idactionlog", dir: "desc"},
                        sort: {field: "lastmodified", dir: "desc"},  // in offline mode, we have idactionlog = -1, so we change the sort
                        filter: { 
                            logic: "and",
                            filters: filters
                       }                      
                }));                                                        
            })                                                   
             
            return deferred.promise();            
        }
        
        
        // Updates comments/prompts of idparent
        this.updateActionLog = function(idalert) {          
            var deferred = $.Deferred();    
            var that = this;   
                        
                                    
            $localdb.getMaxLastmodifiedActionLog(idalert)
            .done(function(lastmodified) {                                            
                
                var criteria = {idalert: idalert};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'";                 
                $api.getActionLog(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                            
                        deferred.resolve(false);                            
                    else                        
                        syncController.synchronizeFromServer($localdb.db.ActionLog, rows)
                        .done(function() {
                            deferred.resolve(true);    
                        })                                
                })
               .fail(function(error) {
                   deferred.reject(error);
               })
            })          
                       
            return deferred.promise(); 
        }
        
        this.updateAlertChecklist = function(idalert) {          
            var deferred = $.Deferred();    
            var that = this;   
                        
                                    
            $localdb.getMaxLastmodifiedAlertChecklist(idalert)
            .done(function(lastmodified) {                                            
                
                var criteria = {idalert: idalert};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'";                 
                $api.syncAlertChecklist(criteria)
                .done(function(rows) {                                           
                    if (rows === "no checklist")// nothing to update    
                    {                                         
                      deferred.resolve(false);
                    }
                    else{  
                         syncController.synchronizeFromServer($localdb.db.AlertCheckList, rows)
                         .done(function() {
                           deferred.resolve(true);    
                         })  
                        }
                })
               .fail(function(error) {
                   deferred.reject(error);
               })
            })          
                       
            return deferred.promise(); 
        }
        
         this.getAlertChecklistOptionsLocal = function(idalert, idchecklist) {
            var deferred = $.Deferred();
             
            var alertfilter = {
                logic: "or",
                filters: [
                    {field: "idalert", operator: "eq", value: idalert },  // not resolved or not finished
                    {field: "alertguid", operator: "eq", value: idalert }
                ]                
            };
             
            var filters = [
                 {field: "deleted", operator: "eq", value: 0 },
                 {field: "idchecklist", operator: "eq", value: idchecklist},
                 //{field: "idalert", operator: "eq", value: idalert }
             ];
             
             filters.push(alertfilter);
              console.log("id de la alertfilter ====>",alertfilter);
            $localdb.db.AlertCheckList.toArray(function(result) {                                   
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    filter: { 
                            logic: "and",
                            filters: filters
                       }                      
                }));                                                        
            })                                                   
             
            return deferred.promise();            
        }
        
        this.createAlertChecklist = function(idchecklist,idalert,alertuuid){
             var deferred = $.Deferred(); 
            
                $localdb.createAlertChecklist(idchecklist,idalert,alertuuid).done(
                    function(lastmodified) { 
                        deferred.resolve();
                    });
                
             return deferred.promise();   
        }
        
         this.getAlertChecklist = function(idalert, idchecklist) {          
            var deferred = $.Deferred();    
            var that = this;   
                        
                                    
            $localdb.getMaxLastmodifiedAlertCheckList(idalert, idchecklist)
            .done(function(lastmodified) {                                            
                
                var criteria = {idalert: idalert, idchecklist: idchecklist};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'";                 
                $api.getAlertChecklist(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                            
                         that.getAlertChecklistOptionsLocal(idalert, idchecklist)
                            .done(function(options) {   
                                deferred.resolve(options);
                             })                          
                    else                        
                        syncController.synchronizeFromServer($localdb.db.AlertCheckList, rows)
                        .done(function() {
                            that.getAlertChecklistOptionsLocal(idalert, idchecklist)
                            .done(function(options) {   
                                deferred.resolve(options);
                             }) 
                        })                                
                })
               .fail(function(error) {
                   deferred.reject(error);
               })
            })          
                       
            return deferred.promise(); 
        }
        
        
        this.toggleChecklistOption = function(option) {            
            var deferred = $.Deferred();
            var that = this;
            var alertguid = option.alertguid;
            if(alertguid == null){
                alertguid = '0';
            }
            
            var data = {idalert: option.idalert, idchecklistoption: option.idchecklistoption, value: option.value, insync: false,alertguid:alertguid};
            console.info(option);
            
            $localdb.updateAlertChecklist(data)
            .done(function() {    
                console.info('Updated');
                deferred.resolve('DONE');
                
            });  
            return deferred.promise();
        }
        
        
        
        
              
         /**********************************/
        /*          FACILITY STATS         */
        /**********************************/
        
        
        
         this.getFacilityStats = function(idfacility) {            
             var that = this;
             var stats = {                 
                 tasks: {},
                 alerts: {}                
             };
             
             stats.tasks  = that.getFacilityTasks(idfacility);
             stats.alerts = that.getFacilityAlerts(idfacility);
             
             return stats;
        }
        
        this.getFacilityAlerts = function(idfacility) {
            var alerts = [];            
            
             for (var i = 0; i < _alerts.length; i++)                                                 
                if (_alerts[i].idfacility === idfacility)                         
                    alerts.push(_alerts[i]);

            return alerts;
        }
        
        this.getFacilityTasks = function(idfacility) {
            var tasks = [];            
            
             for (var i = 0; i < _tasks.length; i++)                                                                 
                    if (_tasks[i].idfacility === idfacility)                         
                        tasks.push(_tasks[i]);                                    
            return tasks;
        }
        
        
        
        
         /**********************************/
        /*          STAFF                 */
        /**********************************/
        
        
        // Return a list of staff members depending on the role of the current user.
        // if role is Housekeeper/maintenancechief, then it will return the staff of their respective module.
        // if role is manager, it will return all the staff from the current hotel.
        // it indicates also if a staff member is on duty or free...(based on its workingHours)
        // NOTA: el filtro lo aplicamos al arreglo antes de crear el kendoDataSource, ya que los filtros del
        // kendoDataSource se destryuyen al usar el search....
        this.getStaff = function() {
            var deferred = $.Deferred();                                                 
            
            $localdb.db.Staff.toArray(function(result) {                   
                result = filterStaff(result);
                addCurrentActivity(result)
                //addIsWorkingFlag(result)
                .done(function() {                    
                    deferred.resolve(new kendo.data.DataSource({
                        data : result, 
                        sort: {field: "name", dir: "asc"},
                         /*sort: [   
                            { field: "isworking", dir: "asc" },
                            { field: "name", dir: "asc" } 
                        ],*/
  
                       // filter: generateFilterStaff()
                    }));                                                        
                })                 
            })                      
            return deferred.promise();            
        }
        
        
        
        this.getStaffDetails = function() {
            var that = this;
            var deferred = $.Deferred();
            var activeStaff = 0;
            var timeaccomplishment = 0;
            var delay              = 0;    
            
            
                        
            getStaffFiltered()
            .done(function(staff) {
                for (var i = 0; i < staff.length; i++) {                    
                    
                    // Para cada Staff, retornar alertas y tareas y el cumplimiento de tiempo
                    staff[i]['stats'] = that.getStaffStats(staff[i].idstaff);                
                    staff[i].fullname = staff[i].name + ' ' +  helper.fixNull(staff[i].lastname);
                                        
                    
                    if (staff[i]['stats'].timeaccomplishment > 0) {
                        activeStaff++;
                        timeaccomplishment += staff[i]['stats'].timeaccomplishment;     
                        delay              += staff[i]['stats'].delay;  
                        
                    }
                }           
                     
                
                activeStaff > 0 ? that.data.effectivity = Math.round(timeaccomplishment / activeStaff) : that.data.effectivity = 0;
                // Delay 
                that.data.delay = delay;
                that.data.hasdelay = (delay < 0);
                
                
                deferred.resolve(new kendo.data.DataSource({
                    data : staff,
                    sort: {field: "name", dir: "asc"},
                }));   
            })
            
            
            return deferred.promise();
        }
        
        
        
        this.getStaffStats = function(idstaff) {
            var that = this;
            
            var stats = {                 
                tasks: {},
                alerts: {},
                all: 0,
                finished: 0,                
                progress: 0,               
                evaluation: 0,    // overall evaluation
                timeaccomplishment: 0,                
                hasdelay: false,
                delay: 0,
            }
            
            stats.alerts   = this.getStaffAlertsStats(idstaff);            
            stats.tasks    = this.getStaffTasksStats(idstaff);           
            stats.finished = stats.alerts.resolved + stats.tasks.resolved;
            stats.all      = stats.tasks.pending + stats.tasks.inprogress  + stats.tasks.paused + stats.tasks.resolved +
                                       stats.alerts.pending + stats.alerts.inprogress +  stats.alerts.paused + stats.alerts.resolved;
            if (stats.finished > 0) {
                
                // Global Evaluation
                if (stats.alerts.evaluation === 0)
                    stats.evaluation = stats.tasks.evaluation;
                else if (stats.tasks.evaluation === 0)
                    stats.evaluation = stats.alerts.evaluation;
                else
                    stats.evaluation = (stats.alerts.evaluation + stats.tasks.evaluation) / 2;
                
                stats.progress = (stats.finished / (stats.alerts.pending   + stats.alerts.inprogress + stats.alerts.paused + stats.alerts.resolved +
                                          stats.tasks.pending + stats.tasks.inprogress + stats.tasks.paused  + stats.tasks.resolved)) * 100;
                
                
                var delay = stats.alerts.delay + stats.tasks.delay;                
                stats.hasdelay = (delay < 0);
                stats.delay = Math.abs(delay);
                
                
                
                // Time Accomplishment                
                var expectedduration =  (stats.alerts.expectedduration + stats.tasks.expectedduration) * 60;            
                var duration         = stats.alerts.duration + stats.tasks.duration;
                                
                
                if (duration <= expectedduration) {                
                    stats.timeaccomplishment = 100;                                
                }
                else {                                                    
                    var n = 100- [((duration - expectedduration)*100)/ expectedduration];                               
                    stats.timeaccomplishment = n;
                }
                
                // Delay
                var timeDelay     = Math.floor((expectedduration - duration) / 60);                                        
                stats.delay      = timeDelay;
                stats.hasdelay   = timeDelay < 0;
                
                
            }
                
            return stats;            
        }
        
        
        
        
        
        
        this.getStaffAlertsStats = function(idstaff) {
            var result = { pending: 0, inprogress: 0, paused: 0, resolved: 0, expectedduration:0, duration:0, evaluation: 0, totalevaluated: 0  };            
                        
            
            for (var i = 0; i < _alerts.length; i++) {                                                                
                if (_alerts[i].idstaff === idstaff) {                        
                    switch(_alerts[i].idstatus) { // _alerts está agrupado por idstatus.
                            case globals.ALERT_STATUS_PENDING: {result.pending++; break;}
                            case globals.ALERT_STATUS_IN_PROGRESS: {result.inprogress++; break;}
                            case globals.ALERT_STATUS_PAUSED: {result.paused++; break;}
                            case globals.ALERT_STATUS_RESOLVED: {                                      
                                result.resolved++; 
                                // No tomamos en cuenta Perdido y Encontrado para el calculo de tiempo o Desempeño,                                
                                if (_alerts[i].idtypecategory !== globals.ALERT_CATEGORY_LOSTANDFOUND) {                                    
                                    result.expectedduration += _alerts[i].expectedduration;
                                    result.duration         += _alerts[i].duration;        
                                    
                                    // No tomamos en cuenta alerts aún no evaluadas;
                                    if (_alerts[i].evaluation != null) {
                                        result.evaluation       += _alerts[i].evaluation;
                                        result.totalevaluated++  ;
                                    }
                                }
                                break;                                
                            }
                        }
                    }                
            }            
            if (result.totalevaluated > 0) 
                result.evaluation = Math.round(result.evaluation / result.totalevaluated);
                                    
            return result;
        }
        
        
         this.getStaffTasksStats = function(idstaff) {
            var result = { pending: 0, inprogress: 0, paused: 0, resolved: 0, expectedduration:0, duration:0, evaluation: 0, totalevaluated: 0  };            
                        
            
            for (var i = 0; i < _tasks.length; i++) {                                                                
                if (_tasks[i].idstaff === idstaff) {                        
                    switch(_tasks[i].idstatus) { // _alerts está agrupado por idstatus.
                            case globals.ALERT_STATUS_PENDING: {result.pending++; break;}
                            case globals.ALERT_STATUS_IN_PROGRESS: {result.inprogress++; break;}
                            case globals.ALERT_STATUS_PAUSED: {result.paused++; break;}
                            case globals.ALERT_STATUS_RESOLVED: {                                      
                                result.resolved++; 
                                // No tomamos en cuenta Perdido y Encontrado para el calculo de tiempo o Desempeño,                                
                                if (_tasks[i].idtypecategory !== globals.ALERT_CATEGORY_LOSTANDFOUND) {                                    
                                    result.expectedduration += _tasks[i].expectedduration;
                                    result.duration         += _tasks[i].duration;        
                                    
                                    // No tomamos en cuenta alerts aún no evaluadas;
                                    if (_tasks[i].evaluation != null) {
                                        result.evaluation       += _tasks[i].evaluation;
                                        result.totalevaluated++  ;
                                    }
                                }
                                break;                                
                            }
                        }
                    }                
            }            
            if (result.totalevaluated > 0) 
                result.evaluation = Math.round(result.evaluation / result.totalevaluated);
                                    
            return result;
        }
        
        
        
        
        this.updateStaff = function() {
             var deferred = $.Deferred();    
            var that = this;   
            
            // THIS CALL ONLY WORKS FOR HOUSEKEEPER AND MAINTENANCECHIEF....
            // not for maid or maintenance...            
            var criteria = {idmodule: app.user.idmodule }; //helper.getRoleModule(app.user.role)};                   
             // Get updata staff from Server (whose lastmodified is bigger/later than max lastmodified from local db.
             $api.getStaff(criteria)
             .done(function(rows) {                                           
                 if (rows.length === 0) // nothing to update                                                
                        deferred.resolve(false);                            
                 else   
                     syncController.synchronizeFromServer($localdb.db.Staff, rows)
                     .done(function() {
                         deferred.resolve(true);                                
                     })                                
             })
             .fail(function(err) {
                 deferred.reject(err);
             })
            
            return deferred.promise();       
            
        }
        
        
        this.updateStaffOLD = function() {
            var deferred = $.Deferred();    
            var that = this;   
            
            // THIS CALL ONLY WORKS FOR HOUSEKEEPER AND MAINTENANCECHIEF....
            // not for maid or maintenance...
            $localdb.getMaxLastmodifiedByRole($localdb.db.Staff,app.user.role)
            .done(function(lastmodified) {                                            
                var criteria = {idmodule: helper.getRoleModule(app.user.role)};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get updata staff from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getStaff(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                                
                        deferred.resolve(false);                            
                    else                        
                        syncController.synchronizeFromServer($localdb.db.Staff, rows)
                        .done(function() {
                            deferred.resolve(true);    
                            
                        })                                
               })
            })          
                       
            return deferred.promise();             
        }
        
        
        this.getWorkingHoursForStaff = function(idstaff) {
            var deferred = $.Deferred();
            var result = [];
            
            var workingHours = $localdb.getWorkingHours(idstaff);
            
            workingHours.forEach( function( workingHour) { 
                result.push(workingHour);
            })
            .done(function(){
                deferred.resolve(result);
            })
            
            return deferred.promise();
        }
        
        this.updateWorkingHours = function(idmodule) {             
            var deferred = $.Deferred();                        
            var that = this;                        
                        
            // Get max(lastmodified) from local database 
            $localdb.getMaxLastmodified($localdb.db.WorkingHours)
            .done(function(lastmodified) {                                
                var criteria = {idmodule: idmodule};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'";                 
                $api.getWorkingHours(criteria)
                .done(function(rows) {                                        
                    if (rows.length === 0) // nothing to update                    
                        deferred.resolve(false);                            
                    else
                        syncController.synchronizeFromServer($localdb.db.WorkingHours, rows)
                        .done(function() {                                                        
                                deferred.resolve(true);                                
                        })                    
                })                                
            })                                 
            return deferred.promise(); 
        }
            
            
        
        
        
        
        
        // Gets from the database a list of alerts that the staff member has already completed.
        // How many?? 30
        this.getAlertHistory = function(idstaff) {
            var deferred = $.Deferred();            
            
            var resolvedAlerts = $localdb.getResolvedAlerts(idstaff);            
            
            resolvedAlerts.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    pageSize: 30,
                    filter : {field: "iscleaningtask", operator: "equals", value: 0  }
                    //sort: {field: "idalert", dir: "desc"},                    
                    //filter: todayOnly === true ? generateFilterTodayTasks() : generateFilter()
                }));                                    
            })                        
            
            
            
            return deferred.promise();
        }
        
        
        this.updateFilterPreferences = function(filterpreferences) {
            var deferred = $.Deferred();                        
            var that = this;            
            $api.updateFilterPreferences({ idstaff: app.user.idstaff, filter: JSON.stringify(filterpreferences)})
            .done(function(result) {                    
                deferred.resolve();        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        },
        
         this.updatePreferences = function(preferences) {
            var deferred = $.Deferred();                        
            var that = this;            
            $api.updatePreferences({ idstaff: app.user.idstaff, preferences: JSON.stringify(preferences)})
            .done(function(result) {                    
                deferred.resolve();        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();            
        },
        
        this.setAvailability = function(idstaff, available) {
            var deferred = $.Deferred();                        
            var that = this;            
            $api.setAvailability({ idstaff: app.user.idstaff, available: available })
            .done(function(result) {                    
                deferred.resolve(result);        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();                    
        }
        
        
         this.setAvatar = function(idstaff, avatar) {
            var deferred = $.Deferred();                        
            var that = this;            
            $api.setAvatar({ idstaff: idstaff, avatar: avatar})
            .done(function(result) {                    
                deferred.resolve(result);        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise();                    
        }
        
        
        this.changePassword = function(idstaff, currentPassword, newPassword) {            
            var deferred = $.Deferred();                        
            var that = this;            
            $api.changePassword({ idstaff: idstaff, password: currentPassword, newpassword: newPassword})
            .done(function(result) {                    
                deferred.resolve(result);        
             })    
            .fail(function(error) {
                 deferred.reject(error);    
             })   
            return deferred.promise(); 
            
        }
        
        /****** GENERAL ******/
        
        
        this.updateFacilities = function() {
            var deferred = $.Deferred();    
            var that = this;   
            
            $localdb.getMaxLastmodified($localdb.db.Facilities)
            .done(function(lastmodified) {                                            
                var criteria = {};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get updated Facilities from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getFacilities(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                                
                        deferred.resolve(false);                            
                    else                        
                        syncController.synchronizeFromServer($localdb.db.Facilities, rows)
                        .done(function() {
                            deferred.resolve(true);    
                            
                        })                                
               })
            })          
                       
            return deferred.promise();             
        }
        
        this.getFacilities = function(lodging) {                   
            var deferred = $.Deferred();                  
            var isLodging = (lodging === true ? 1 : 0);            
            
            $localdb.db.Facilities.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "name", dir: "asc"},
                    filter: {  
                         logic: "and",
                         filters: [
                             {field: "idhotel", operator: "equals", value: app.hotel.idhotel },                                                                        
                             {field: "deleted", operator: "equals", value: 0 },       
                             {field: "lodging", operator: "equals", value: isLodging },
                          ]
                     }            
                }));      
            })                               
            return deferred.promise();                 
           
        }     
        
        
        this.getAllFacilities = function() {
            var deferred = $.Deferred();                                                 
            
            $localdb.db.Facilities.toArray(function(result) {               
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "name", dir: "asc"},
                    filter: {  
                         logic: "and",
                         filters: [
                             {field: "idhotel", operator: "equals", value: app.hotel.idhotel },                                                                        
                             {field: "deleted", operator: "equals", value: 0 },                                                                                                     
                          ]
                     }            
                }));      
            })                               
            return deferred.promise();     
        }
        
        this.getFacilitiesByType = function(idtype) {                                    
            return $localdb.db.Facilities.asKendoDataSource(            
            {
                
                sort:{ field:"name", dir:"asc"},                 
                filter: {  
                         logic: "and",
                         filters: [
                             {field: "idhotel", operator: "equals", value: app.hotel.idhotel },                                                                        
                             {field: "deleted", operator: "equals", value: 0 },                                                                        
                             {field: "idtype", operator: "equals", value: idtype},
                          ]
                     },            
                 }        
            );
        }   
        
        
        this.getFacilityOccupancy = function(idfacility) {
            var deferred = $.Deferred();            
            var occupancies = $localdb.getFacilityOccupancy(idfacility);
            
            occupancies.toArray(function(result) {                               
                deferred.resolve(result);                
            });                       
            
            return deferred.promise();            
        }
        
        
        
        this.getItems = function(lodging, request, idlocation, idfacilitytype) {                        
            var that = this;
            var deferred = $.Deferred();                        
            
            
            
            var filters = [
                {field: "deleted", operator: "equals", value: 0 },                                                                        
               // {field: "lodging", operator: "equals", value: lodging},                                 
                {field: "request", operator: "equals", value: request}                                
            ];
            
           /* if (idlocation !== null)
                filters.push({field: "idlocation", operator: "equals", value: idlocation});
            */
            
            
           // $localdb.db.Items.toArray(function(result) {          
                
            that.getLocationItems(idlocation)
            .done(function(result) {                       
                that.applyFacilityTypeItemRules(result, idfacilitytype)
                .done(function(newResult) {
                     deferred.resolve(new kendo.data.DataSource({
                    data : newResult, 
                    sort: [{field: "sortnumber", dir: "asc"}, {field: "name", dir: "asc"}],
                    filter: {  
                             logic: "and",
                             filters: filters
                         },         
                    }));      
                    
                })                                
                
            })
            
                
                
            //})                               
            
            return deferred.promise();
        }
        
        
        this.getLocationItems = function(idlocation) {
            var deferred = $.Deferred();
            var that = this;
            var items = [];
            
            $localdb.db.Items.toArray(function(_items) {
                 $localdb.db.ItemLocations.toArray(function(result) {
                                   
                    for (var i=0; i<result.length; i++) {     
                        
                        if (result[i].idlocation == idlocation) {                                     
                            items.push(that.getItemFromArray(_items,result[i].iditem));
                        }
                    }  
                    deferred.resolve(items);
                    
                })
            })
            
            return deferred.promise();
            
        }
        
        this.getItemFromArray = function(items, iditem) {
            for (var i=0; i<items.length; i++) {    
                if (items[i].iditem == iditem) 
                    return items[i];                    
            }  
            return null;            
        }
        
        
        this.applyFacilityTypeItemRules = function(items, idfacilitytype) {
            var deferred = $.Deferred();
            var that     = this;
            var result   = [];

            
           $localdb.db.RulesFacilityTypeItem.toArray(function(rules) {                                         
               for (var i = 0; i < items.length; i++) {
                   
                   var appliesOnly = that.appliesOnlyToFacilityTypes(items[i].iditem, rules);                   
                   if (appliesOnly.length > 0) {
                       if (that.existsFacilityType(appliesOnly,idfacilitytype))
                       //if (appliesOnly.includes(idfacilitytype))
                           result.push(items[i]);                                   
                   }
                   else {
                   
                       var hide =  that.hideItemFromFacilityType(items[i].iditem, idfacilitytype, rules);                   
                       if (hide != true) {
                           result.push(items[i]);
                       }
                   }
               }
               
               deferred.resolve(result);
           })              
               
            return deferred.promise();            
        }
        
        
        // Items
        this.appliesOnlyToFacilityTypes = function(iditem, rules) {
            var facilitytypes = [];
                                    
             for (var i=0; i<rules.length; i++) {                     
                if (rules[i].iditem == iditem && rules[i].showonly == 1) {                   
                    facilitytypes.push(rules[i].idfacilitytype);
                }
            }    
            
            return facilitytypes;            
        }
        
        
        // Locations
        this.appliesOnlyToLocations = function(idlocation, rules) {
            var facilities = [];
                        
             for (var i=0; i<rules.length; i++) {                       
                if (rules[i].idlocation == idlocation && rules[i].showonly == 1) {                   
                    facilities.push(rules[i].idfacilitytype);
                }
            }    
            
            return facilities;
            
        }
        
        
        this.hideItemFromFacilityType = function(iditem, idfacilitytype, rules  ) {
            
            
            for (var i=0; i<rules.length; i++) {
                if (rules[i].iditem == iditem && rules[i].idfacilitytype == idfacilitytype) {                   
                    return (rules[i].hidefrom == 1);
                }
            }    
            
            return false;
        }
        
        
        
        
        this.getItem = function(iditem) {
            return $localdb.getItem(iditem); 
        }
        
        
        this.getItemCategory = function(iditem) {
            var deferred = $.Deferred();
            this.getItem(iditem)
            .done(function(item) {
                $localdb.getItemCategory(item.iditemcategory)        
                .done(function(itemcategory) {
                    deferred.resolve(itemcategory);
                })
            });
            return deferred.promise();            
        }
        
        
         this.getLocations = function(lodging, request, idfacilitytype) {                        
             var that = this;
             var deferred = $.Deferred();                                    
             var filters = [
                {field: "deleted", operator: "equals", value: 0 },                                                                        
             ];
             
             if (lodging !== null)
                 filters.push({field: "lodging", operator: "equals", value: lodging});
             
             if (request !== null)
                 filters.push({field: "request", operator: "equals", value: request});
             
             
             
             $localdb.db.Locations.toArray(function(result) {      
                 
                 that.applyFacilityTypeLocationRules(result, idfacilitytype)                 
                 .done(function(newResult) {
                      deferred.resolve(new kendo.data.DataSource({
                         data : newResult, 
                         sort: {field: "name", dir: "asc"},
                         filter: {  
                             logic: "and",
                             filters: filters
                         },         
                    }));                           
                 })
            })            
             
             return deferred.promise();
        }
        
        
        this.applyFacilityTypeLocationRules = function(locations, idfacilitytype) {
            var deferred = $.Deferred();            
            var that     = this;
            var result   = [];
            
            console.info("APPLY RULE");
            console.info(idfacilitytype);
            
            
            
           $localdb.db.RulesFacilityTypeLocation.toArray(function(rules) {
                            
              
               for (var i = 0; i < locations.length; i++) {
                   
                   var appliesOnly = that.appliesOnlyToLocations(locations[i].idlocation, rules);
                   if (appliesOnly.length > 0) {
                       //if (appliesOnly.includes(idfacilitytype))
                       if (that.existsFacilityType(appliesOnly,idfacilitytype))
                           result.push(locations[i]);            
                       
                   }
                   else {
                       var hide =  that.hideLocationFromFacilityType(locations[i].idlocation, idfacilitytype, rules);                   
                       if (hide != true) {
                           result.push(locations[i]);
                       }                       
                   }                   
               }
               
               deferred.resolve(result);
           })              
            
            
            return deferred.promise();
        }
        
        
        this.existsFacilityType = function(lista, idfacilitytype) {
            for (var i=0;i<lista.length; i++) 
                if (lista[i] == idfacilitytype) return true;
                
            return false;            
        }
       
        
        
       
        
         this.hideLocationFromFacilityType = function(idlocation, idfacilitytype, rules  ) {
            
             for (var i=0; i<rules.length; i++) {                 
                if (rules[i].idlocation == idlocation && rules[i].idfacilitytype == idfacilitytype) {                   
                    return (rules[i].hidefrom == 1);
                }
            }    
            
            return false;
        }
        
        
        
        // Checks in the backend for updated item types 
        this.updateItems = function() {            
            var deferred = $.Deferred();    
            var that = this;   
            
            $localdb.getMaxLastmodified($localdb.db.Items)
            .done(function(lastmodified) {                                            
                var criteria = {};       
                if (lastmodified !== null) criteria['condition'] = "t.lastmodified>'" + $date.toMySQLFormat(lastmodified) + "'"; 
                // Get updated Item Types from Server (whose lastmodified is bigger/later than max lastmodified from local db.
                $api.getItems(criteria)
                .done(function(rows) {                                           
                    if (rows.length === 0) // nothing to update                                                
                        deferred.resolve(false);                            
                    else                        
                        syncController.synchronizeFromServer($localdb.db.Items, rows)
                        .done(function() {
                            deferred.resolve(true);                                
                        })                                
                })
            })          
                       
            return deferred.promise();                       
        }
        
        
        // WE GET ALL RELEVANT ROWS FROM BE (NO LASTMODIFIED NEEDED)
        // WE REMOVE ALL LOCAL ROWS first 
        this.updateOccupancy = function() {
            var deferred = $.Deferred();
            var that = this;
                        
            syncController.pullFull($localdb.db.Occupancy)
            .done(function() {                
                deferred.resolve();            	
            })
            .fail(function(err) {
                console.info(err);
            });
            return deferred.promise();
            
        }
        
        
        this.getOccupancy = function() {
            var deferred = $.Deferred();
            var that = this;
            
            $localdb.db.Occupancy.toArray(function(result) {               
                that.addFacilityStats(result);
                
                deferred.resolve(new kendo.data.DataSource({
                    data : result, 
                    sort: {field: "facilityname", dir: "asc"},
                    filter: { 
                            logic: "and",
                            filters: [                                
                                {field: "idhotel", operator: "eq", value: app.hotel.idhotel },                                 
                                {field: "deleted", operator: "eq", value: 0 }
                        ]},
                    
                }));
            });            
            return deferred.promise();
        }
        
        
        this.setRoomReady = function(idfacility, ready) {
            
            var deferred = $.Deferred();
            
            $api.setRoomReady({ idfacility: idfacility, ready: ready})
            .done(function(result) {                                    
                $localdb.updateOccupancyRoomReady(idfacility, ready)
                .done(function()  {      
                    deferred.resolve();            
                })
            });
                         
            return deferred.promise();
        } 
        
        this.setRoomCleaninigStatus = function(idfacility, status,uuid,name) {
            
            var deferred = $.Deferred();
                                            
         $localdb.updateOccupancyRoomisclean(idfacility, status,uuid,name)
           .done(function()  {      
              deferred.resolve();            
           })
                
            return deferred.promise();
        }
        
        this.addFacilityStats = function(result) {            
            for (var i =0;i<result.length;i++) {
                result[i]['stats'] = this.facilityStats(result[i].idfacility);
            }
            
        }
        
      
        
        
        
        ///// PRIVATE /////
        
        
        addCurrentActivity = function(staffArray) {
            var deferred = $.Deferred();
            
            deferred.resolve();
            
            return deferred.promise();
            
            /*
            var promises = [];
            
            for (var i = 0; i<staffArray.length; i++) {
                promises.push(currentActivity(staffArray,i));
            }
            
            return $.when.apply($, promises);
            */
        }
        
        
       
        
        
        currentActivity = function(staffArray,i) {
            var deferred = $.Deferred();
                        
            $localdb.getCurrentActivity(staffArray[i].currentactivitytype, staffArray[i].currentactivityid)
            .done(function(activity) {                                
                if (activity == null) {
                    staffArray[i]["currentactivity"] = null;            
                    staffArray[i]["currentactivityName"] = '';            
                    staffArray[i]["currentactivityFacility"] = '';            
                }
                else {
                    staffArray[i]["currentactivity"] = activity;
                    staffArray[i]["currentactivityName"] = activity.name;            
                    staffArray[i]["currentactivityStatus"] = activity.idstatus;            
                    if (activity.idfacility != null)
                        staffArray[i]["currentactivityFacility"] = helper.getShortFacilityName(activity.idfacility);            
                    else
                        staffArray[i]["currentactivityFacility"] = '';
                }
                deferred.resolve();
            });
            return deferred.promise();
        }
        
        
         addIsWorkingFlag = function(staffArray) {
           var promises = [];
                        
            for (var i = 0; i<staffArray.length; i++) {                
                promises.push(isWorking(staffArray,i));
            }
            
            return $.when.apply($, promises);            
        }
        
        // See if staf member is working today
        // If no working hours defined, it returns true (assumes is working)
        isWorkingOLD= function(staffArray, i) {
            var deferred = $.Deferred();
            
            var wh = $localdb.getWorkingHour(staffArray[i].idstaff, moment().weekday()+1);            
            wh.count(function(n) {
                if (n === 0) {
                    staffArray[i]["isworking"] = true; 
                    deferred.resolve();
                }
                else {
                    wh.forEach(function(e) {                        
                        staffArray[i]["isworking"] = e.free === 0 ? true : false;
                        deferred.resolve();
                    })        
                }                                    
            })
            
            return deferred.promise();
        }
        
        
        
        
                
        
        asKendoDataSource = function(entitySet, filter, group, sort) {
            var deferred = $.Deferred();            
            entitySet.toArray(function(result) {                  
                deferred.resolve(new kendo.data.DataSource({data : result, filter: filter, group: group, sort: sort}));   
            });               
           return deferred.promise();                
        }
        
         asKendoDataSourceNG = function(entitySet, filter, sort) {
            var deferred = $.Deferred();            
            entitySet.toArray(function(result) {                  
                deferred.resolve(new kendo.data.DataSource({data : result, filter: filter, sort: sort}));   
            });               
           return deferred.promise();                
        }
        
        
        // FALTA MANAGER
        // It also adds fullname field...for search 
        filterStaff = function(staffArray) {                    
            var result = [];
            for (var i=0;i<staffArray.length;i++) {                
                
                if (staffArray[i].idhotel === app.hotel.idhotel && staffArray[i].deleted === 0) {                    
                   if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE) {                                 
                        if (staffArray[i].idstaff === app.user.idstaff) {                                        
                            result.push(staffArray[i]); break;
                        }
                   }
                   else if (app.user.role === globals.ROLE_HOUSEKEEPER ) {
                      if (staffArray[i].idmodule === globals.MODULE_HOUSEKEEPING)        
                            result.push(staffArray[i]); 
                   }
                   else if (app.user.role === globals.ROLE_MAINTENANCECHIEF ) {
                      if (staffArray[i].idmodule === globals.MODULE_MAINTENANCE)        
                            result.push(staffArray[i]); 
                   }
                   else if (app.user.role === globals.ROLE_MANAGER || app.user.role === globals.ROLE_OPERATIONS ) {                      
                       if (staffArray[i].idmodule === globals.MODULE_MAINTENANCE || staffArray[i].idmodule === globals.MODULE_HOUSEKEEPING
                           || staffArray[i].idmodule === globals.MODULE_OPERATIONS)  
                            result.push(staffArray[i]); 
                   }
               }   
                
               staffArray[i]["fullname"]  = staffArray[i].name + ' ' + staffArray[i].lastname;
            }            
            return result;
        }
        
        
        
        getStaffFiltered = function() {            
            var deferred = $.Deferred();
            
             $localdb.db.Staff.toArray(function(result) {
                 result = filterStaff(result);
                 deferred.resolve(result);
                 //addIsWorkingFlag(result)
                 /*addCurrentActivity(result)
                 .done(function() {               
                     deferred.resolve(result);                     
                 })*/                     
             })               
            
            return deferred.promise();
        }
        
        
        
        
        // Generates Filter for Tasks and Alerts based on role...
        generateFilter = function( ) {            
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 }
                ];                  
            
            
            if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)                                 
                filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})            
            else if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})            
            else if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})            
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        
        generateFilterToday = function() {
              var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 }
                ];                                         
            
            /*if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)                                 
                filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})            */
           /* else if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})  */
            
            if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})            
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
            
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: 100   },  // not resolved or not finished
                    
                ]                
            };
            
            
            todayOrNotResolvedFilter.filters.push({field: "finishdate", operator: "greater", value: $date.yesterday()  });
            
            /*else { // assume is tasks
                todayOrNotResolvedFilter.filters.push({field: "ended", operator: "greater", value: $date.yesterday()  });
                 // FILTER OUT FUTURE TASKS
                filters.push({field: "start", operator: "lt", value: $date.tomorrow() });
             } */
                        
            filters.push(todayOrNotResolvedFilter);
            
            
            return { 
                logic: "and",
                filters: filters                   
            };            
            
        }
        
        
        // Generates Filter for Alerts (idcategory=1) based on role...        
        // It also adds filter for today, 
        generateFilterTodayAlerts = function( ) {            
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                              
                {field: "deleted", operator: "equals", value: 0 }           
                ];                                         
              
            var onlyfreealerts   = localStorage.getItem("onlyfreealerts");
             var role   = localStorage.getItem("userrole");
            
              if (role != globals.ROLE_MAINTENANCE)
                filters.push({field: "idcategory", operator: "equals", value: globals.IS_ALERT });    
            
            //// DEBEMOS CONSIDERAR UN PAR DE COSAS ADICIONALES..
            // 1. Departamentización 
            //    a.Si el usuario tiene un iddepartment = 0, no se filtra por iddepartment
            //    b. Si el usuario tiene un iddeparment, se filtran aquellas alertas que tengan iddeparment 
            //        diferente a null (las alertas con iddpartment = null no se filtran) y diferente al iddepartment del usuario. 
            
            if (app.user.iddepartment > 0 ) {  // Si el usuario no tiene departamento, no se filtra por departamento...
                var departmentFilter = {};
                
                 if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT) {  //1  
                     console.info('My Dept Plus Orphans');
                    departmentFilter = { 
                            logic: "or",
                            filters: [
                                {field: "iddepartment", operator: "equals", value: 0 }, // mostramos alertas que no pertenecen a un departamento
                                {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(departmentFilter);                
                }
                else if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_ONLY) {    // 2
                    console.info('My Dept ONLY');
                    departmentFilter = { 
                            logic: "or",
                            filters: [                                
                                {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };                           
                    filters.push(departmentFilter);                
                }
                                
            }
            
                
            /*if (app.user.role === globals.ROLE_MAID) {
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING});
            }*/
      
             
            if (role == globals.ROLE_MAINTENANCE && onlyfreealerts == 1) { 
                 var onlyMine = { 
                            logic: "or",
                            filters: [
                                {field: "idstaff", operator: "equals", value: 0},
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(onlyMine);     
            }
            
            if (app.user.role === globals.ROLE_MAINTENANCECHIEF) {
               var moduleFilter = { 
                            logic: "or",
                            filters: [
                                {field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE},
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(moduleFilter);     
            }
            
             if (app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_MAID) {
               filters.push( {field: "idstaff", operator: "equals", value: app.user.idstaff }  );
                 
                 
            }
            
                
            
            if (app.user.role === globals.ROLE_MAINTENANCECHIEF || app.user.role === globals.ROLE_MAINTENANCE) {
                 var byhkfilter = { 
                            logic: "or",
                            filters: [
                                {field: "byhousekeeper", operator: "ne", value: 1},
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(byhkfilter);                     
            }
                            
            
           /* else if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})            */            
            
            
           /* else if (app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})          */  
            
            // USER FILTER PREFERENCES
            
             app.user.filterpreferences = app.user.filterpreferences || app.homeView.defaultfilter;     
            
            if (!app.user.filterpreferences.notstarted)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_PENDING});      
            if (!app.user.filterpreferences.inprogress)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_IN_PROGRESS});      
            if (!app.user.filterpreferences.paused)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_PAUSED});      
            if (!app.user.filterpreferences.finished)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED});      
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
                        
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                                                         
                
                ]                
            };
            
            filters.push(todayOrNotResolvedFilter);
            
            // DEBEN SER EL ÚLTIMO FILTRO, PARA HACER POP A LA HORA DE CAMBIAR TABS
            if (app.user.role === globals.ROLE_HOUSEKEEPER /*|| app.user.role === globals.ROLE_MAID*/) {
                var hkfilter = { 
                        logic: "or",
                        filters: [
                            {field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING },                    
                            {field: "byhousekeeper", operator: "equals", value: 1  },                                                                        
                        ]                
                     };            
                filters.push(hkfilter);
            }
                
                
            
            if (app.user.role === globals.ROLE_OPERATIONS) {
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE });                    
                filters.push({field: "byhousekeeper", operator: "equals", value: 0 });                    
            }
                
            
             if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE) {                
           
                 filters.push(  {field: "iscleaningtask", operator: "equals", value: 0  }); 
                 if (app.hotel.collaborative == 1) {
                    var idstaffFilter = { 
                        logic: "or",
                        filters: [                    
                            {field: "idstaff", operator: "equals", value: app.user.idstaff },                    
                            {field: "idstaff", operator: "equals", value: 0  },                                                                                                                                              
                        ]                
                     }; 
                     if(app.user.role === globals.ROLE_MAID){
                         idstaffFilter.filters.push({field: "byhousekeeper", operator: "equals", value: 1  });
                         idstaffFilter.filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING });
                     } 
                     
                    filters.push(idstaffFilter);
                } else
                    filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})                                           
                                                              
             }
                          
         
             //console.log(filters);
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        generateFilterTodaysStaffAlerts= function(idstaff) {            
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 },
                {field: "idstaff", operator: "equals", value: idstaff}
                ];                                         
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
                        
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                    
                ]                
            };
            
            filters.push(todayOrNotResolvedFilter);
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        
        // TODO: Need to filter future tasks...        
        generateFilterTodayTasks = function() {
             var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "idcategory", operator: "equals", value: globals.IS_TASK },  
                {field: "deleted", operator: "equals", value: 0 }
                ];     
            
            
             //// DEBEMOS CONSIDERAR UN PAR DE COSAS ADICIONALES..
            // 1. Departamentización 
            //    a.Si el usuario tiene un iddepartment = 0, no se filtra por iddepartment
            //    b. Si el usuario tiene un iddeparment, se filtran aquellas alertas que tengan iddeparment 
            //        diferente a null (las alertas con iddpartment = null no se filtran) y diferente al iddepartment del usuario. 
            
           // if (app.user.iddepartment > 0 && (app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_MAINTENANCECHIEF) ) {  // Si el usuario no tiene departamento, no se filtra por departamento...
            if (app.user.iddepartment > 0 ) {  // Si el usuario no tiene departamento, no se filtra por departamento...
                var departmentFilter = {};
                
                 if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT) {  //1  
                     console.info('My Dept Plus Orphans');
                    departmentFilter = { 
                            logic: "or",
                            filters: [
                                {field: "iddepartment", operator: "equals", value: 0 }, // mostramos alertas que no pertenecen a un departamento
                                {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };            
                     filters.push(departmentFilter);                
                }
                else if (app.user.visibility == globals.VISIBILITY_MY_DEPARTMENT_ONLY) {    // 2
                    console.info('My Dept ONLY');
                    departmentFilter = { 
                            logic: "or",
                            filters: [                                
                                {field: "iddepartment", operator: "equals", value: app.user.iddepartment  },
                                {field: "idstaff", operator: "equals", value: app.user.idstaff }                                                                       
                            ]                
                         };                           
                    filters.push(departmentFilter);                
                }
                                
            }
            
                        
                
            if (app.user.role === globals.ROLE_MAID)
                //filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING});
                filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})   
            else if (app.user.role === globals.ROLE_MAINTENANCE ) 
                //filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE});
                 filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})     
                            
            
           /* else if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})            */            
            
            
            if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})            
            
           /* else if (app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})          */  
            
            // USER FILTER PREFERENCES
            
             app.user.filterpreferences = app.user.filterpreferences || app.homeView.defaultfilter;     
            
            if (!app.user.filterpreferences.notstarted)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_PENDING});      
            if (!app.user.filterpreferences.inprogress)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_IN_PROGRESS});      
            if (!app.user.filterpreferences.paused)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_PAUSED});      
            if (!app.user.filterpreferences.finished)
                filters.push({field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED});      
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
                        
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: globals.ALERT_STATUS_RESOLVED    },                    
                    {field: "finishdate", operator: "greater", value: $date.yesterday()  },                                                         
                
                ]                
            };
            
            filters.push(todayOrNotResolvedFilter);
            
             // FILTER OUT FUTURE TASKS
            filters.push({field: "startdate", operator: "lt", value: $date.tomorrow() });
            
            // DEBEN SER EL ÚLTIMO FILTRO, PARA HACER POP A LA HORA DE CAMBIAR TABS
            if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING});
            
            if (app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE});
            
             if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE) {                
                
                 if (app.hotel.collaborative == 1) {
                    var idstaffFilter = { 
                        logic: "or",
                        filters: [
                            {field: "idstaff", operator: "equals", value: app.user.idstaff },                    
                            {field: "idstaff", operator: "equals", value: 0  },                                                                        
                        ]                
                     };            
                    filters.push(idstaffFilter);
                } else
                    filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})                                           
            }
           filters.push( {field: "iscleaningtask", operator: "equals", value: 0  }); 
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        
        
        
         // Generates Filter for Tasks based on role...        
        // It also adds filter for today, 
        generateFilterTodayTasksOLD = function( ) {            
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 }
                ];                                         
            
            if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)                                 
                filters.push({field: "idstaff", operator: "equals", value: app.user.idstaff})            
            else if (app.user.role === globals.ROLE_HOUSEKEEPER)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})            
            else if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})  
            
            /*else if (app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})        */
            
            
             // USER FILTER PREFERENCES
            
            if (!app.user.filterpreferences.notstarted)
                filters.push({field: "idstatus", operator: "ne", value: globals.TASK_STATUS_NOT_STARTED});      
            if (!app.user.filterpreferences.inprogress)
                filters.push({field: "idstatus", operator: "ne", value: globals.TASK_STATUS_IN_PROGRESS});      
            if (!app.user.filterpreferences.paused)
                filters.push({field: "idstatus", operator: "ne", value: globals.TASK_STATUS_PAUSED});      
            if (!app.user.filterpreferences.finished)
                filters.push({field: "idstatus", operator: "ne", value: globals.TASK_STATUS_FINISHED});      
            
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
            
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: globals.TASK_STATUS_FINISHED    },                    
                    {field: "ended", operator: "gt", value: $date.yesterday()  },                    
                ]                
            };
            
            filters.push(todayOrNotResolvedFilter);
            
            // FILTER OUT FUTURE TASKS
            filters.push({field: "start", operator: "lt", value: $date.tomorrow() });
            
            // This last to pop when changing tabs
            if (app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE});
            
            
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        
         generateFilterTodaysStaffTasks= function(idstaff) {            
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 },
                {field: "idstaff", operator: "equals", value: idstaff}
                ];                                         
            
            
            // ADD FILTER to show only today alerts OR other alerts if not resolved yet.
                        
            var todayOrNotResolvedFilter = {
                logic: "or",
                filters: [
                    {field: "idstatus", operator: "ne", value: globals.TASK_STATUS_FINISHED    },                    
                    {field: "ended", operator: "greater", value: $date.yesterday()  },                    
                ]                
            };            
            
            filters.push(todayOrNotResolvedFilter);
             
            // FILTER OUT FUTURE TASKS
            filters.push({field: "start", operator: "lt", value: $date.tomorrow() });
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
                
        
        // if iditem === null, we return all alerttypes
        generateAlertTypeFilter = function(iditem, isTask) {            
            //var criteria = {};
            var filter = [ 
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },
                {field: "deleted", operator: "equals", value: 0 }    
            ];    
                        
            if (typeof iditem !== 'undefined')
                filter.push({field: "iditem", operator: "equals", value: iditem});    
                        
            
            if (typeof isTask !== 'undefined') {
                if (isTask == false) {                    
                    filter.push({field: "fortaskonly", operator: "equals", value: 0 });
                }
            }
            

            
            
            return filter;            
        }
        
        
        generateAlertTypesNoItem = function() {
             //var criteria = {};
            var filter = [ 
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },
                {field: "deleted", operator: "equals", value: 0 },
                {field: "idcategory", operator: "eq", value: 1 } ,
                {field: "iditem", operator: "eq", value: 0 }  
            ];    
            
            if (app.user.role === globals.ROLE_MAID ) {
               filter.push({field: "idmodule", operator: "eq", value: globals.MODULE_HOUSEKEEPING }) ;
            }
            else if (app.user.role === globals.ROLE_MAINTENANCE ) {
               filter.push({field: "idmodule", operator: "eq", value: globals.MODULE_MAINTENANCE }) ;
            }
            
            return filter;     
            
        }
        
        generateAlertTypeFilterFacility = function(idfacility) {            
            var filter = {                
                    logic: "and",
                    filters: [
                        {field: "idhotel", operator: "equals", value: app.hotel.idhotel },
                        {field: "deleted", operator: "equals", value: 0 },                                                                                                
                        {field: "idfacility", operator: "equals", value: idfacility},
                    ]                            
            };                     
            return filter;                
        }
        
        generateFilterByAlertTypeCategory = function(idcategory) {
            var filter = {};            
            filter = {                
                sort: { field:"name",dir:"asc"},                 
                filter: { 
                    logic: "and",
                    filters: [
                        {field: "deleted", operator: "equals", value: 0 },                                                                        
                        {field: "idcategory", operator: "equals", value: idcategory},
                    ]
                },            
            };                     
            return filter;                
        }
        
         generateFilterCommonAlertTypes = function(idcategory) {
            var filter = 
              { 
                    logic: "and",
                    filters: [
                        {field: "idhotel", operator: "eq", value: app.hotel.idhotel },
                        {field: "idcategory", operator: "neq", value: 3 }, // ignore Lost & Found
                        {field: "name", operator: "neq", value: "Otro" },
                        {field: "deleted", operator: "eq", value: 0 },                                                                                                                    
                    ]
                };
            
             
            return filter;                
        }
        
        
        // Filters staff members depending on the role of the current user.
        // If role == housekeeper, retrieve all housekeeping staff, etc. 
        generateFilterStaff = function() {            
            var filters = [{field: "deleted", operator: "equals", value: 0 }];                  
                                    
            if (app.user.role === globals.ROLE_HOUSEKEEPER) {                                
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})
            }            
            else if (app.user.role === globals.ROLE_MAINTENANCECHIEF) {                                
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})
            }
            else if (app.user.role === globals.ROLE_MANAGER) {                                
                filters.push({field: "idhotel", operator: "equals", value: app.hotel.idhotel})
            }
            
            return { 
                logic: "and",
                filters: filters                   
            };            
        }
        
        
        // Maids and Maitenance really don´t use this, only housekeeper and maintenancechief
        generateFilterTaskTypes = function(iditem, module) {
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 }
                ];     
            
            if (typeof module != 'undefined')
                filters.push({field: "idmodule", operator: "equals", value: module});
            else            
            if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAID )
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_HOUSEKEEPING})            
            else if (app.user.role === globals.ROLE_MAINTENANCECHIEF || app.user.role === globals.ROLE_MAINTENANCE
                    || app.user.role === globals.ROLE_OPERATIONS)
                filters.push({field: "idmodule", operator: "equals", value: globals.MODULE_MAINTENANCE})            
            
            if (typeof iditem !== 'undefined')
                filters.push({field: "iditem", operator: "equals", value: iditem});
            
            
            
            return { 
                logic: "and",
                filters: filters                   
            };            
            
        }
        
        generateFilterGeneralTaskTypes = function(idmodule) {
            var filters = [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel },  
                {field: "deleted", operator: "equals", value: 0 }
                ];     
            
            
          
                filters.push({field: "idmodule", operator: "equals", value: idmodule})            
            
                filters.push({field: "iditem", operator: "equals", value: null});
            
            return { 
                logic: "and",
                filters: filters                   
            };            
            
        }
       
        this.setFCMtoken = function(idstaff, token) {
            var deferred = $.Deferred();
            var that = this;
            $api.setFCMtoken({ idstaff: idstaff, token: token})
            .done(function(result) {
                deferred.resolve(result);
             })
            .fail(function(error) {
                 deferred.reject(error);
             })
            return deferred.promise();
        }
        
        
    } // TaskController
    
    window.TaskController = TaskController;
    
})(window)

var taskController = new TaskController();
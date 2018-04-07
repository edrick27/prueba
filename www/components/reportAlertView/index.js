_//'use strict';

app.reportAlertView = kendo.observable({
    
    
    roomsDataSource:              [],        
    roomsDataSourceAll:           [],        
    commonZonesDataSource:        [],        
    initlistview  : false,
        
    itemsDataSource:              [],
    locationsDatasource:          [], 
    
    alertTypesDataSource:         [],
    
    //taskTypesDataSource:          [],    
    
    commonAlertTypesDataSource:   [],    
    
    
    alert: {} ,
    
    
    thetitle: 'Reportar problema',
    isRequest: false,        
    isLodging: true,    // false = zona común
    isLostAndFound: false,        
    
    isTask: false,
    isShortCut: false,
    
    pictures  : [],
    hasPicture: false,    
    
    currentWhere: null,  // last selected where (common zone or facility) so we dont need to reload
    Where: null,
    clean: function() {
      app.reportAlertView.set('isRequest', false);    
      app.reportAlertView.set('isLodging', true);
      app.reportAlertView.set('isLostAndFound',false);     
      app.reportAlertView.set('isShortCut',false),
      app.reportAlertView.set('noItem', false);
        
      app.reportAlertView.initAlert();              
        
    },
    
    initAlert: function() {
         app.reportAlertView.set('alert',{              
        reportedBy: '',        
        idstaff: 0,  // assigned to nobody
        idcategory: globals.IS_ALERT,  
        isOrphan: true,
        notes: '',        
        uris: [],
        facility: {
            idfacility: null,           
            lodging: ''
        },
        category: {
            idcategory: null,            
            name: ''
        },
        item: {
            iditem: null,
            name: ''
        },  
        location: {
            idlocation: null,
            name: ''
        },            
        alertType: {
            idalerttype: null,
            idpriority: null,
            priorityName: '',
            name: ''
        }            
      });
        
    },
        
    
    goBack: function(e) {        
       if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate("#:back");
    },
    
    goBackNoTransition: function(e) {        
         if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate("#:back", "none");
    },
    
    goBackToSelectFacility: function(e) {
        if (typeof e != 'undefined') e.preventDefault();
        var that = app.reportAlertView;
        var lodging1 = that.currentWhere; 
     
          if(lodging1){
              app.mobileApp.navigate('components/reportAlertView/selectFacility.html'); 
          }else{
              app.mobileApp.navigate('components/reportAlertView/selectCommonzone.html');
          }  
    },
    
    
    
    goHome: function(e) {        
         if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate('components/reportAlertView/view.html');         
    },
    
    
    
    goHomeNoTransition: function(e) {    
        console.info('gohomenotransition');
        
        if (typeof e != 'undefined') e.preventDefault();
        console.info('navigate');
        app.mobileApp.navigate('components/reportAlertView/view.html', "none");         
    },
   
    goBackLocation: function(e) {
        if (typeof e != 'undefined') e.preventDefault();
        
        if (app.reportAlertView.get('isCleaningTask') == true)
             app.mobileApp.navigate('components/reportAlertView/selectFacility.html');   
        else
            app.mobileApp.navigate('components/reportAlertView/selectLocation.html');   
        
    },
    
     goBackWhere: function(e) {
        if (typeof e != 'undefined') e.preventDefault();
        app.mobileApp.navigate('components/reportAlertView/selectWhere.html');   
        
    },
    
    afterShow: function() {
        //$smart.pauseSyncWorker();      
        var that = app.reportAlertView; 
        helper.hideChat();
        helper.showClock($("#clock"));
        app.reportAlertView.set('showModule',false); 
        that.loadFacilities().done(function(){
         /*if(initlistview) return false;
         initlistview = true
         setTimeout(function(){ 
                        $("#listviewFacility").kendoMobileListView({
                            template : $("#facilities-template").text(),
                            dataSource: that.get('roomsDataSource'),
                            click: that.selectFacility
                        });
                    }, 300);*/
        });
    },
    
     beforeShow: function() {
        //app.reportAlertView.updateAlertTypes();                          
         app.reportAlertView.set('hasPicture',false);
         app.reportAlertView.set('pictures',[]);
         
         app.reportAlertView.set('isTask',false);
         app.reportAlertView.set('isHousekeeping',app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAID);
         
         app.reportAlertView.set('thetitle','Reportar problema');                      
                           
         app.reportAlertView.resetAlertOptions();
         app.reportAlertView.alert.takeAlert = false;
         app.reportAlertView.alert.takeAlertAndStart = false;
         app.reportAlertView.alert.reportDone = false;
         app.reportAlertView.alert.byHousekeeper = false;         
         
    },
    
    

    beforeShowSelectLocation: function() {
        // We clear drop down, so we can selet another item  
        app.reportAlertView.set('alert.item', {});
        
        //app.reportAlertView.set('task.item', {});
        //app.reportAlertView.set('createFromAlert', false);  
      
    },
        
    beforeShowSelectItem: function(e) {
        // start view with scroll at the top..(avoid white screen)
        var scroller = e.view.scroller;
        scroller.reset();              
    },
    
    afterShowSelectFacility: function(e) {
        //$("#searchfacility").focus();
        var that = app.reportAlertView;
        if (that.currentWhere != that.Where) {
            var scroller = e.view.scroller;
            scroller.reset();
            app.reportAlertView.applyFacilityFilter();
            that.Where = that.currentWhere;
            $("#searchfacility").val("");
            $("#searchfacility").focus();
        }
       
    },
    
    beforeShowSelectFacility: function(e) {
        //$("#searchfacility").focus();
        var that = app.reportAlertView;
         if(that.initlistview) return false;
        
        console.log("inicio");
         $("#listviewFacility").kendoMobileListView({
               template : $("#facilities-template").text(),
               dataSource: that.get('roomsDataSource'),
               click: that.selectFacility,
               endlessScroll: true, 
               virtualViewSize: 50
        });
       app.reportAlertView.applyFacilityFilter();
       that.initlistview = true
     /*     $("#listView").kendoMobileListView({
                  dataSource: that.get('alertsDataSource')._data,
                  template:  $("#alerts-template").text(),
                  endlessScroll: true, 
                  virtualViewSize: 40
                 });*/
    },
    
    
    init: function(e) {                 
        
        if (helper.isTablet()) {
            //$('#viewSelectAlertCategory *').css('font-size', '30px');    
        }
        console.info('aca');
        
        if (app.hotel.idcategory == 2)
            app.reportAlertView.set('roomText','en casa');
        else
            app.reportAlertView.set('roomText','en habitación');
        
        
        $smart.getCommonAlertTypes()     
        .done(function(ds) {
            ds.fetch(function() {                
                app.reportAlertView.set('commonAlertTypesDataSource',ds);   
        
            })                                             
        })       
    },    
            
    
    initViewSelectFacility: function(e) {                
        $("#searchfacility").on("keyup", function(){
            console.info('search');
            app.reportAlertView.applyFacilityFilter();
            var scroller = e.view.scroller;
            scroller.reset();              
        })  
        $("#searchcommanzone").on("keyup", function(){
            console.info('search2');
            app.reportAlertView.applyFacilityFilter();
            var scroller = e.view.scroller;
            scroller.reset();              
        })      
    },
    
    
    initSelectItem: function(e) {
        //helper.preparePullToRefresh(e, function() { app.reportAlertView.pullToRefreshItems(e) });                            
    }, 
        
    
    
    applyFacilityFilter: function() {
        var that = app.reportAlertView;
        var toFind =  $("#searchfacility").val();
        
        var lodging = that.get('isLodging');
        var isLodging = (lodging === true ? 1 : 0);            
       
       if(lodging){
         that.roomsDataSource.filter({
            logic: "and",
            filters: [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel},
                {field: "deleted", operator: "equals", value: 0}, 
                {field: "lodging", operator: "equals", value: isLodging},    
                
           {
             logic: "or",
             filters: [
                {field: "name", operator: "contains", value: toFind},
                {field: "zone", operator: "contains", value: toFind},
                {field: "parentzone", operator: "contains", value: toFind}
              ]
             }
          ]}  
         );
        }else{
            toFind =  $("#searchcommanzone").val();
            that.commonZonesDataSource.filter({
            logic: "and",
            filters: [
                {field: "idhotel", operator: "equals", value: app.hotel.idhotel},
                {field: "deleted", operator: "equals", value: 0}, 
                {field: "lodging", operator: "equals", value: isLodging},    
                
           {
             logic: "or",
             filters: [
                {field: "name", operator: "contains", value: toFind},
                {field: "zone", operator: "contains", value: toFind},
                {field: "parentzone", operator: "contains", value: toFind}
              ]
             }
          ]}  
         );
        }
    },
    
    
    applyFacilityFilterToDatasourceAll: function(lodging) {
        var that = app.reportAlertView;
        var isLodging = (lodging === true ? 1 : 0);  
        
        that.roomsDataSourceAll.filter( {field: "lodging", operator: "equals", value: isLodging });
        var NewData = that.roomsDataSourceAll;
        that.set('roomsDataSource', NewData);
    },
    
    openSelectStaffView: function() {
        app.homeView.openSelectStaffView(true);
    },
    
    openSelectStaffFromCreateTask: function() {
        app.homeView.openSelectStaffViewFromCreateTask();
    },
        
    
    updateAlertTypes: function() {
        var deferred = $.Deferred(); 
        /*
        $smart.updateAlertTypes()  
        .done(function(changes) {                        
            
            $smart.getCommonAlertTypes()     
            .done(function(ds) {
                
                ds.fetch(function() {                
                    app.reportAlertView.set('commonAlertTypesDataSource',ds);   
                    deferred.resolve();
                })                                             
            })        
            
        })   
        */        
        return deferred.promise();
    },
    
    
    beforeViewCreateAlert: function(e) {
        var that = app.reportAlertView;
        
       // $smart.pauseSyncWorker(); 
        
        $("#btnCreateAlert").prop( "disabled", false );                
        
        $("#byguestcheckbox").prop('checked', false);
        
        var scroller = e.view.scroller;        
        that.myscroller = scroller;
        scroller.reset();
        //that.set('hasPicture',false);
        
        var category = that.get('alert.category.idcategory');
        that.set('showCamera', category !== globals.ALERT_CATEGORY_REQUEST);
        that.set('isRequest', category === globals.ALERT_CATEGORY_REQUEST);
        
        if (app.user.role === globals.ROLE_OPERATIONS)
            that.set('canAssign', true); 
        else if (app.user.role === globals.ROLE_HOUSEKEEPER && category ===  globals.ALERT_CATEGORY_REQUEST)
            that.set('canAssign', true);         
        else if (app.user.role === globals.ROLE_MAINTENANCECHIEF &&  category ===  globals.ALERT_CATEGORY_ISSUE)
            that.set('canAssign', true);         
        else
            that.set('canAssign', false);         
        
        
        that.set('byHousekeeper', false);
        $("#byhousekeepercheckbox").prop('checked', false);
        if (app.user.role === globals.ROLE_HOUSEKEEPER  && category === globals.ALERT_CATEGORY_ISSUE) {
            that.set('byHousekeeper', true);
        }
        
        
        if ( (app.user.role === globals.ROLE_MAINTENANCECHIEF || app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_OPERATIONS)  
              && category === globals.ALERT_CATEGORY_ISSUE) 
            that.set('canTakeAlert', true);        
           
        else if ( (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_HOUSEKEEPER)  && category === globals.ALERT_CATEGORY_REQUEST) 
            that.set('canTakeAlert', true);        
        else
            that.set('canTakeAlert', false);
        
                
        app.user.role == globals.ROLE_MAID ? that.set('seeAlertSettings', false) : that.set('seeAlertSettings', true);
        
        
        if (typeof that.get('alert.alertType') == 'undefined') {
            helper.showDialogMessage('Error','<strong class="c-main4">Falta tipo de alerta </strong>. <br><br> Solicitar al Administrador agregarla!');                        
            return;
            
        }
        
              
        that.set('alert.alertType.priorityName', helper.getPriorityName(that.get('alert.alertType.idpriority')));            
        // AGREGAR LA HORA UNA VEZ QUE SE ENVÍA LA ALERTA...
        that.set('alert.reporteddateDisplay', $date.todayDate());
                
        
         that.set('hasOptionSelected',false);
         if (that.alert.takeAlert == true) {
             that.set('hasOptionSelected',true);
             that.set('optionSelectedMsg', 'Tomar Alerta');
         }
         else if (that.alert.takeAlertAndStart == true) {
             that.set('hasOptionSelected',true);
             that.set('optionSelectedMsg', 'Tomar y Comenzar Alerta');
         }
         else if (that.alert.reportDone == true) {
             that.set('hasOptionSelected',true);
             that.set('optionSelectedMsg', 'Reportar trabajo realizado');
         }
         else if (that.alert.byHousekeeper == true) {
             that.set('hasOptionSelected',true);
             that.set('optionSelectedMsg', 'Asignar a Ama de Llaves');
         }         
         
        $('#alertComment').autosize();
        $('#alertComment').height(70);
    },
    
    
     beforeViewCreateTask: function(e) {
        var that = app.reportAlertView;
        
        $("#btnCreateTask").prop( "disabled", false );                
                
        //$("#starttasknow").prop('checked', false);       
        //$("#taskfinished").prop('checked', false);       
        
        var scroller = e.view.scroller;        
        that.myscroller = scroller;
        scroller.reset();
         
                          
        that.set('hasPicture',false);                
        /*if (that.task.uris == "" || that.task.uris.length == 0)
            that.set('hasPicture',false);                
         else {
             that.set('hasPicture',true);                
             $("#imgTask").attr('src', that.task.uris);
         }
        */   
         
        that.set('showCamera', true);
        
        
        if (app.user.role === globals.ROLE_OPERATIONS)
            that.set('canAssign', true); 
        else if (app.user.role === globals.ROLE_HOUSEKEEPER)
            that.set('canAssign', true);         
        else if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
            that.set('canAssign', true);         
        else
            that.set('canAssign', false);         
        
        
        
    },
    
    
    pullToRefresh: function(e) {        
         if (app.isOffline()) {
            alert('SmartHotel is Offline');
            return;
        }
        
        helper.pleaseWait();
        app.reportAlertView.updateAlertTypes()
        .done(function() {
            e.view.scroller.pullHandled();                
            helper.hideLoading();
        })       
    },
    
  
    
    
    pullToRefreshItems: function(e) {
         if (app.isOffline()) {
            alert('SmartHotel is Offline');
            return;
        }
        
        var that = app.reportAlertView;
        helper.pleaseWait();        
                
        $smart.updateItems()
        .done(function(changes) {
            helper.hideLoading();
            if (changes) {
                $smart.getItems(that.get('isLodging'), that.get('isRequest'), null)                
                .done(function(ds) {                      
                    ds.fetch(function() {
                        that.set('itemsDataSource',ds);                                        
                    })
                })
            }
        })
    },
    
    
    
    
    _selectTask: function(e) {
        e.preventDefault();
        app.reportAlertView.set('isTask',true);
        app.reportAlertView.set('isCleaningTask',false);
        app.reportAlertView.selectAlertCategory($(e.target).data('category'));        
    },
    
     _selectCleaningTask: function(e) {
        e.preventDefault();
        app.reportAlertView.set('isTask',false);       
        app.reportAlertView.set('isCleaningTask',true);
        app.reportAlertView.selectAlertCategory($(e.target).data('category'));        
    },
    
    _selectAlertCategory: function(e) {        
        e.preventDefault();
        app.reportAlertView.set('isTask',false);
        app.reportAlertView.set('isCleaningTask',false);
        app.reportAlertView.selectAlertCategory($(e.target).data('category'));
        
    },

    
    // Si le doy tap en ícono para reportar alerta, y ya estaba ubicado ahi, es una 
    // forma rápida de ir de una vez a seleccionar habitación...
    quickReportAlert: function() {
        var that = app.reportAlertView;
        
        that.set('isTask',false);
        that.set('isCleaningTask',false);
        that.set('thetitle','Reportar Problema');                      
        that.set('alert.idcategory', globals.IS_ALERT);      
        
        
        that.clean();        
        that.set('alert.category.idcategory', 1);               
        that.set('alert.category.name', globals.alertCategories[0]);                        
        that.set('alert.sent', false); // new alert        
        
      
        that.loadfacilyfast();
        
    },
   
    
    
    createAlertFromOccupancy: function(idfacility) {
        var that = app.reportAlertView;
        
        that.initAlert();   
        
        that.set('isTask', false);
        that.set('isRequest',false);        
        that.set('isLodging',true);
        that.set('thetitle','Reportar Problema');                              
        
        var lodging = true;
        var request = false;
        
        var ds = $smart.getFacilities(lodging)
        .done(function(ds) {
            that.set('isLodging', lodging); 
            ds.fetch(function() {
                that.set('roomsDataSource', ds);     
                that.findRoom(idfacility)
                .done(function(facility) {                    
                    that.set('alert.facility', facility);                     
                    that.set('alert.item', {});
                    // Load Item Categories                                                         
                    $smart.getItemCategories(lodging, request, idfacility) 
                    .done(function(itemCategoriesDS) {
                        itemCategoriesDS.fetch(function() {
                            that.set('itemCategoriesDatasource', itemCategoriesDS);  
                            app.mobileApp.navigate('components/reportAlertView/selectItemCategory.html');                                                         
                        })                            
                    })                     
                })
            })                  
        })        
    },
    
        
    
    
    
    // Esto solo aplica para los roles  (Operaciones) que pueden crear tanto tareas de mantenim. como de ama de llaves
    // Esto para indicar que se traiga tasktypes de uno o del otro y tambien para indicar en pantalla mientras crea tarea,
    // para que sepa si la etá creando para uno u otro departamento.
    setModuleForTasks: function(module) {
        app.reportAlertView.moduleSpecific = module;
        if (module == globals.MODULE_HOUSEKEEPING) {
            app.reportAlertView.set('showModule',true);            
            app.reportAlertView.set('modulename', helper.getModuleName(module));
        } else if (module == globals.MODULE_MAINTENANCE) {
            app.reportAlertView.set('showModule',true);            
            app.reportAlertView.set('modulename', helper.getModuleName(module));
        }
    },
    
    // Problema, Solicitud, Lost & Found, Tarea
    selectAlertCategory: function(category) { //module) {
        var that = app.reportAlertView;  
        $("#searchfacility").val("");
           
       // that.setModuleForTasks(module);
        
       // var category = $(e.target).data('category');
        
        //var category = e.touch.target.data().category;      // if touch used
        that.clean();        
        that.set('alert.category.idcategory', category);               
        that.set('alert.category.name', globals.alertCategories[category-1]);                        
        that.set('alert.sent', false); // new alert        
        var isTask = that.get('isTask');
        var isCleaningTask = that.get('isCleaningTask');
        
        if (isTask) { /* CREATE TASK  */
             that.set('alert.idcategory', globals.IS_TASK);
            that.set('thetitle','Crear Tarea');                                  
            /*that.set('task.startdate', new Date());
            that.set('task.hasstarttime', false);*/
            app.mobileApp.navigate('components/reportAlertView/selectWhere.html');         
        }
        else if (isCleaningTask) {
            that.set('thetitle','Tarea de Limpieza');
            that.set('isRequest', false);            
            that.set('isLodging', true); // requests solo aplican a habitaciones
           
            $smart.getAlerTypeCleaningTask()
                    .done(function(result) {                                                
                        app.reportAlertView.set('alert.alertType', result); 
                        app.reportAlertView.selectWhere(true);
                        app.mobileApp.navigate('components/reportAlertView/selectFacility.html');                             
                    }) 
     /*  var ds = $smart.getFacilities(true) // Las solicitudes aplican solo a Habitaciones, no a zonas comunes
            .done(function(ds) {
                ds.fetch(function() {
                    that.set('roomsDataSource',ds); // get rooms only                     
                    var data = that.roomsDataSource.view();
                    // Initialize alert.facility object with first facility from source.         
                    that.set('alert.facility', data[0]); 
                    $smart.getAlerTypeCleaningTask()
                    .done(function(result) {                                                
                        app.reportAlertView.set('alert.alertType', result);       
                        app.mobileApp.navigate('components/reportAlertView/selectFacility.html');                             
                    })                      
                })                
            })*/
            
           that.loadfacilyfast();
            
        }         
        // ISSUES        
        else if (category === globals.ALERT_CATEGORY_ISSUE  ) {
            that.set('thetitle','Reportar problema');                      
            that.set('alert.idcategory', globals.IS_ALERT);
            app.mobileApp.navigate('components/reportAlertView/selectWhere.html');         
         }
        // REQUESTS
        else if (category === globals.ALERT_CATEGORY_REQUEST) {
            that.set('thetitle','Solicitud');
            that.set('isRequest', true);            
            that.set('isLodging', true); // requests solo aplican a habitaciones
            
          /*
           var ds = $smart.getFacilities(true) // Las solicitudes aplican solo a Habitaciones, no a zonas comunes
            .done(function(ds) {
                ds.fetch(function() {
                    that.set('roomsDataSource',ds); // get rooms only                     
                    var data = that.roomsDataSource.view();
                                        
                    
                    // Initialize alert.facility object with first facility from source.         
                    that.set('alert.facility', data[0]); 
                    app.mobileApp.navigate('components/reportAlertView/selectFacility.html');             
                })                
            })*/
            
           that.loadfacilyfast();
            
        }         
        // LOST & FOUND
        else if (category === globals.ALERT_CATEGORY_LOSTANDFOUND) {
            that.set('thetitle','Perdido & Encontrado');            
            app.reportAlertView.set('isLostAndFound',true);            
            $smart.getAlerTypeLostAndFound()
            .done(function(result) {                                                
                app.reportAlertView.set('alert.alertType', result);            
                app.mobileApp.navigate('components/reportAlertView/selectWhere.html');                              
            })            
        }            
    },
    
    
   
    
    // Common Alert Type shortcuts.. Does not consider Lost & Found    
    selectCommonAlertType: function(e) {
        var that = app.reportAlertView; 
        
        return;
        
        var idalerttype = e.dataItem.idalerttype; //  e.data.idalerttype;//e.touch.target.data().type;        
        var category = e.dataItem.idcategory;//e.touch.target.data().category;                        
        
        that.clean();
        that.set('isShortCut', true);
        that.set('alert.category.idcategory', category);    // Problema, Solcitiud
        that.set('alert.category.name', globals.alertCategories[category-1]);                        
        
        $smart.getAlertTypeByID(idalerttype)
        .done(function(alerttype) {                            
            that.set('alert.alertType', alerttype);                                    
            var ds = $smart.getFacilities(true)
            .done(function(ds) {
                ds.fetch(function() {
                    that.set('roomsDataSource',ds); // get rooms only                     
                    var data = that.roomsDataSource.view();                                    
                    that.set('alert.facility', data[0]);                     
                    app.mobileApp.navigate('components/reportAlertView/selectFacility.html');             
               })                
           })
        })            
        
        
    },
    
    selectWhereFacility: function(e) {
        
        app.reportAlertView.selectWhere(true);
    },
    
    selectWhereCommonArea: function(e) {
        app.reportAlertView.selectWhere(false);
    },
    
    
    // Seleccionar entre Habitación ó Área Común    
    selectWhere: function(lodging) {                
        var that = app.reportAlertView; 
      /* 
       var ds = $smart.getFacilities(lodging)
            .done(function(ds) {
                that.set('isLodging', lodging); 
                ds.fetch(function() {
                    that.set('roomsDataSource', ds);                                
                    var data = that.roomsDataSource.view();
                    // Initialize alert.facility object with first facility from source.                             
                    //that.set('alert.facility', data[0]);                 
                    app.mobileApp.navigate('components/reportAlertView/selectFacility.html');  
                                  
                })
            })        
       */
         that.currentWhere =  lodging;
         that.set('isLodging', lodging); 
         $("#searchfacility").val("");  
        
          if(lodging){
             var ds = that.get('roomsDataSource'); 
             if(ds.length == 0){
                  that.loadFacility().done(function() {
                      console.log("00");
                     app.mobileApp.navigate('components/reportAlertView/selectFacility.html');
                  })
             }else{
                 console.log("33");
                     app.mobileApp.navigate('components/reportAlertView/selectFacility.html');
             }
          }else{
             var ds = that.get('commonZonesDataSource'); 
             if(ds.length == 0){
                   that.loadCommonzone().done(function() {
                     app.mobileApp.navigate('components/reportAlertView/selectCommonzone.html');
                   })
             }else{
                     app.mobileApp.navigate('components/reportAlertView/selectCommonzone.html');
             }
          }
    },
    
    loadFacilities: function(){
        var that = app.reportAlertView;    
        var deferred = $.Deferred();
        console.log("entro");
        
        that.loadFacility();
        that.loadCommonzone();
        
        console.log("cargadas");
        return deferred.promise(); 
    },
    
    loadFacility: function(){
        var that = app.reportAlertView;
        var ds = that.get('roomsDataSource'); 
        if(ds.length != 0) return false; 
        
        var deferred = $.Deferred();
        console.log("entro");
        var ds = $smart.getFacilities(true)
            .done(function(ds) {
                
                ds.fetch(function() {
                    that.set('roomsDataSource', ds);   
                    console.log('roomsDataSource');
                    console.log(that.get('roomsDataSource'));
                    
                    deferred.resolve(true);
                })
            });
    
        console.log("cargadas");
        return deferred.promise(); 
    },
    
    loadCommonzone: function(){
        var that = app.reportAlertView;  
        var ds = that.get('commonZonesDataSource'); 
        if(ds.length != 0) return false; 
          
        var deferred = $.Deferred();
        console.log("entro");
        var ds = $smart.getFacilities(false)
            .done(function(ds) {
                
                ds.fetch(function() {
                    that.set('commonZonesDataSource', ds);   
                    console.log(ds);
                    deferred.resolve(true);
                })
            }); 
        console.log("cargadas");
        return deferred.promise(); 
    },
    
    // Navigation from breadcrumb
    goSelectFacility: function() {
        
        app.mobileApp.navigate('components/reportAlertView/selectFacility.html');         
    },
    
     goSelectItemType: function() {
        
        app.mobileApp.navigate('components/reportAlertView/selectItemType.html');    
    },
    
    goSelectAlertCategory: function() {
        
        app.mobileApp.navigate('components/reportAlertView/selectAlertCategory.html');    
    },
    
    
    
    // POR EL MOMENTO, PARA AREAS COMUNES, VAMOS A USAR lAS MISMAS CATEGORIES Y ITEMS QUE PARA HABITACIONES,
    // POR LO TANTO LODGING va a ser TRUE siempre, despues de escoger la zona
    
    selectFacility: function(e) {
        var that = app.reportAlertView;        
        var alertCategory = that.get('alert.category.idcategory');                        
        
        
        that.set('alert.facility',e.dataItem);
                
        //var lodging = that.get('alert.facility.lodging');    
        that.set('isLodging', true); // para que aparezcan categrías..aunque sea lodging false
        
        var lodging = true; // ver comentario arriba
        
        var request = (alertCategory === globals.ALERT_CATEGORY_REQUEST);
        var isCleaningTask = that.get('isCleaningTask');
        console.info('ojoooo'); 
       
        if (that.get('alert.alertType') == null) {
            helper.showError('No hay Tareas de Limpieza....Indicar al administrador!');
            return;
        }
        
        if (isCleaningTask) {
            that.set('isLostAndFound',true);
             that.set('isTask',true);
            app.mobileApp.navigate('components/reportAlertView/createAlert.html');                             
        }
        else if (alertCategory === globals.ALERT_CATEGORY_ISSUE || alertCategory === globals.ALERT_CATEGORY_REQUEST) {                                       
            if (that.get('isShortCut') === false) {                            
                //Initialize Items for search
                 that.set('alert.item', {});               
                                
                
                $smart.getLocations(lodging, request, e.dataItem.idtype) 
                .done(function(locationsDS) {
                    locationsDS.fetch(function() {                                
                        that.set('locationsDatasource', locationsDS);  
                        app.mobileApp.navigate('components/reportAlertView/selectLocation.html');                                                         
                    })                            
                })                     
                    
                
                /*$smart.getItems(lodging, request, null) // get items from all categories (for the search)
                 .done(function(ds) {                                 
                    ds.fetch(function() {                        
                        that.set('itemsDataSource', ds);                                                
                
                         $smart.getItemCategories(lodging, request) 
                         .done(function(itemCategoriesDS) {
                            itemCategoriesDS.fetch(function() {                                
                                that.set('itemCategoriesDatasource', itemCategoriesDS);  
                                app.mobileApp.navigate('components/reportAlertView/selectItemCategory.html');                                                         
                            })                            
                        })                     
                    })
                 })   */            
            }                        
            else {
                // SHORTCUT Common Alert....
                // We need to get itemtype and location (Baño, etc)...summary display pursposes
                // We first call  getItem to make sure the item of the selected facility haven been retrieved already from bACKEND                
                
                
                
                $smart.getItem(that.get('alert.alertType.iditem'))
                .done(function(item) {                        
                    that.set('alert.item.iditem', item.iditem);
                    that.set('alert.item.name', item.name);
                    that.set('alert.itemCategory.iditemcategory', item.iditemcategory);
                    
                    // Ahora la cosa cambia con Locations, porque debemos escoger Location, ya que antes
                    // un item estaba amarrado a un itemType, ahora ya no...y se usan locations en su lugar..
                    
                    
                    $smart.getItemCategories(lodging, request, e.dataItem.idfacility) 
                    .done(function(itemCategoriesDS) {                        
                        itemCategoriesDS.fetch(function() {
                            that.set('itemCategoriesDatasource', itemCategoriesDS);               
                            that.findItemCategory(item.iditemcategory)
                            .done(function(dataItem)  {
                                if (dataItem !== null)  that.set('alert.itemCategory.name', dataItem.name);
                                app.mobileApp.navigate('components/reportAlertView/createAlert.html');                                                         
                            })    
                        });                    
                    });    
                })
            }
                
        }         
                       
        else if (alertCategory === globals.ALERT_CATEGORY_LOSTANDFOUND) { 
            app.mobileApp.navigate('components/reportAlertView/createAlert.html');                 
        }        
    },
    
    
    
    
    facilityChange: function() {        
        app.reportAlertView.facilityChanged = true;
    },
    
     itemTypeChange: function() {        
        app.reportAlertView.itemTypeChanged = true; 
    },
    
    
    // Baño, Servicios, Instalaciones, Muebles, 
    selectLocation: function(e) {                       
        var that = app.reportAlertView;
        that.set('noItem',false);
        var idlocation = e.touch.target.data().id;
                
        // ** Por el momento, isLodging = true para zonas comunes para usar los mismos items y categorias..
        that.set('alert.location.idlocation', idlocation);
        that.set('alert.location.name', e.touch.target.data().name );
                
        helper.pleaseWait(); // In case we need to make api call for on demand request when getting item types.                                        
                
        
        
        $smart.getItems(that.get('isLodging'), that.get('isRequest'), idlocation, that.alert.facility.idtype)
        .done(function(ds) {             
            ds.fetch(function() {                
                that.set('itemsDataSource', ds);                            
                helper.hideLoading();     
                app.mobileApp.navigate('components/reportAlertView/selectItem.html');                                     
            })                
        })                                  
    },
    
    // 1.REVISAR QUE HAYAN ALERT TYPES SIN ITEMS ASOCIADO....
    // 2. Aunque solo haya uno, mostrarlo....
    
     _selectNoItemForTask: function(e) {         
         var that = app.reportAlertView;  
         
         that.set('noItem',true);
         console.info('OMITIR');
         var dsAlertTypes = null;
         $smart.getAlertTypesWithNoItem(that.get('isTask'))
         .done(function(dsAlertTypes) {
             dsAlertTypes.fetch(function() {                        
                 that.set('alertTypesDataSource', dsAlertTypes);   
                 that.set('alert.alertType', dsAlertTypes.view().at(0));                
                 app.mobileApp.navigate('components/reportAlertView/selectAlertType.html');                               
             })                    
         })                      
    },
    
    
    // W/C , Agua, Bañera, etc.
    selectItem: function(e) {                        
        var that = app.reportAlertView;        
        that.set('noItem',false);
        
        var iditem = e.data.iditem; //e.touch.target.data().id;    // iditem
        var name =   e.data.name; //e.touch.target.data().name;                   
        
        that.set('is_zzOtro', name === 'zzOtro');                        
        
        
        that.set('alert.item.name', helper.removeZZ(name));               
        that.set('alert.item.iditem', iditem);       
                        
        var dsAlertTypes = null;
        if (that.get('isRequest') === true) {            
            // Only one alert type per item when is a request...
            $smart.getAlertTypes(iditem, that.get('isTask'))
            .done(function(dsAlertTypes) {
                dsAlertTypes.fetch(function() {                        
                    that.set('alert.alertType', dsAlertTypes.view().at(0));                
                    app.mobileApp.navigate('components/reportAlertView/createAlert.html');                              
                })                    
            })
            
        }
        else { // for Problem, we list all the possible problems...
            $smart.getAlertTypes(iditem, that.get('isTask'))
            .done(function(dsAlertTypes) {
                dsAlertTypes.fetch(function() {
                    if (dsAlertTypes.total() === 0) // This should never happen
                        helper.showDialogMessage('Error','<strong class="c-main4">Falta tipo de alerta para este Item</strong>. <br><br> Solicitar al Administrador agregarla!');                        
                    else if (dsAlertTypes.total() === 1) {
                        that.set('alert.alertType', dsAlertTypes.view().at(0));                                                                
                        app.mobileApp.navigate('components/reportAlertView/createAlert.html');                              
                    }
                    else  {
                        that.set('alertTypesDataSource', dsAlertTypes);                            
                        app.mobileApp.navigate('components/reportAlertView/selectAlertType.html'); 
                    }                
                })                
            })            
        }
    },
    
    
    
    
    // Same as above, but we need to set location (bathroom, etc)
    selectItemThruSearch: function(e) {
        var that = app.reportAlertView;  
        var iditemcategory = that.get('alert.item.iditemcategory') 
        var iditem = that.get('alert.item.iditem') ;
        
        that.set('alert.itemCategory.iditemcategory', iditemcategory );        
        
        that.findItemCategory(iditemcategory)
        .done(function(dataItem)  {
            if (dataItem !== null)
              that.set('alert.itemCategory.name', dataItem.name)      
        })
        
        var dsAlertTypes = null;
         if (that.get('isRequest') === true) {            
            // Only one alert type per item when is a request...
            dsAlertTypes = $smart.getAlertTypes(iditem, that.get('isTask'));    
            dsAlertTypes.fetch(function() {                        
                that.set('alert.alertType', dsAlertTypes.at(0));                
                app.mobileApp.navigate('components/reportAlertView/createAlert.html');                              
            })    
        }
        else { 
            dsAlertTypes = $smart.getAlertTypes(that.get('alert.item.iditem'), that.get('isTask'));    
            dsAlertTypes.fetch(function() {                
                that.set('alertTypesDataSource', dsAlertTypes);                            
                app.mobileApp.navigate('components/reportAlertView/selectAlertType.html');                                     
            })
        }    
    },
    
    
    
    findRoom: function(idfacility) {
        var deferred = $.Deferred();
        
        var that = app.reportAlertView;
        var ds = that.get('roomsDataSource').view();
                 
          for (var i = 0; i < ds.length; i++) {
              var room = ds.at(i);              
              if (room.idfacility === idfacility) {                  
                  return deferred.resolve(room);
              }
          }
            return deferred.resolve(null);        
        
        return deferred.promise();
    },
    
    
    findItem: function(iditem) {
         var deferred = $.Deferred();
        
        var that = app.reportAlertView;
        var ds = that.get('itemsDataSource').view();
                 
          for (var i = 0; i < ds.length; i++) {
              var dataItem = ds.at(i);              
              if (dataItem.iditem === iditem) {                  
                  return deferred.resolve(dataItem);
              }
          }
            return deferred.resolve(null);
        //});       
        
        return deferred.promise();
        
    },
    
    findItemCategory: function(iditemcategory) {
        var deferred = $.Deferred();
        
        var that = app.reportAlertView;
        var ds = that.get('itemCategoriesDatasource').view();
  
        
       // ds.fetch(function(){            
          for (var i = 0; i < ds.length; i++) {
              var dataItem = ds.at(i);              
              if (dataItem.iditemcategory === iditemcategory) {                  
                  return deferred.resolve(dataItem);
              }
          }
            return deferred.resolve(null);
        //});       
        
        return deferred.promise();
    },
    
    
    
    findAlertType: function(idalerttype) {
         var deferred = $.Deferred();
        
        var that = app.reportAlertView;
        var ds = that.get('alertTypesDataSource').view();
        var notfound = true;

        for (var i = 0; i < ds.length; i++) {
              var dataItem = ds.at(i);                            
              if (dataItem.idalerttype === idalerttype) {                  
                  return deferred.resolve(dataItem);
              }
         }
         if (notfound) return deferred.resolve(null);
                 
        return deferred.promise();
    },
    
   
   
    
    
    
    selectAlertType: function(e) {        
        var that = app.reportAlertView;                
        
        var id = e.dataItem.idalerttype;
        
        that.findAlertType(id)
        .done(function(alertType) {            
            that.set('alert.alertType', alertType);                                    
            app.mobileApp.navigate('components/reportAlertView/createAlert.html');  
            
        })
    },
    
    
    
       
    
    toggleReportadoPorHuesped: function(e) {
        $("#byguestcheckbox").prop('checked', !$("#byguestcheckbox").is(':checked'));
    },
    
    
  
    
    toggleByhousekeeper: function(e) {
        $("#byhousekeepercheckbox").prop('checked', !$("#byhousekeepercheckbox").is(':checked'));
    },
    
    
    
    toggleStartTaskNow: function(e) {
        var isChecked = $("#starttasknow").is(':checked');
        
        $("#starttasknow").prop('checked', !isChecked);
        if (!isChecked) 
            $("#taskfinished").prop('checked',false);        
        
    },
    
    toggleTaskFinished: function(e) {
        var isChecked = $("#taskfinished").is(':checked');
        
        $("#taskfinished").prop('checked', isChecked);
        if (!isChecked) 
            $("#starttasknow").prop('checked',false);
        
    },
    
    
    
    isReportedByGuest: function() {
        return $("#byguestcheckbox").is(':checked') ? 1 : 0;
    },
    
    
    takeAlert: function() {
        return (app.reportAlertView.alert.takeAlert == true);
    },
    
    isByHousekeeper: function() {
        return (app.reportAlertView.alert.byHousekeeper == true);
    },
    
    
    showCreateAlertSettings: function(e) {
        app.mobileApp.navigate('components/reportAlertView/createAlertSettings.html');                        
    },
    
    
    toggleTakeAlert: function(e) {
        app.reportAlertView.alert.takeAlert = !app.reportAlertView.alert.takeAlert;
        app.reportAlertView.resetAlertOptions();
        
        if (app.reportAlertView.alert.takeAlert == true) {             
             app.reportAlertView.alert.takeAlertAndStart = false;
             app.reportAlertView.alert.reportDone = false;
             app.reportAlertView.alert.byHousekeeper = false;  
            
            $("#optionTakeAlert").css('background-color', "#E52E86");
            $("#optionTakeAlert *").css('color', "white");            
        }
        else {
            $("#optionTakeAlert").css('background-color', "#fcfcfc");
            $("#optionTakeAlert *").css('color', "black");            
            
        }
    },
    
    
    toggleTakeAlertAndStart: function(e) {
        app.reportAlertView.alert.takeAlertAndStart = !app.reportAlertView.alert.takeAlertAndStart;
        app.reportAlertView.resetAlertOptions();
        
        if (app.reportAlertView.alert.takeAlertAndStart == true) {
             app.reportAlertView.alert.takeAlert = false;             
             app.reportAlertView.alert.reportDone = false;
             app.reportAlertView.alert.byHousekeeper = false;  
            
            $("#optionTakeAlertAndStart").css('background-color', "#E52E86");
            $("#optionTakeAlertAndStart *").css('color', "white");            
        }
        else {
            $("#optionTakeAlertAndStart").css('background-color', "#fcfcfc");
            $("#optionTakeAlertAndStart *").css('color', "black");            
            
        }
    },
    
    
    toggleReportDone: function(e) {
         app.reportAlertView.alert.reportDone = !app.reportAlertView.alert.reportDone;
        app.reportAlertView.resetAlertOptions();
        
        if (app.reportAlertView.alert.reportDone == true) {
             app.reportAlertView.alert.takeAlert = false;
             app.reportAlertView.alert.takeAlertAndStart = false;         
             app.reportAlertView.alert.byHousekeeper = false;  
            $("#optionReportDone").css('background-color', "#E52E86");
            $("#optionReportDone *").css('color', "white");            
        }
        else {
            $("#optionReportDone").css('background-color', "#fcfcfc");
            $("#optionReportDone *").css('color', "black");            
            
        }
        
    },
    
     toggleByHousekeeper: function(e) {
         app.reportAlertView.alert.byHousekeeper = !app.reportAlertView.alert.byHousekeeper;
        app.reportAlertView.resetAlertOptions();
        
        if (app.reportAlertView.alert.byHousekeeper == true) {
             app.reportAlertView.alert.takeAlert = false;
             app.reportAlertView.alert.takeAlertAndStart = false;
             app.reportAlertView.alert.reportDone = false;         
            $("#optionByHousekeeper").css('background-color', "#E52E86");
            $("#optionByHousekeeper *").css('color', "white");            
        }
        else {
            $("#optionByHousekeeper").css('background-color', "#fcfcfc");
            $("#optionByHousekeeper *").css('color', "black");            
            
        }
        
    },
    
    resetAlertOptions: function(e) {
        $("#optionTakeAlert").css('background-color', "#fcfcfc");
        $("#optionTakeAlert *").css('color', "black");     
        
        $("#optionTakeAlertAndStart").css('background-color', "#fcfcfc");
        $("#optionTakeAlertAndStart *").css('color', "black");     
        
        $("#optionReportDone").css('background-color', "#fcfcfc");
        $("#optionReportDone *").css('color', "black");     
        
        $("#optionByHousekeeper").css('background-color', "#fcfcfc");
        $("#optionByHousekeeper *").css('color', "black");     
        
    },
    
    
    
    /********************/
    /*  CREATE ALERT    */
    /********************/
    
     createAlert: function() {      
         var that = app.reportAlertView;         
         var idcategory = (that.isTask == true ? 2 : 1);
         
         if (that.isTask == true)
            helper.showDialogYN('¿Está seguro que desea crear Tarea?', function() {that.goCreateAlert()});
         else
            helper.showDialogYN('¿Está seguro que desea reportar Alerta?', function() {that.goCreateAlert()});
         
        
    },
    
    
    goCreateAlert: function(e) {                        
        var that = app.reportAlertView;                                
        
        if (that.get('alert.alertType.idcategory') === globals.ALERT_CATEGORY_LOSTANDFOUND) {
            if (that.get('hasPicture') === false && that.get('alert.notes') === "") {
                alert('Indicar comentario o foto!');
                return;
            }
        }
       
        $("#alertComment").blur();               
        // Disable button to avoid multiple sends
        $("#btnCreateAlert").prop( "disabled", true );                
        
       if (that.takeAlert()) 
            that.set('alert.idstaff',app.user.idstaff);
        
        
        // Send photo to backendervices .
        // FOR OFFLINE, We postpone this...
        
        if (that.get('hasPicture')) {            
            
            that._createAlert(that.get('pictures'));
            
            /*everliveController.sendPicture(that.get('picture'))
            .done(function(uri) {                            
                that._createAlert(uri);
            }) */
        }
        else
            that._createAlert(null);
        
    },
    
    
  
    
    _createAlert: function(pictures) {  // antes era imageUri
        var that = app.reportAlertView;                        
        
        // If there is no alertType associated, ex: common zone with not alert type...
        var hasAlertType =  that.get('alert.alertType.idalerttype') === null ? false : true;
        var priority  = hasAlertType ? that.get('alert.alertType.idpriority') : 2;
                
        
        var name = that.setAlertName();
        that.set('alert.name',name);
        
        console.log('CREATE ALERT');
                
        
        var idcategory = (that.isTask == true ? 2 : 1);
        
         if ( that.isTask && (app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_MAID))
             that.set('alert.idstaff',app.user.idstaff);
        
         if (that.alert.alertType.name == "Otro" && (that.alert.notes == "" || typeof that.alert.notes == 'undefined')
            && that.alert.category.idcategory == 1)
        {
            $("#btnCreateAlert").prop( "disabled", false);                            
             helper.showDialogMessage("Instrucciones Requeridas", "Por favor explique el problema!");
            return;
        }
        
        helper.showLoading('Creando alerta...');
                        
        var _alert = that.get('alert');        
        var tag = that.getTag();
        
        _alert.action = globals.ACTION_REPORTED;  
        _alert.idstatus = globals.ALERT_STATUS_PENDING;  
        _alert.tag     = tag;
                
        if (tag == globals.TAG_ALREADY_DONE) {
            _alert.idstaff  = app.user.idstaff;
            _alert.idstatus = globals.ALERT_STATUS_RESOLVED;
            _alert.startdate = $date.timestampUTC();
            _alert.finishdate = $date.timestampUTC();         
            _alert.action     = globals.ACTION_RESOLVED;
        }
        
        if (_alert.takeAlertAndStart == true) {
            _alert.idstaff  = app.user.idstaff;
            _alert.idstatus  = globals.ALERT_STATUS_IN_PROGRESS;  
            _alert.startdate = $date.timestampUTC();
            _alert.action    = globals.ACTION_STARTED;
        }
        
        if (that.isTask) {
            console.info('fecha...');
            console.info(_alert.startdate);
            if (typeof _alert.startdate == 'undefined') {                
                 _alert.startdate = $date.timestampUTC();
                _alert.finishdate = moment().add(  moment().utcOffset() * (-1),'minutes').add(  _alert.alertType.expectedduration,'minutes').utc().valueOf();  //$date.timestampUTC();
             } 
            else {
                var sd = _alert.startdate
                _alert.startdate = $date.toUTC(sd);
                _alert.finishdate = $date.toUTC2(sd).add(_alert.alertType.expectedduration,'minutes').utc().valueOf();
                console.info(_alert.startdate);
                console.info(_alert.finishdate);
                
             }                        
        }
        
        
        console.info('CREATING ALERT');
        console.info(_alert);     
        
        var idchecklist = (hasAlertType == true ?  _alert.alertType.idchecklist : null);
        
        console.info('Checklist ' + idchecklist);
        
        
        // Creates alets locally
        $smart.createAlert({                        
            idalert       : globals.MAX_INT,      
            uuid          : helper.guid(),
            insync        : false,
            byhousekeeper : that.isByHousekeeper(),
            byguest       : that.isReportedByGuest(),            
            idhotel       : app.hotel.idhotel,      
            iscleaningtask : that.isCleaningTask,
            idcategory    : idcategory,
            idtypecategory: _alert.alertType.idcategory,
            idchecklist   : idchecklist,
            name          : name,
            idstaff       : _alert.idstaff,
            idmodule      : _alert.alertType.idmodule,
            idtype        : _alert.alertType.idalerttype,
            idtypename    : _alert.alertType.name,
            iditem        : _alert.item.iditem,
            iditemname    : _alert.item.name,
            idlocation    : _alert.location.idlocation,
            idpriority    : priority,
            idstatus      : _alert.idstatus,
            idfacility    : _alert.facility.idfacility,
            notes         : _alert.notes,
            pictures      : pictures,
            tag           : tag,
            action        : _alert.action,
            reporteddate  : $date.timestampUTC(),
            startdate     : _alert.startdate,
            finishdate    : _alert.finishdate,
            resumedate    : 0,
            willcheckdate : 0,
            reportedby    : app.user.idstaff,            
            assignedby    : _alert.assignedby,
            expectedduration : _alert.alertType.expectedduration
        })               
        .done(function() {                      
            helper.hideLoading();
            //that.set('alert.idalert',idalert);
            app.sounds.ding.play();       
            $smart.resumeSyncWorker();
            app.homeView.reloadAlerts(1); // ya lo hace syncToServerAlertsNow
           
            if (that.isTask)
                app.mobileApp.navigate('components/reportAlertView/createTaskSuccess.html');  
            else
                app.mobileApp.navigate('components/reportAlertView/createAlertSuccess.html');  
            
             setTimeout(function() {                                        
                 $smart.syncToServerAlertsNow()
                 .done(function() {                    
                     app.idle = true;
                     //$smart.sendNotifications()
                   /*  $smart.saveAlertCreatedToHistory(_alert)
                     .done(function() {
                         console.info('Saved to History');
                     })
                    */ 
                 })                
             },100);
            
            //that.sendPushNotificationAlertCreated(that.get('alert'));            
            
            // Si el usuario es housekeeper or maintenancechief, y crearon una alerta para su propio departamento,
            // actualizar el home, para que ésta aparece..
            // Para eso solo seteamos  that.justLoggedIn = true, para que se ejecute el beforeShow del home            
            
            //app.homeView.justLoggedIn = true;
            
            
        })
        .fail(function(error) {
            app.idle = true;
            if (error !== 0)
               helper.showAlert(error,'Error')  ;
            //helper.hideWorking();
           helper.hideLoading();
        })
        
       //that.goHomeNoTransition();
        
    },
    
    
      getTag: function() {
        if (app.reportAlertView.alert.takeAlert == true) return globals.TAG_TAKEN;
        if (app.reportAlertView.alert.takeAlertAndStart == true) return globals.TAG_TAKEN;
        if (app.reportAlertView.alert.reportDone == true) return globals.TAG_ALREADY_DONE;
        return 0;
        
    },
    
      // Based on the alert type, we grab the module to determine if it needs to be sent to the housekeeper or maintenancechief
    sendPushNotificationAlertCreated: function(_alert) {
                        
        // Nombre de quien reporta.
        var quienReporta = app.user.fullname.split(" ")[0];
        
        var module = _alert.alertType.idmodule || globals.MODULE_MAINTENANCE ;        
        var title = quienReporta + " dice: ";
        var message =  helper.shortenHabitacion(_alert.facility.name) + " . " + _alert.name;                        
                
        var remind = 1; 
        // Si la alerta ya fue asignanda, no enviar al manager con reminder, enviar sin reminder.
        if (_alert.idstaff !== 0)
            remind = 0;
        
        // Si la alerta la está creando el Jefe de Mantenimiento o la Ama de Llaves,
        // no ocupamos que la notificación sea reenviada (remind = 0)..simplemente se envía a los otros chiefs..
        if ((app.user.role === globals.ROLE_MAINTENANCECHIEF && module === globals.MODULE_MAINTENANCE) ||            
            (app.user.role === globals.ROLE_HOUSEKEEPER && module === globals.MODULE_HOUSEKEEPER) ||
             app.user.role === globals.OPERATIONS)
            remind = 0;
        
        var chiefs      = helper.getModuleChiefs(module);
        for (var j=0;j<chiefs.length; j++)
            $smart.sendPushNotificationWithReminder(remind, globals.ACTIVITY_ALERT, _alert.idalert, title,chiefs[j],
                message, {type: globals.IS_ALERT, idalert: _alert.idalert, sound: globals.SOUND_ALERT_DING });
        
        
        // Si la alerta fue asignada de una vez ....solo notificar a la persona a quién se le asignó
        // Si fue tomada, no es necesario notificar a la misma persona
        if (_alert.idstaff !== 0 && _alert.idstaff !== app.user.idstaff) {
             $smart.sendPushNotificationWithReminder(1, globals.ACTIVITY_ALERT, _alert.idalert, title,_alert.idstaff,
                message, {type: globals.IS_ALERT, idalert: _alert.idalert, sound: globals.SOUND_ALERT_DING });            
            
        }
        else {        
            // send to all module staff members...maintenance or maids..ONLY IF COLLABORATIVE = TRUE;
            // if alert was created by role manager, we don´t send to all staff members, just chiefs and operations
            if (app.hotel.collaborative == 1) { 
                if (app.user.role != globals.MANAGER) {
                    var staff = helper.getModuleStaff(module);
                     for (var k=0;k<staff.length; k++)
                        $smart.sendPushNotification(title,staff[k], message, 
                            {type: globals.IS_ALERT, idalert: _alert.idalert, sound: globals.SOUND_ALERT_DING });            
                 }
             }
        }
        
        // Send to managers..
         var managers = helper.getManagers();            
         for(var i=0; i < managers.length; i++) {                    
             $smart.sendPushNotification(title, managers[i], message,
                     {type: globals.IS_ALERT, idalert: _alert.idalert, sound: globals.SOUND_ALERT_DING });            
         }            
        
   },
    
    
    
   
    setAlertName: function() {        
        var _alert = app.reportAlertView.get('alert');      
        
        if (_alert.alertType.iscleaningtask == 1)
            return _alert.alertType.name;
        
        if (_alert.alertType.idcategory === globals.ALERT_CATEGORY_LOSTANDFOUND)
            if (_alert.notes === "")
                return "Perdido & Encontrado";
            else
                return _alert.notes;
        
        
        if (_alert.item.iditem === null)  // Common Zone selected
            if (_alert.notes === "")
                return _alert.facility.name;
            else
                return _alert.notes;
        
        if (_alert.alertType.name.toLowerCase() !== 'otro')
            return _alert.alertType.name;
        else
            if (_alert.notes !== '') {
                if (app.reportAlertView.get('is_zzOtro') === true)
                    return _alert.location.name + ': ' + _alert.notes;
                else
                    return _alert.item.name + ' : ' + _alert.notes;                                   
            }
            else {               
                if (app.reportAlertView.get('is_zzOtro') === true)
                    return _alert.location.name;
                else
                    return _alert.item.name;
            }        
    },
    
    setTaskName: function() {        
        var _task = app.reportAlertView.get('task');        
        
        if (_task.taskType.name == "General")  
            if (typeof _task.item.iditem == 'undefined')
                return _task.instructions;   
            else
                return _task.item.name + ": " + _task.instructions;   
       
        else
            if (typeof _task.item.iditem == 'undefined')
                return _task.taskType.name;
             else
                return _task.item.name + " : " + _task.taskType.name;
        
        /*if (_task.taskType.name.toLowerCase() !== 'otro')
            return _task.taskType.name;
        else
            if (_task.instructions !== '') {
                if (app.reportAlertView.get('is_zzOtro') === true)
                    return _task.itemCategory.name + ': ' + _task.instructions;
                else
                    return _task.item.name + ': ' + _task.instructions;                                   
            }
            else {               
                if (app.reportAlertView.get('is_zzOtro') === true)
                    return _task.itemCategory.name;
                else
                    return _task.item.name;
            }
        */
        
    },
    
    
    
    createTask: function(e) {        
        var that = app.reportAlertView;                                
        
       
        $("#taskComment").blur();                
        // Disable button to avoid multiple sends
        $("#btnCreateTask").prop( "disabled", true );                
        
        
        
       if (app.user.role === globals.ROLE_MAINTENANCE || app.user.role === globals.ROLE_MAID)
           that.set('alert.idstaff',app.user.idstaff);
        
        // Send photo to backendervices
        if (that.get('hasPicture')) {
            // Candidato a ser manejado por worker...??
            everliveController.sendPicture(that.get('picture'))
            .done(function(uri) {                            
                that._createTask(uri);
            })
        }
        else
            that._createTask('');
    },
    
    
    _createTask: function(imageUri) {
        var that = app.reportAlertView;        
                
        var name = that.setTaskName();
        that.set('task.name',name);
        
        $("#taskComment").blur();
        
        if (that.task.taskType.name == "General" && (that.task.instructions == "" || typeof that.task.instructions == 'undefined')) {
            $("#btnCreateTask").prop( "disabled", false);                            
             helper.showDialogMessage("Instrucciones Requeridas", "Por favor explique la tarea!");
            return;
        }
        
        var startNow = $("#starttasknow").prop('checked') ? 1 : 0;        
        if (startNow == 1)  {         
            if (that.get('task.idstaff') == 0) {
                helper.showDialogMessage("Asignar", "Debe asignar tarea si desea comenzarla ya!");
                return;
            }           
        }
        
         if (that.createFromAlert == true)
            imageUri = that.task.uris;
            
            
        
        
        helper.showLoading('Creando tarea...');
        
        // Merge Start Date and Time
        var startDate = moment(that.get('task.startdate'));
        /*
        
        if (that.get('task.hasstarttime')) {
            that.set('task.hasstarttime', 1);
            var startTime = moment(that.task.starttime, "HH:mm a");            
            startDate.hour(startTime.hour());
            startDate.minute(startTime.minute());            
        }          
        else*/
            that.set('task.hasstarttime', 0);
        
        that.set('task.start', $date.toUTC(startDate));
        if (startNow == 1) 
            that.set('task.start', $date.toUTC(new Date()));  // TODAY if starting now
        
        if (that.get('canAssign') == false)
            that.set('task.idstaff', app.user.idstaff);
        
        
       
        
                
            // Create Task
        $smart.createTask({
            createdby     : app.user.idstaff,            
            createddate   : $date.timestamp(),
            start         : that.get('task.start'),
            hasstarttime  : that.get('task.hasstarttime'),
            name          : that.get('task.name'),
            instructions  : that.get('task.instructions'),
            idtype        : that.get('task.taskType.idtasktype'),
            idstaff       : that.get('task.idstaff'),
            idpriority    : 2,
            idfacility    : that.get('task.facility.idfacility'),
            uris          : imageUri,
            startnow      : startNow,
            finished      : $("#taskfinished").prop('checked') ? 1 : 0,                   
            idalert       : that.get('alert.idalert')    // When creating task from Alert               
        })
        .done(function(result) {                                                                                 
            helper.hideLoading();
            that.set('task.idtask', result.idtask);
            if (that.get('task.idstaff') !== 0 || that.get('task.idstaff') !== app.user.idstaff) {  // if assigned                                
                if (that.get('task.start') < $date.tomorrowNoUTCOffset()) { // Do not send push if future task                    
                    helper.sendPushNotificationTask(that.get('task'), globals.PN_TASK_ASSIGNED);                
                }
            }
            app.sounds.ding.play();
            
            if (that.createFromAlert == true)
                app.homeView.markAlertAsTaskCreated(result.idtask);
            else
                
            app.mobileApp.navigate('components/reportAlertView/createTaskSuccess.html');              
            app.homeView.justLoggedIn = true;
            
            
            /*that.refreshTasks()
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
            })*/
        })
        .fail(function(error) {  
            helper.hideLoading();
           if (error !== null) 
               $smart.showMessageDialog("<i class='mdi mdi-information-outline'></i> " + error);
        })
        
    },
    
   
    ///    
    selectPicture: function() {
        app.reportAlertView.goPicture(navigator.camera.PictureSourceType.PHOTOLIBRARY);        
    },
    
    takePicture: function() {
        app.reportAlertView.goPicture(navigator.camera.PictureSourceType.CAMERA);        
    },
    
    goPicture: function(source) {                        
        everliveController.takePicture(source)
        .done(function(data) {                  
            var pictures = app.reportAlertView.get('pictures');            
            
            pictures.push(data);
            
            //console.info(pictures);
            
            app.reportAlertView.set('pictures', pictures);
            /*app.reportAlertView.set('picture',data);
            
            image = document.getElementById("imgAlert"); 
            image.src = "data:image/jpeg;base64," + data;  
            */
            app.reportAlertView.set('hasPicture', true);
        })
        /*.done(function(uri){
            app.reportAlertView.get('alert.uris').unshift(uri);
        })*/
        .fail(function(error) {
           //helper.showAlert(error,'No se agregó imagen!');       
        })
    },
    
    
    deletePicture: function(e) {
        var pictures = app.reportAlertView.get('pictures');        
        var picture = e.touch.target.data().picture;  
        
        pictures.splice(pictures.indexOf(picture),1);        
        
        app.reportAlertView.set('pictures', pictures);
        
        if (pictures.length == 0) {
            app.reportAlertView.set('hasPicture', false);
            app.reportAlertView.myscroller.reset();
        }
        
    },
    
    
    deletePictureOLD: function(e) {        
        
        
        
        app.reportAlertView.set('hasPicture', false);
        app.reportAlertView.set('picture',null);
        var image = null;
        if (app.reportAlertView.isTask)
            image = document.getElementById("imgTask"); 
        else
            image = document.getElementById("imgAlert"); 
        image.src = "";   
        
        /*var uris = app.reportAlertView.get('alert.uris');        
        var uri = e.touch.target.data().uri;                  
        uris.splice(uris.indexOf(uri),1);        */
        
        app.reportAlertView.myscroller.reset();
        
        //app.reportAlertView.set('alert.uris', uris);
        
        
    },
    
    
    loadfacilyfast : function(){
        var that = app.reportAlertView;  
        var ds = that.get('roomsDataSource');  
        that.currentWhere =  true;
        if(ds.length == 0) 
           var ds = $smart.getFacilities(true)
            .done(function(ds) {
                ds.fetch(function() {
                    that.set('roomsDataSource', ds);   
                    console.log(ds);
                    $("#searchfacility").val(""); 
                    app.mobileApp.navigate('components/reportAlertView/selectFacility.html');
                })
            }) 
        else {
            // that.applyFacilityFilterToDatasourceAll(true);
            // that.selectWhere(true);
             $("#searchfacility").val("");   
             app.mobileApp.navigate('components/reportAlertView/selectFacility.html');
        }
    }
    
});

// START_CUSTOM_CODE_settingsView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    
    app.reportAlertView.set('title', loc.t('Reportar Alerta'));
    
    
    
    
})();
// END_CUSTOM_CODE_settingsView



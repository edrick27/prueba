// Matthias Malek
// SuisseWorks
// Dic, 2015
// Controller for handling Login data (locally and remotely)
// This controller interfaces with RestAPI and LocalDB.
// Smart should not talk directly to RestAPI and LocalDB

(function(window) {
    
    function LoginController() {
    
        var _forceLOGIN = false;            
        var _DEBUG      = false;        
        
        var offlinelogin = false;  // set to true if login was accepted but app is offline        
        
        var log = function(msg) {
            if (_DEBUG) console.log(msg);
        }
        
                
        this.isLoggedIn = function() {
            var deferred = new $.Deferred();
            this.offlinelogin = false;
                       
            
            if (_forceLOGIN) {         
                deferred.resolve(false) }
            else {            
                var username = localStorage.getItem("dingdone:username");
                var password = localStorage.getItem("dingdone:password");    
                
                log('IsLoggedIn?? ' + username );
                
                if (username === null || password === null) 
                    deferred.resolve(false);     
                else {
                    initUserAndHotelOffline();
                    
                    if (app.justupdated == true) // new version just installed...
                        deferred.resolve(false);
                   
                    var fullsyncOK = localStorage.getItem("dingdone:fullsync");
                    if (fullsyncOK === "true")                    
                        deferred.resolve(true);
                    else
                        deferred.resolve(false);
                   
                }                                  
            }
            return deferred.promise();            
        }
        
        
        this.login = function(code, username, password, silent) {
            var deferred = $.Deferred();                              
            var condition = {username: username, password: password, silent: silent, appversion: app.version,
                uuid: device.uuid, platform: device.platform, model: device.model, version: device.version};
            
            $api.login(condition)    
            .done(function(data) {      
                if (data.result == 4) // Force Login
                    deferred.resolve(globals.FORCE_LOGIN);
                else {
                    $localdb.saveToLocalStorage(username,password,data);         
                    console.info('LOGIN DATA',data);
                    app.changepassword = data.changepassword; // 1 => need to change password
                    app.user.username = username; // not included in data            
                    app.user.iddeviceinfo = data.iddeviceinfo;                    
                    
                    app.version_latest = data.version;
                    if (data.version == null)
                        app.newversion = false;
                    else
                        app.newversion =  (parseInt(app.version_latest.replaceAll('.','')) > 
                                        parseInt(app.version.replaceAll('.','')));                 
                    app.user.insync = true;
                    app.user.dofullsync = data.dofullsync;
                    initUserAndHotel(data);                
                    $('#hotelname').html(data.hotelname);
                    deferred.resolve(globals.LOGIN_SUCCESS);                
                }
            })
             .fail(function(error) {                                                                                                
                 deferred.reject(error);
            });                        
            return deferred.promise();            
        }
        
        
    
        this.logout = function() {
            $localdb.cleanLocalStorage();
            app.mobileApp.navigate('components/loginView/view.html', "none"); // no transition
        }
        
        
        ///// PRIVATE ///////
          
        initUserAndHotel = function(data) {            
            app.user.idstaff      = data.idstaff;
            app.user.fullname     = data.fullname;
            app.user.idmodule     = data.idmodule;
            app.user.iddepartment = data.iddepartment;
            app.user.visibility   = data.visibility;
            app.user.role         = data.userrole;
            app.user.available    = (data.available == 1);
            
            app.user.currentactivitytype = data.currentactivitytype;
            app.user.currentactivityid   = data.currentactivityid;
            //app.user.stafftype   = data.stafftype;    
            app.user.avatar      = data.useravatar;
            //app.user.managername = data.managername;   
            app.user.filterpreferences = JSON.parse(data.filterpreferences);
            app.user.preferences = JSON.parse(data.preferences);
            
            app.hotel.idhotel        = data.idhotel;
            app.hotel.name           = data.hotelname;
            app.hotel.idcategory     = data.idcategory;
            app.hotel.collaborative = data.collaborative;
            app.hotel.onlyfreealerts = data.onlyfreealerts;
            app.hotel.app_max_alerts = data.app_max_alerts;
            
            
            app.version_latest   = data.version;
            app.url_android      = data.url_android;
            app.url_ios          = data.url_ios;
            

            localStorage.setItem("onlyfreealerts", data.onlyfreealerts);
            localStorage.setItem("userrole", data.userrole);
            localStorage.setItem("limit", data.app_max_alerts);
            if(app.user.filterpreferences != null){
                console.log("no es null");
                if(app.user.filterpreferences['appmaxalerts'] > 0){
                    localStorage.setItem("app_max_alerts", app.user.filterpreferences['appmaxalerts'] );
                    console.log("entro");
                }else{
                    localStorage.setItem("app_max_alerts", data.app_max_alerts);
                     console.log("no entro");
                }
            }else{
                localStorage.setItem("app_max_alerts", data.app_max_alerts);
            }
        }
        
        initUserAndHotelOffline = function() {
            app.user.idstaff   = parseInt(localStorage.getItem("dingdone:idstaff"));
            app.user.available = (localStorage.getItem("dingdone:available") == "true");
            
            app.user.insync = (localStorage.getItem("dingdone:available") == "true");
            
            app.user.fullname  = localStorage.getItem("dingdone:fullname");
            app.user.idmodule  = parseInt(localStorage.getItem("dingdone:idmodule"));
            app.user.iddepartment  = parseInt(localStorage.getItem("dingdone:iddepartment"));
            app.user.visibility  = parseInt(localStorage.getItem("dingdone:visibility"));
            app.user.role      = parseInt(localStorage.getItem("dingdone:role"));
            //app.user.staffType = localStorage.getItem("smarthotel:stafftype");
            app.user.avatar    = localStorage.getItem("dingdone:avatar");
            if (app.user.avatar == "null")
                app.user.avatar = "resources/imgs/misc/avatarunknown.png";
            
            app.user.filterpreferences = JSON.parse(localStorage.getItem("dingdone:filterpreferences"));
            app.user.preferences = JSON.parse(localStorage.getItem("dingdone:preferences"));
            
            app.hotel.idhotel  = parseInt(localStorage.getItem("dingdone:idhotel"));
            app.hotel.name             = localStorage.getItem("dingdone:hotelname");
            app.hotel.name             = localStorage.getItem("dingdone:hotelname");
            app.hotel.onlyfreealerts   = localStorage.getItem("dingdone:onlyfreealerts");
            app.hotel.app_max_alerts   = localStorage.getItem("dingdone:app_max_alerts");
            app.hotel.collaborative    = parseInt(localStorage.getItem("dingdone:collaborative"));
            
        }
        
        
        
    
    }
    
    window.LoginController = LoginController;
    
}) (window)
var loginController = new LoginController();


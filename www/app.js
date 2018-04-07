 'use strict';

(function() {
    var app = {
        data: {},
        idle: true  // for interacting with workers
    };

    var bootstrap = function() {                        
        $(function() {
            // These tries to solve the issues with no reliable clicks/tabs
            //http://www.telerik.com/forums/click-event-does-not-fire-reliably
            kendo.UserEvents.defaultThreshold(kendo.support.mobileOS.device === 'android' ? 0 : 20);
            
            app.mobileApp = new kendo.mobile.Application(document.body, {
               // useNativeScrolling: false,
                transition: 'none',
                skin: 'flat',
                //skin: 'nova',
                
               
              /*platform: {
                name: "ios",
                majorVersion: 9 // Major OS version - may be set to 6 or removed for the skeuomorphism look.
            },*/
                
                initial: 'components/loginView/view.html'
            });
        });
    };
    
    
    

     window.addEventListener('error', function (e) {
                         
         // Da al hacer un group de un datasource...
        /*if (e.message == "Uncaught TypeError: Cannot read property 'length' of undefined") return true; */
        e.preventDefault();      
         if (app.ignoreErrors) return;
        console.info(e); 
         
        var message = e.message + "' from " + e.filename + ":" + e.lineno;
        helper.showAlert(message, 'Error occured');
        return true;        
    });
    
    
  
          

    if (window.cordova) {
        document.addEventListener('deviceready', function() {
                       
            document.addEventListener("backbutton", onBackKeyDown, false);
            
             /* var opts = {
                apikey: '3ifwh-6ug3QZ3xF2HX',
              };
            //https://dashboard.bit6.com/#/login  with hello@dinganddone.com
              app.b6 = new bit6.Client(opts);
             */
            
            
            document.addEventListener("online", app.onOnline, false);                  
            document.addEventListener("offline", app.onOffline, false);     
            app.checkConnection();

            var element = document.getElementById('appDrawer');
            if (typeof(element) !== 'undefined' && element !== null) {
                if (window.navigator.msPointerEnabled) {
                    $('#navigation-container').on('MSPointerDown', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $('#navigation-container').on('touchstart', 'a', function(event) {
                        app.keepActiveState($(this));
                    });
                }
            }
            
            // Fix some error....
            /*
            if (navigator.simulator) {
                cordova.require('cordova/android/nativeapiprovider')
                .get()
                .retrieveJsMessages = function () {};
                }
            */
            
            
            app.loadAppSettings(function(){
                
                loc.loadLanguage()
                .done(function(loaded) {
                
                    console.log('Language Loaded: ' + loaded);                     
                    $localdb.db.onReady(function() { // Database ready                                               
                        
                        helper.prepareGlobals()
                        .done(function() { 
                        
                            $smart.isLoggedIn()    // Check if already logged in
                            .done(function(loggedIn) {                                                                                                                           
                        
                                bootstrap();         
                                 if (navigator && navigator.splashscreen) {
                                    navigator.splashscreen.hide();
                                }
                                if (loggedIn) {                                                                           
                                    app.navigateHome();                                 
                                    
                                }
                               
                            })
                            .fail(function(error) {                                
                                 bootstrap();           
                            })
                       })
                    });                                              
                    loc.translate(); // translates initial view
               });   
            });     
            
            
           
             
            
            
            
            
        }, false);
    } else {
      // Code should never get here  
        alert('ERROR: Window.cordova is NULL');
      //  bootstrap(); 
    }
    
   
    function onBackKeyDown() {}

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $('#navigation-container li a.active').removeClass('active');
        currentItem.addClass('active');
    };
    
   

    // Init sounds
    app.sounds = {};
    
    app.sounds.bell = new buzz.sound( "resources/sound/sounds/bell_ring", {
                    formats: [ "ogg", "mp3", "aac" ]
    });
    
    app.sounds.snap = new buzz.sound( "resources/sound/sounds/snap", {
                    formats: [ "ogg", "mp3"]
    });
    
    app.sounds.error = new buzz.sound( "resources/sound/sounds/error", {
                    formats: [ "ogg", "mp3", "aac" ]
    });
    
    app.sounds.glass = new buzz.sound( "resources/sound/sounds/glass", {
                    formats: [ "ogg", "mp3", "aac" ]
    });
    
    app.sounds.alert = new buzz.sound( "resources/sound/sounds/alert", {
                    formats: ["ogg", "mp3" ]
    });
    
    app.sounds.ding = new buzz.sound( "resources/sound/sounds/ding", {
                    formats: ["ogg", "mp3" ]
    });
    
    
   
    app.user  = {};
    app.hotel = {};        
    
    
    window.app = app;
    
   
    
    
    
    app.checkConnection = function() {
        app.isOnline() == true ? app.onOnline() : app.onOffline;
    }

    app.isOnline = function() {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };
    
    app.isOffline = function() {
        return !app.isOnline();
    }
    
    app.onOnline = function() {                
        helper.setConnectionIconColor(globals.ONLINE);      
    };
    
    app.onOffline = function() {        
        helper.setConnectionIconColor(globals.OFFLINE);
    };
    
    
    app.loadAppSettings = function(callback) {
        console.log('Loading AppSettings.json');
         $.getJSON("AppSettings.json", function(json) {
             console.log("Debug Configuration: " + json.debug);                
             console.log("Message: " + json.message);                
             console.log("backendURL: " + json.backendURL);                
             $api.init(json.backendURL,json.apichunk);                
             console.log("language: " + json.language);     
             loc.lang = json.language;             
             
             app.backendurl = json.backendURL;
             app.version = json.version;
             
             var version  = localStorage.getItem("dingdone:appversion");            
             app.justupdated = false;
             if (version != null) {
              if (parseInt(app.version.replaceAll('.','')) > 
                                        parseInt(version.replaceAll('.','')))
                 
                   app.justupdated = true;  
                 
              }
                             

                 
             (typeof json.hotelname !== 'undefined') ? app.hotelname   = json.hotelname : app.hotelname = '';
             app.server  = helper.getServer(json.backendURL);
                          
             
               callback();
            });       
    };
    
    
    app.navigateHome = function() {                
        
        if (app.user.role === globals.ROLE_MAID )        
             app.mobileApp.navigate('components/homeView/maid.html');              
        else if (app.user.role === globals.ROLE_MAINTENANCE)        
             app.mobileApp.navigate('components/homeView/maintenance.html');                      
        else if (app.user.role === globals.ROLE_HOUSEKEEPER) 
            app.mobileApp.navigate('components/homeView/housekeeper.html');                      
        else if (app.user.role === globals.ROLE_MAINTENANCECHIEF)
            app.mobileApp.navigate('components/homeView/maintenancechief.html');              
        else if (app.user.role === globals.ROLE_OPERATIONS)            
             app.mobileApp.navigate('components/homeView/operations.html');              
        else if (app.user.role === globals.ROLE_MANAGER )
             app.mobileApp.navigate('components/homeView/manager.html'); 
        else {
        	alert('User role has no home specified!');
        }
        
    };
    
}());

// START_CUSTOM_CODE_kendoUiMobileApp
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_kendoUiMobileApp
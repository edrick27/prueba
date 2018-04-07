// Matthias Malek
// SuisseWorks
// Jan, 2016
// Controller for Communicating with the Telerik Backend Services for this project
// This controller handles images (taking witth he camera) that we store in the telerik backend.
// Also, this controllers handles push notifications.

(function(window) {
    
    function EverliveController() {
        
        var _DEBUG      = true;                
        var log = function(msg) {
            if (_DEBUG) console.log(msg);
        }
        
                
        
        //This is your Telerik BackEnd Services API key.
        var baasApiKey = '6nuiz4i74bb2s3w2'; //'C7V4YqGdpUyNIDV2';

        //This is the scheme (http or https) to use for accessing Telerik BackEnd Services.
        var baasScheme = 'http';

        //This is your Android project number. It is required by Google in order to enable push notifications for your app. You do not need it for iPhone.
        var androidProjectNumber = '964672814978';

        //Set this to true in order to test push notifications in the emulator. Note, that you will not be able to actually receive 
        //push notifications because we will generate fake push tokens. But you will be able to test your other push-related functionality without getting errors.    
        var emulatorMode = false;

        
        //Initialize the Telerik BackEnd Services SDK    
        var everlive = new Everlive({
            apiKey: baasApiKey,
            scheme: baasScheme
        }); 
        
        
        
        var pushSettings = {
         iOS:{
             badge: true,
             sound: true,
             alert: true
          },
          android:{
                senderID: androidProjectNumber
          },
          notificationCallbackIOS: function(args){ 
                //logic for handling push in iOS                            
              if (args.foreground === true || args.foreground == "1") {                  
                  app.sounds.alert.play();                 
                  //alert(JSON.stringify(args));
                  //helper.showWindowMessage(JSON.parse(JSON.stringify(args.alert)));
                  helper.showPushNotification(args, true);
                  
              }
              else                   
                  //if (args.type == globals.NOTIFICATION_ALERT || args.type == globals.NOTIFICATION_TASK)
                      app.homeView.goPushNotificationAlert(args.idalert);                  
                                 
          },
          
          notificationCallbackAndroid:function(args){
                //logic for handling push in Android                              
              if (args.foreground === true || args.foreground == "1") {                  
                  app.sounds.alert.play();
                  //helper.showWindowMessage(JSON.parse(JSON.stringify(args.message)));
                  helper.showPushNotification(args, false);
                  
              }             
              else                                     
                  if (typeof args.payload.customData != 'undefined') {
                      //if (args.payload.customData.type == globals.NOTIFICATION_ALERT || globals.NOTIFICATION_TASK)                       
                          app.homeView.goPushNotificationAlert(args.payload.customData.idalert);                                               
                          
                  }         
          },        
     };
        
        var customParameters = { idstaff: -1, idhotel: -1 };
        
        var currentDevice = everlive.push.currentDevice(emulatorMode);
        
        // Allow the notifications and obtain a token for the device from 
        // Apple Push Notification service, Google Cloud Messaging for Android, WPNS, etc.
        // Relies on the register() method of the PhoneGap PushPlugin
        this.enableNotifications = function() {
            
            if (navigator.simulator === true) return;
            
            customParameters.idstaff = app.user.idstaff;            
            customParameters.idhotel = app.hotel.idhotel;
            
            currentDevice.enableNotifications(pushSettings)
            .then(
                function (initResult) {
                    // notifications were initialized successfully and a token is obtained
                    log('notifications were initialized successfully and a token is obtained');
                    // verify the registration in Backend Services
                    return currentDevice.getRegistration();
                },
                function (err) {                                       
                      alert('Notifications cannot be initialized - ' + err);
                    // notifications cannot be initialized
                }
            ).then(
                function (registration) {
                    // currentDevice.getRegistration() tried to obtain the registration from the backend and it exists                   
                    // we may want to update the device's registration in Backend Services                                                                                
                    currentDevice
                        .updateRegistration(customParameters)
                        .then(function () {
                          log('Registrations was successfully updated');// the registration was successfully updated
                        }, function (err) {
                            // failed to update the registration
                            log('failed to update the registration');
                        });
                },
                function (err) {
                    if (err.code === 801) {
                        // currentDevice.getRegistration() returned an error 801 - there is no such device                        
                        //we need to register the device
                        currentDevice.register(customParameters)
                            .then(function (regData) {
                                // the device was successfully registered
                                log('Device was succesfully registered!');
                            }, function (err) {
                                log('Fail to register device');
                                 //failed to register the device
                            });
                    } else {
                        // currentDevice.getRegistration() failed with another errorCode than 801
                        log('Fail to register device with another errorCode than 801');
                    }
                }
            );
        
        } // enableNotifications
        
        
    
        
        // Sending Push Notifications
        // We use the Backend API method sendpush        
        this.sendPushNotification = function(title, idstaff, message, customdata) {              
            // Don´t send to ourselves
            if (idstaff !== app.user.idstaff)
                return $api.sendPushNotification({title: title,idstaff: idstaff, message: message, customdata: customdata});
        }
        
        this.sendPushNotificationWithReminder = function(remind, activitytype, idactivity, title, idstaff, message, customdata) {              
            // Don´t send to ourselves
            if (idstaff !== app.user.idstaff)
                return $api.sendPushNotificationWithReminder( 
                    {remind: remind , activitytype: activitytype, idactivity: idactivity, title: title, idstaff: idstaff, message: message, customdata: customdata});
        }
        
        

        
       
        
        // Takes a picture using device camera and returns image data 
        this.takePicture = function(source) {
            var deferred = $.Deferred();            
            // Success
            var success = function (data) {                                                                                    
                deferred.resolve(data);                               
            }; 
            
            // Error
            var error = function (e) {                            
                //navigator.notification.alert("Error Taking picture");
                deferred.reject();
            };
            
            // Config
            var config = {
                destinationType: Camera.DestinationType.DATA_URL,
                targetHeight: 400,
                targetWidth: 400,
                encodingType: Camera.EncodingType.PNG,
                sourceType: source //navigator.camera.PictureSourceType.PHOTOLIBRARY
            };
        
            // Take Picture
            navigator.camera.getPicture(success, error, config);                              
            
            return deferred.promise();
        }
        
        
        // Se usa para cuando se toman/ escogen foto para el perfil
         this.takePictureSmall = function() {
            var deferred = $.Deferred();            
            // Success
            var success = function (data) {                                                                                    
                deferred.resolve(data);                               
            }; 
            
            // Error
            var error = function (e) {                            
                //navigator.notification.alert("Error Taking picture");
                deferred.reject();
            };
            
            // Config
            var config = {
                destinationType: Camera.DestinationType.DATA_URL,
                targetHeight: 200,
                targetWidth: 200,
                encodingType: Camera.EncodingType.PNG,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            };
        
            // Take Picture
            navigator.camera.getPicture(success, error, config);                              
            
            return deferred.promise();
        }
        
        // Sends/Saves the taken picture to Telerik Backend Services
        this.sendPicture = function(picture) {            
            var deferred = $.Deferred();
                        
            
            everlive.Files.create({
                    Filename: Math.random().toString(36).substring(2, 15) + ".jpg",
                    ContentType: "image/jpeg",                                          
                    base64: picture
                },
            function(data) { deferred.resolve(data.result.Uri); },
            function(error) {  deferred.reject(null);}
            
            
            
            )
            /*.then(function(data) {      
                deferred.resolve(data.result.Uri);
            })*/                                   
            
            return deferred.promise();
        }
        
        
    }
     
    window.EverliveController = EverliveController;
    
    
}) (window)

var everliveController = new EverliveController();
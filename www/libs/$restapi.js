// Matthias Malek
// SuisseWorks, 2015

// Module Pattern Object for handling rest API calls to the SmartHotel backend

(function(window) {
    
    function RestAPI() {             
        
        var  _idhotel    = 0,
            _url   = "http://localhost/smarthotel/cloud/rest/",    // Overwritten by value in AppSettings.json   
            _chunk = 500,    /* Also configured/overwritten in AppSettings.json, determines the maximum number or rows
                                one single call to an api method can return. */
            _jqXHR          = "",        /* the jqXHR of the last api call. See http://api.jquery.com/jquery.ajax/
                                            Here you can check the status of the request : api.jqXHR.status    */
            _textStatus     = '',       // textStatus return by the last api call 
            _errorThrown    = null,     // Error thrown by the last api call, if applicable.
            _DEBUG          = false,
        
            _background     = true,  // to run on the background and avoid showing error messages, etc.
            _working        = false;    

        var log = function(msg) {            
            if (_DEBUG) console.log(msg);
        }
        
        this.getURL = function() {
            return _url;
        }
        
        this.setBackground = function(value) {
            _background = value;            
        }
        
        this.isWorking = function() {
            return _working;
        }
                

        this.init = function(url, chunk) {            
            log('$api.Init ' + url);
            _url   = url + "rest/";
            _chunk = chunk;
            $.ajaxSetup({
              headers: {          
                  // Set up appropiate headers for authorization. Does not work if I use underscores in the name (?).
                  // On the server side, check with $_SERVER['HTTP_SMARTHOTELTOKEN'] -- uppercase
                  SmarthotelToken: "1bc0c2e3e-a454-11e5-94a9-bc5ff4766b7623",                                             
              }
            });    
        }        
        
        
        this.isOnline = function() {
            if (!navigator || !navigator.connection) {
                return true;
            } else {
                return navigator.connection.type !== 'none';
            }
        }
        
        
        ///////// API CALLS TO Backend ////////////////////
        //silent, es cuando se está haciendo login silencioso, sin que el usuario haya ingresado 
        // datos, sino tomados del localstorate..
        
        this.login = function(condition) {
            var deferred = $.Deferred();
            
            restService('login', condition)
            .done(function(response)  {                  
                if (response.result === globals.LOGIN_SUCCESS)
                    deferred.resolve(response)  // includes the user data 
                else
                   deferred.reject(response.result);                
            })
            .fail(function(response) {                
                deferred.reject(response);
            })
            
            return deferred.promise();
        }
        
        //NOTAS
        // Todas las llamadas al Backend envían el SmarthotelToken en el encabezado.
        // Todas las llamadas, excluyendo el login, requieren del idhotel como parámetro
        // 

       
        this.getNewVersionURL = function(condition) {
            return restService('newversionurl', condition);
        }

       
        
        this.getStaff = function(condition) {
            return restService('staff', condition);
        }
        
        this.getFacilities = function(condition) {
            return restService('facilities', condition);    
        },
        
        
        // Send Push notification
        
        this.sendNotification = function(condition) {
            var deferred = $.Deferred();
            restService('sendnotification', condition)
            .done(function(result) {
                deferred.resolve(result);
            })            
            return deferred.promise();
        }
        
        
        this.sendPushNotification = function(condition) {
            var deferred = $.Deferred();
            restService('sendpush', condition)
            .done(function(result) {
                deferred.resolve(result);
            })            
            return deferred.promise();
        }
        
        this.sendPushNotificationWithReminder = function(condition) {
            var deferred = $.Deferred();
            restService('sendpushwithreminder', condition)
            .done(function(result) {
                deferred.resolve(result);
            })            
            return deferred.promise();
        }
        
        
        this.ping = function(data) {
            var deferred = $.Deferred();
            
            restService('ping', data)
            .done(function(result){
                console.info('ok');
                deferred.resolve(result);
            })
            .fail(function() {
                 console.info('fail');
                deferred.reject();
            })
            
            return deferred.promise();
        }
        
         /**********************************/
         /*          ALERTS               */
        /**********************************/
        
         // Requiere el rol, el idstaff,
        // Si el rol es maid ó maintenance, se retorna un máxumo de 100 alerts
        // Se envía también el lastmodified 
        // TODO: COMO HACER PARA INFINITE SCROLL...enviar lastid ??
        // IMPORTANTE: En un mismo despositivo, pueden haber alertas de diferentes personas....
        // Siempre filtrar por idstaff o idmodule....
        this.getAlerts = function(condition) {                      
            return restService('alerts', condition);                        
        }
        
        this.postAlert = function(condition) {
            var deferred = $.Deferred();            
            
            console.info(condition);
            restService('postAlert', condition)            
            .done(function(result) {                    
                
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                
            })
            .fail(function(error) {                
                deferred.reject(error);
            })
            return deferred.promise();
            
        }
        
       
        
        this.assignAlert = function(condition) {            
            var deferred = $.Deferred();
            restService('assignalert', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        this.takeAlert = function(condition) {            
            var deferred = $.Deferred();
            restService('takealert', condition)
            .done(function(result) {
                deferred.resolve(result);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        
        this.pingReceived = function(condition) {            
            var deferred = $.Deferred();
            restService('pingreceived', condition, true)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        this.pingReceivedByOwner = function(condition) {            
            var deferred = $.Deferred();
            restService('pingreceivedbyowner', condition, true)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
         this.pingReceivedTaskByOwner = function(condition) {            
            var deferred = $.Deferred();
            restService('pingreceivedtaskbyowner', condition, true)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        this.evaluateAlert = function(condition) {
            var deferred = $.Deferred();
            restService('evaluatealert', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();            
        }
        
        this.evaluateTask = function(condition) {
            var deferred = $.Deferred();
            restService('evaluatetask', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();            
        }
        
        
        
        
        
        this.alertSettings = function(condition) {            
            var deferred = $.Deferred();
            restService('alertsettings', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
         this.taskSettings = function(condition) {            
            var deferred = $.Deferred();
            restService('tasksettings', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        
        
        
         /**********************************/
         /*          TASKS                 */
        /**********************************/
        
        this.getTasks = function(condition) {                      
            return restService('tasks', condition);                        
        }
        
        this.getTaskTypes = function(condition) {                      
            return restService('tasktypes', condition);                        
        }
        
        
        this.createTask = function(condition) {
            var deferred = $.Deferred();                                    
            restService('createtask', condition)            
            .done(function(result) {                                        
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        this.createCleaningTasks = function(condition) {
            var deferred = $.Deferred();                                    
            restService('createcleaningtasks', condition)            
            .done(function(result) {                                        
                result.result === 1 ? deferred.resolve(result.data.count) : deferred.reject(result.error);                
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
               
        
         /**** CHECKLISTS *****/
        this.updateAlertCheckList = function(condition) {
            var deferred = $.Deferred();            
            
            console.info(condition);
            restService('updatealertchecklist', condition)            
            .done(function(result) {                                                    
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                
            })
            .fail(function(error) {                
                deferred.reject(error);
            })
            return deferred.promise();
            
        }
        
       
        
        
        /**** COMMENTS *****/
        
        this.getActionLog = function(condition) {                      
            return restService('actionlog', condition);                        
        }
        
         this.getAlertChecklist = function(condition) {                      
            return restService('alertchecklist', condition);                        
        }
        
        this.syncAlertChecklist = function(condition) {                      
            return restService('syncalertchecklist', condition);                        
        }
        
        
        this.createActionLog = function(condition) {
            var deferred = $.Deferred();
            restService('createactionlog', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();            
            
        }
        
        
        this.sendComment = function(condition) {
            var deferred = $.Deferred();
            restService('sendcomment', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();            
        }
        
        
        
        /**********************************/
                
        this.updateFilterPreferences = function(condition)  {
            var deferred = $.Deferred();
            restService('updatefilterpreferences', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();                 
        }
        
         this.updatePreferences = function(condition)  {
            var deferred = $.Deferred();
            restService('updatepreferences', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();                 
        }
        
        this.setAvailability = function(condition)  {
            var deferred = $.Deferred();
            restService('setavailability', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();                 
        }
        
        this.setAvatar = function(condition)  {
            var deferred = $.Deferred();
            restService('setavatar', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();                 
        }
        
        this.changePassword = function(condition)  {
            var deferred = $.Deferred();
            restService('changepassword', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();     
            
        }
        
        
        this.getWorkingHours = function(condition) {
            return restService('workinghours', condition);                
        }
        
        
          
        this.getItems = function(condition) {             
            return restService('items', condition);
        }
        
        this.getEntity = function(name, condition) {
            return restService(name, condition);            
        }
        
        
        this.getOccupancy = function(condition) {
            return restService('occupancy', condition);        
        }
        
        
        this.setRoomReady = function(condition) {
             var deferred = $.Deferred();
            restService('setRoomReady', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);                        
            })   
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();        
        }
        
         
        this.SavePictures = function(condition) {            
            var deferred = $.Deferred();
            restService('savepictures', condition)
            .done(function(result) {
                deferred.resolve(result) ;                        
            })  
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        this.setFCMtoken = function(condition)  {
            var deferred = $.Deferred();
            restService('fcmtoken', condition)
            .done(function(result) {
                result.result === 1 ? deferred.resolve(result.data) : deferred.reject(result.error);
            })
            .fail(function(error) {
                deferred.reject(error);
            })
            return deferred.promise();
        }
        
        
        // PRIVATE METHOD FOR MAKING THE RESTAPI CALLS
        restService = function(method, vars, silent) {  //,callback) 
            var deferred = $.Deferred();        
            
            _working = true;
            
            app.idle = false;
            
            //if (!$api.isOnline()) {return deferred.reject('OFFLINE')}
            
            //log(vars);
            
            // ADD idhotel and chunk to the variables passed to the api call
            vars['idhotel'] = app.hotel.idhotel;    // TODO: should be local variables as well
            vars['chunk']   = _chunk;
            
            var url = _url + method.toLowerCase() + "/";
            
            log('Calling API ' + url);
            log("METHOD " + method);
            log(vars);
            
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',    
                data: vars,       
                                
                beforeSend: function() {            
                    //helper.setConnectionIconColor(globals.APICALLING);
                },
                
                success: function(data, textStatus, xhr) {
                    log("API CALL Success");              
                    //app.idle = true;
                    helper.setConnectionIconColor(globals.ONLINE);   
                    deferred.resolve(xhr.responseJSON);
                },
                
                error: function(jqXHR, textStatus, errorThrown) {
                   //app.idle = true;
                    log("API CALL with Error");
                    helper.setConnectionIconColor(globals.APICALLERROR);
                    _jqXHR = jqXHR;
                    _textStatus = textStatus;
                    _errorThrown = errorThrown;                        
                    var message =
                          "\nCalling: " + url +                  
                          "\nStatus Code: " + jqXHR.status + 
                          "\nResponse: " + jqXHR.responseJSON +
                          "\n Message: " + jqXHR.statusText +                  
                          "\nDATA: " + JSON.stringify(vars); 
                    
                    console.info(textStatus);
                    console.info(errorThrown);
                    
                    //if (jqXHR.status === 200)  // Si hay un error de sintáxis en el API (Backend),                     
                    // La respuesta es 200 o 500, que es OK. Ocupamos revisar el responseText por pistas.
                                                            
                    console.log(message);                    
                    
                    silent = silent || false;  // argument passed?

                    
                    if (!_background && silent == false)                        
                        $smart.showMessageDialog("<i class='mdi mdi-wifi-off mdi-2x c-main3'></i><br>  No hay red!<br> Reintentar más tarde!");
                    else
                        console.info('background Mode: no hay red o Error');
                    
                    deferred.reject('Error: ' + jqXHR.statusText + ' llamando a ' + method);
                },
                
                complete: function(xhr, textStatus) {           
                  _working = false;
                  app.idle = true;
                  log("API CALL Complete");
                  log(xhr);
                  log(textStatus);
                  log(xhr.responseJSON);
                  //callback(xhr.responseJSON);
                }
            })   
            .done(function() {});
            return deferred.promise();
        }
        
                
        
    }  // RestAPI
    
    window.RestAPI = RestAPI;
    
}) (window)


var $api = new RestAPI();

/*
SuisseWorks (c) 2014
Matthias Malek
August, 2014	
*/

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

helper = {};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
helper.guid = function() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

helper.initTabStrip = function(e) {
    helper.tabStrip = e.view.footer.find(".km-tabstrip").data("kendoMobileTabStrip");
}

helper.selectTabStripTab = function(index) {
    helper.tabStrip.switchTo(index);    
}

helper.setBadge = function(tabStripIndex, value) {    
    helper.tabStrip.badge(tabStripIndex, value == 0 ? false : value);            
}

// Returns Consolidación, Producción ó Localhost
helper.getServer = function(apiURL) {
    if (apiURL.indexOf("localhost") !== -1)
        return "Localhost";
    if (apiURL.indexOf("demo") !== -1)
        return "Demo";
    if (apiURL.indexOf("cons") !== -1)
        return "Consolidación";
    if (apiURL.indexOf("dinganddone") !== -1)
        return "Producción";
    
    return "Localhost";
}

helper.removeZZ = function(string) {
    if (string.toLocaleLowerCase() == "jacuzzi")
        return string;
    
    return string.replace('ZZ', '').replace('zz', '');
}

helper.activateTab = function(tab) {
    $('.nav-pills a[href="#' + tab + '"]').tab('show');
}

// Based on users role
helper.setTabStripURLs = function() {      
    
    $(".goOccupancy").unbind('click');
    $(".goOccupancy").click(function() {
        var currentView = app.mobileApp.view().id; // Get current view..
        if (currentView === "components/hotelView/view.html")
            app.hotelView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
        else
            app.mobileApp.navigate('components/hotelView/view.html');   
    }) 
    
    $(".goReport").unbind('click');
    $(".goReport").click(function() {       
         var currentView = app.mobileApp.view().id; // Get current view..
        if (currentView === "components/reportAlertView/view.html")
            app.reportAlertView.quickReportAlert();  
        else 
            app.mobileApp.navigate('components/reportAlertView/view.html');  
    }) 
    
        
    
    
    if (app.user.role === globals.ROLE_MAID) {
         $(".goHome").unbind('click');
         $(".goHome").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/homeView/maid.html")
                app.homeView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/homeView/maid.html');   
        }) 
        
         $(".goProfile").unbind('click');
         $(".goProfile").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/profileView/maid.html")
                app.profileView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/profileView/maid.html');   
        }) 
        
    }
    if (app.user.role === globals.ROLE_MAINTENANCE) {        
        $(".goHome").unbind('click');
        $(".goHome").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/homeView/maintenance.html")
                app.homeView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/homeView/maintenance.html');   
        })
         $(".goProfile").unbind('click');
         $(".goProfile").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/profileView/maid.html")
                app.profileView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/profileView/maid.html');   
        })      
                
    } else if (app.user.role === globals.ROLE_HOUSEKEEPER) {
        //$(".goHome").prop('href', "components/homeView/housekeeper.html");    
         $(".goHome").unbind('click');
        $(".goHome").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/homeView/housekeeper.html")
                app.homeView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/homeView/housekeeper.html');   
        })
        
        $(".goProfile").unbind('click');
        $(".goProfile").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/profileView/housekeeper.html")
                app.profileView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/profileView/housekeeper.html');   
        })      
    } else if (app.user.role === globals.ROLE_MAINTENANCECHIEF) {
        //$(".goHome").prop('href', "components/homeView/maintenancechief.html");
        $(".goHome").unbind('click');
        $(".goHome").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/homeView/maintenancechief.html")
                app.homeView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/homeView/maintenancechief.html');   
        })
        $(".goProfile").unbind('click');
        $(".goProfile").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            console.info('Current View', currentView);
            if (currentView === "components/profileView/maintenance.html")
                app.profileView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/profileView/maintenance.html');   
        })    
    } else if (app.user.role === globals.ROLE_OPERATIONS) {
        //$(".goHome").prop('href', "components/homeView/operations.html");     
        $(".goHome").unbind('click');
        $(".goHome").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/homeView/operations.html")
                app.homeView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/homeView/operations.html');   
        })
         $(".goProfile").unbind('click');
        $(".goProfile").click(function() {
            var currentView = app.mobileApp.view().id; // Get current view..
            if (currentView === "components/profileView/maintenance.html")
                app.profileView.scrollTopWithFix();//myscroller.animatedScrollTo(0, 0); 
            else
                app.mobileApp.navigate('components/profileView/maintenance.html');   
        })          
    } else if (app.user.role === globals.ROLE_MANAGER) {
        $(".goHome").prop('href', "components/homeView/manager.html");            
        $(".goProfile").prop('href', "components/profileView/manager.html"); 
    }        
}


helper.showChat = function() {
    $("#chatInput").val('');
    $(".chatBox").show();
}

helper.hideChat = function() {
    $(".chatBox").hide();
}

helper.fixNull = function(value) {
    if (value == null)
        return '';
    return value;
}

helper.windowheight = 0;

helper.setPlusCirclePosition = function() {
    /** Calcula la posición del círculo para agregar tareas */
    /* TODO: Al girar el dispositivo, esto debe recalcularse */
    var h = 0;
    
    if (helper.windowheight === 0) {
        var headerheight = $("#navigation-container").height();
        helper.windowheight = $(window).height() - (headerheight * 2); //substract footer and header heights        
    }
        
    if (helper.isTablet()) {                    
        $(".plusCircle").css('height', '80px');    
        $(".plusCircle").css('width', '80px');    
        h = helper.windowheight - (80 * 2);        
        // hace que los iconos del tabstrip se vuelvan pequeños
        //$('#viewHome *').css('font-size', '20px');            
    } else
        h = helper.windowheight - (56 + 56 + 56);
    //h = helper.windowheight - (56 +45 + 35);
        
    $(".plusCircle").css('top', h);  
}

helper.isMaid = function() {
    return (app.user.role === globals.ROLE_MAID); 
}

helper.isMaintenance = function() {
    return (app.user.role === globals.ROLE_MAINTENANCE); 
}

helper.isWorker = function() {
    return (helper.isMaid() || helper.isMaintenance());
}

helper.isHousekeeper = function() {
    return (app.user.role === globals.ROLE_HOUSEKEEPER); 
}

helper.isMaintenanceChief = function() {
    return (app.user.role === globals.ROLE_MAINTENANCECHIEF); 
}

helper.isChief = function() {
    return (helper.isHousekeeper || helper.isMaintenanceChief);
}

/*
helper.slideToView = function(href) {        
var os = kendo.support.mobileOS;
    
if (!os.ios)
app.mobileApp.navigate(href);       
else
if (window.plugins && window.plugins.nativepagetransitions) {        
window.plugins.nativepagetransitions.slide ({
"href" : href
});            
}
else 
            
},

*/

helper.goBack = function(href) {
    window.plugins.nativepagetransitions.curl({
                                                  "href" : href
                                              });            
}    

helper.estimateDurationInterval = null;

helper.clockinterval = null;

/*helper.setClockTitle = function() {        
if (helper.clockinterval !== null) clearInterval(helper.clockintevarl);    
    
if (app.user.role === globals.ROLE_HOUSEKEEPER || app.user.role === globals.ROLE_MAINTENANCECHIEF)            
helper.clockinterval = setInterval( function(){ $("#navbarhousekeeper").data("kendoMobileNavBar").title($date.todayTime()) },1000);        
    
if (app.user.role === globals.ROLE_MAID || app.user.role === globals.ROLE_MAINTENANCE)            
helper.clockinterval = setInterval( function(){ $("#navbarmaid").data("kendoMobileNavBar").title($date.todayTime()) },1000);           
}
*/

helper.showClock = function(element) {
    $(element).show();    
    if (helper.clockInterval !== null)
        clearInterval(helper.clockinterval);
    helper.clockinterval = setInterval(function() {
        element.html($date.moment("HH:mm"))
    }, 1000);            
}

helper.showClockSecs = function(element) {
    if (helper.clockInteral !== null)
        clearInterval(helper.clockinterval);
    helper.clockinterval = setInterval(function() {
        element.html($date.moment("HH:mm:ss"))
    }, 1000);            
}

// If useNativeScrolling is enabled, this does not work..
helper.preparePullToRefresh = function(e, callback) {    
    var scroller = e.view.scroller;
    
    scroller.setOptions({
                            pullToRefresh: true,
                            pull: function() {
                                callback();
                                scroller.pullHandled();
                            },
        
                            // NOT WORKING
                            /*pullTemplate: "<i>Tire para refrescar</i>",
                            releaseTemplate: "Suelte para refrescar",
                            refreshTemplate: "Actualizando...",*/
        
                        })       
}

helper.isTablet = function() {
    return (kendo.support.mobileOS.tablet == 'tablet' || kendo.support.mobileOS.tablet == 'android');
}

helper.isAndroid = function() {
    return (kendo.support.mobileOS.name == "android");
}

helper.isiOS = function() {
    return (kendo.support.mobileOS.name == "ios");
}

helper.formatDuration = function(duration) {
    if (duration === 0)
        return 0;
    var hours = 0;
    var minutes = Math.floor(duration / 60);        
    if (minutes > 60) {
        hours = Math.floor(minutes / 60);
        minutes = hours % 60;
    }
    
    var secs = duration % 60;
    if (secs < 10)
        secs = "0" + secs;
    
    if (hours > 0)
        return hours + " h, " + minutes + " m, " + secs + " s";
    else
        return minutes + " m, " + secs + " s";
}

helper.getActvityName = function(activity) {
    if (activity == globals.GUEST_ACTIVITY_BREAKFAST)
        return "DESAYUNANDO";
    else if (activity == globals.GUEST_ACTIVITY_LUNCH)
        return "ALMORZANDO";
    else if (activity == globals.GUEST_ACTIVITY_DINNER)
        return "CENANDO";
    else if (activity == globals.GUEST_ACTIVITY_ON_TOUR)
        return "DE TOUR";
    else
        return "";
}

// add n/a , blank to select
helper.prependBlankToSelect = function(idselect) {
    // Add empty to drop down (just once)
    var id = "#" + idselect;
    if ($(id + " option[value=-1]").length == 0) {                
        $(id).prepend($('<option>', {
                            value: -1,
                            text: ''
                        }));                   
    }
    $("#sectionSelect_Issue").val(-1);  	 
}

////////////////////// PUSH NOTIFICATION HELPER ////////////////////////

helper.sendPushNotificationDING = function() {    
    var senderName = app.user.fullname.split(" ")[0];  
    var title = "DING";    
    var message = senderName + " está Disponible! ";    
    // Si existen varias amas de llaves, tal vez cada mucama tiene como jefe a una en específico.
    // Podríamos enviar solo la notificación a la ama de llaves que es su jefe....
    var chiefs = helper.getModuleChiefs(app.user.idmodule);        
    
    for (var i = 0;i < chiefs.length; i++)    
        $smart.sendPushNotification(title, chiefs[i], message, null);    
}

helper.sendPushNotificationDONE = function() {    
    var senderName = app.user.fullname.split(" ")[0];  
    var title = "DONE";    
    var message = senderName + " NO está Disponible! ";
    
    var chiefs = helper.getModuleChiefs(app.user.idmodule);
    
    for (var i = 0;i < chiefs.length; i++)    
        $smart.sendPushNotification(title, chiefs[i], message, null);  
}

helper.sendPushNotificationAlert = function(alert, type, additionalText) {
    // first name only
    var senderName = app.user.fullname.split(" ")[0];    
    var module = alert.idmodule || globals.MODULE_MAINTENANCE ;        
    var customdata = {type: globals.IS_ALERT, idalert: alert.idalert, sound: helper.getPNSoundAlert(type)};       
    var chiefs = helper.getModuleChiefs(module); // housekeeper or maintenancechief
    var title = '';
    var message = '';
    var recipients = [];  // who we are sending the PN to...
    var facility = helper.shortenHabitacion(alert.facility);
    
    switch (type) {        
        case globals.PN_ALERT_RECEIVED: {
                // do not ping if I was the one who reported the alert...                        
                if (alert.reportedby === app.user.idstaff)
                    return;                         
                title = "Alerta Recibida";
                message = senderName + " recibió alerta: " + facility + " . " + alert.name;                                 
                recipients.push(alert.reportedby);                     
                break;
            }
        case globals.PN_RECEIVED_BY_OWNER: {
                // do not ping if I am the owner
                if (alert.assignedby === app.user.idstaff)
                    return;             
                if (alert.assignedby == null)
                    return;           // old version compatibility  
                title = "Alerta Recibida";
                message = senderName + " recibió alerta: " + facility + " . " + alert.name;                                 
                recipients.push(alert.assignedby);                     
                break;
            }        
        case globals.PN_ALERT_ASSIGNED: {
                title = "Alerta - " + alert.name;
                message = senderName + " te asignó alerta en " + facility + " . " + alert.name;                                                
            
                $smart.sendPushNotificationWithReminder(1, globals.ACTIVITY_ALERT, alert.idalert, title, alert.idstaff,
                                                        message, {type: globals.IS_ALERT, idalert: alert.idalert, sound: globals.SOUND_ALERT_DING });
                return;
                break;
            }   
        case globals.PN_ALERT_REASSIGNED: {
                title = "Alerta Reasignada";
                message = senderName + " reasignó alerta en " + facility + " . " + alert.name;                                    
                recipients.push(alert.oldowner);            
                break;
            }   
        case globals.PN_ALERT_STARTED: {
                title = "Alerta Comenzada";            
                message = senderName + " comenzó alerta en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);            
                break;
            }
        case globals.PN_ALERT_PAUSED: {
                title = "Alerta Pausada";
                message = senderName + " ha pausado alerta en " + facility + " . " + alert.name + ": " + additionalText;                                    
                $.merge(recipients, chiefs);
                break;
            }   
        case globals.PN_ALERT_RESOLVED: {
                title = "Alerta Resuelta";
                message = senderName + " finalizó alerta en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);
                $.merge(recipients, helper.getManagers());                
                break;
            }           
        case globals.PN_ALERT_DELETED: {
                title = "Alerta Eliminada";
                message = senderName + " ha eliminado alerta en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);
                if (alert.idstaff != null && alert.idstaff != 0)
                    recipients.push(alert.idstaff);
                break;
            }   
        case globals.PN_ALERT_RESUMED: {
                title = "Alerta Reanudada";
                message = senderName + " ha reanudado alerta en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                break;
            }   
        case globals.PN_ALERT_COMMENT: {
                title = senderName;
                message = senderName + " dice: " + additionalText;
                $.merge(recipients, chiefs);
                recipients.push(alert.idstaff);
                break;
            }   
        case globals.PN_ALERT_EVALUATE: {
                title = senderName;
                message = senderName + " evaluó alerta en: " + facility + " . " + alert.name + ": " + additionalText + " estrellas.";            
                recipients.push(alert.idstaff);
                break;
            }   
        case globals.PN_ALERT_DND: {
                title = "DND";
                message = senderName + " finalizó alerta (DND) en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);
                $.merge(recipients, helper.getManagers());                
                break;
            }   
        case globals.PN_ALERT_MARKFINISHED: {
                title = "Marcada como Finalizada";
                message = senderName + " marcó alerta como finalizada en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);
                $.merge(recipients, helper.getManagers());                
                break;
            }   
        case globals.PN_ALERT_TASKCREATED: {
                title = "Alerta a Tarea";
                message = senderName + " creó tarea en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                recipients.push(alert.reportedby);
                $.merge(recipients, helper.getManagers());                
                break;
            }   
        case globals.PN_ALERT_WILLCHECK: {
                title = senderName + " dice";
                message = additionalText + " . " + facility + " . " + alert.name;                                                
                recipients.push(alert.reportedby);
                $.merge(recipients, helper.getManagers());                
                break;
            }   
        case globals.PN_ALERT_TAKEN: {             
                title = "Alerta Tomada";            
                message = senderName + " tomó alerta en " + facility + " . " + alert.name;                                    
                $.merge(recipients, chiefs);
                $.merge(recipients, helper.getModuleStaff(module));
                recipients.push(alert.reportedby);            
                break;
            }
    }
    
    $.unique(recipients); // remove duplicates...don´t want to send same notification to the same person more than once..
    for (var i = 0; i < recipients.length;i++)
        $smart.sendPushNotification(title, recipients[i], message, customdata);
}

helper.getPNSoundAlert = function(type) {        
    var sound = globals.SOUND_OTHER;
    switch (type) {
        case globals.PN_ALERT_CREATED :
            sound = globals.SOUND_ALERT_DING;
            break;
        case globals.PN_ALERT_RECEIVED :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_STARTED :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_PAUSED :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_RESOLVED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_ALERT_DELETED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_ALERT_RESUMED :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_ASSIGNED :
            sound = globals.SOUND_ALERT_DING;
            break;
        case globals.PN_ALERT_REASSIGNED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_ALERT_COMMENT :
            sound = globals.SOUND_CHAT;
            break;
        case globals.PN_ALERT_EVALUATE :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_DND :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_ALERT_MARKFINISHED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_ALERT_WILLCHECK :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_ALERT_TAKEN :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_RECEIVED_BY_OWNER :
            sound = globals.SOUND_OTHER;
            break;
    }
    
    return sound;    
}

helper.getExteriorMode = function() {
    if (app.user.preferences == null)
        return false;
    return app.user.preferences.exterior;
}

helper.sendPushNotificationTask = function(task, type, additionalText) {
    // first name only
    var senderName = app.user.fullname.split(" ")[0];    
    var module = task.idmodule || globals.MODULE_MAINTENANCE ;        
    var customdata = {type: globals.IS_TASK, idtask: task.idtask, sound: helper.getPNSoundTask(type)};       
    var chiefs = helper.getModuleChiefs(module); // housekeeper or maintenancechief
    var title = '';
    var message = '';
    var recipients = [];  // who we are sending the PN to...
    var facility = helper.getShortFacilityName(task.idfacility); 
    var taskname = helper.getTaskTypeName(task.idtype)
    var remind = (module === globals.MODULE_MAINTENANCE ? 1 : 0);  // Only reminders for MAINTENANCE for now
    
    switch (type) {                
        case globals.PN_TASK_ASSIGNED: {
                title = "Tarea - " + taskname;
                message = senderName + " te asignó tarea en " + facility + " . " + taskname;                                                                        
                $smart.sendPushNotificationWithReminder(remind, globals.ACTIVITY_TASK, task.idtask, title, task.idstaff,
                                                        message, {type: globals.IS_TASK, idtask: task.idtask, sound: globals.SOUND_ALERT_DING });
                return;
                break;
            }   
        case globals.PN_TASK_RECEIVED_BY_OWNER: {
                // do not ping if I am the owner
                if (alert.assignedby === app.user.idstaff)
                    return;             
                if (alert.assignedby == null)
                    return;           // old version compatibility  
                title = "Tarea Recibida";
                message = senderName + " recibió tarea: " + facility + " . " + taskname;                                 
                recipients.push(task.createdby);                     
                break;
            }     
        case globals.PN_TASK_STARTED: {
                title = "Tarea Comenzada";            
                message = senderName + " comenzó tarea en " + facility + " . " + taskname;                                                
                recipients.push(task.createdby);            
                break;
            }
        case globals.PN_TASK_FINISHED: {
                title = "Tarea Finalizada";
                message = senderName + " finalizó tarea en " + facility + " . " + taskname;                                                
                recipients.push(task.createdby);            
                break;
            }   
        case globals.PN_TASK_MARKFINISHED: {
                title = "Marcada como Finalizada";
                message = senderName + " marcó tarea como finalizada en " + facility + " . " + taskname;                                                
                recipients.push(task.createdby);            
                recipients.push(task.idstaff);             
                break;
            }   
        case globals.PN_TASK_DND: {
                title = "DND";
                message = senderName + " finalizó tarea (DND) en " + facility + " . " + taskname;                                                
                recipients.push(task.createdby);            
                recipients.push(task.idstaff);             
                break;
            }   
    /*
    case globals.PN_ALERT_PAUSED: {
    title = "Alerta Pausada";
    message = senderName + " ha pausado alerta en " + facility + " . " + alert.name + ": " + additionalText;                                    
    recipients.push(chief);
    break;
    }   
    case globals.PN_ALERT_RESOLVED: {
    title = "Alerta Resuelta";
    message = senderName + " finalizó alerta en " + facility + " . " + alert.name;                                    
    recipients.push(chief);
    recipients.push(alert.reportedby);
    $.merge(recipients, helper.getManagers());                
    break;
    }   
    case globals.PN_ALERT_DELETED: {
    title = "Alerta Eliminada";
    message = senderName + " ha eliminado alerta en " + facility + " . " + alert.name;                                    
    recipients.push(chief);
    recipients.push(alert.reportedby);
    break;
    }   
    case globals.PN_ALERT_RESUMED: {
    title = "Alerta Reanudada";
    message = senderName + " ha reanudado alerta en " + facility + " . " + alert.name;                                    
    recipients.push(chief);            
    break;
    }   
    case globals.PN_ALERT_COMMENT: {
    title = senderName;
    message = senderName + " dice: " + additionalText;
    recipients.push(chief);            
    recipients.push(alert.idstaff);
    break;
    }   
    case globals.PN_ALERT_EVALUATE: {
    title = senderName;
    message = senderName + " evaluó alerta en: " + facility + " . " + alert.name + ": " + additionalText + " estrellas.";            
    recipients.push(alert.idstaff);
    break;
    }   
    */
    }
    
    $.unique(recipients); // remove duplicates...don´t want to send same notification to the same person more than once..
    for (var i = 0; i < recipients.length;i++)
        $smart.sendPushNotification(title, recipients[i], message, customdata);
}

helper.getPNSoundTask = function(type) {
    var sound = globals.SOUND_OTHER;
    switch (type) {        
        case globals.PN_TASK_ASSIGNED :
            sound = globals.SOUND_ALERT_DING;
            break;
        case globals.PN_TASK_STARTED :
            sound = globals.SOUND_OTHER;
            break;
        case globals.PN_TASK_FINISHED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_TASK_MARKFINISHED :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_TASK_DND :
            sound = globals.SOUND_ALERT_DONE;
            break;
        case globals.PN_TASK_RECEIVED_BY_OWNER:
            sound = globals.SOUND_OTHER;
            break;
    /*case globals.PN_ALERT_PAUSED  : sound = globals.SOUND_OTHER; break;
    case globals.PN_ALERT_RESOLVED   : sound = globals.SOUND_ALERT_DONE; break;
    case globals.PN_ALERT_DELETED    : sound = globals.SOUND_ALERT_DONE; break;
    case globals.PN_ALERT_RESUMED    : sound = globals.SOUND_OTHER; break;
    case globals.PN_ALERT_ASSIGNED   : sound = globals.SOUND_ALERT_DING; break;
    case globals.PN_ALERT_REASSIGNED : sound = globals.SOUND_ALERT_DONE; break;
    case globals.PN_ALERT_COMMENT    : sound = globals.SOUND_OTHER; break;
    case globals.PN_ALERT_EVALUATE   : sound = globals.SOUND_OTHER; break;
    */
    }
    return sound;    
}

/*helper.getGuestActivity = function(guestactivity) {    
switch(guestactivity) {
case globals.GUEST_ACTIVITY_HAS_NOT_ARRIVED: return 'No ha arribado'; break;
case globals.GUEST_ACTIVITY_CHECKED_IN     : return 'Hizo Check In'; break;
case globals.GUEST_ACTIVITY_IN_HOUSE       : return 'Hospedado'; break;
case globals.GUEST_ACTIVITY_BREAKFAST      : return 'Desayunando'; break;
case globals.GUEST_ACTIVITY_LUNCH          : return 'Almorzando'; break;
case globals.GUEST_ACTIVITY_DINNER         : return 'Cenando'; break;
case globals.GUEST_ACTIVITY_ON_TOUR        : return 'De Tour (Fuera)'; break;
case globals.GUEST_ACTIVITY_CHECKED_OUT    : return 'Hizo Check Out'; break;
default: return '';
}
}
*/

helper.showGuestActivity = function(guestactivity, status) {    
    return helper.getGuestActivityName(guestactivity);
}

/////////////////////  GLOBALS FOR LOCABD ENTITIES ///////////////////

helper.prepareGlobals = function() {
    var promises = [];    
    var entitySets = [$localdb.db.AlertTypes,  $localdb.db.Staff, $localdb.db.Facilities, $localdb.db.Priorities, $localdb.db.GuestActivity];
    
    for (var i = 0; i < entitySets.length; i++) {
        promises.push(helper.loadEntity(entitySets[i]));
    }    
    return $.when.apply($, promises);     
}

helper.loadEntity = function(entitySet) {
    var deferred = $.Deferred();
    
    $localdb.toArray(entitySet)
        .done(function(array) {        
            globals[entitySet.name.toLowerCase()] = array;     
            deferred.resolve();
        })            
    return deferred.promise();    
}

helper.getGuestActivityName = function(idguestactivity) {    
    console.info(idguestactivity);
    console.info('OJOO');
    
    if (!globals.guestactivity)
        return '';    
    var result = $.grep(globals.guestactivity, function(e) {
        return e.idguestactivity == idguestactivity;
    });
    return result.length === 0 ? '' : result[0].name;   
}

helper.getAlertType = function(idalerttype) {    
    if (!globals.alerttypes)
        return '';    
    var result = $.grep(globals.alerttypes, function(e) {
        return e.idalerttype == idalerttype;
    });
    return result.length === 0 ? '' : result[0];   
}

helper.getAlertTypeName = function(idalerttype) {    
    if (!globals.alerttypes)
        return '';    
    var result = $.grep(globals.alerttypes, function(e) {
        return e.idalerttype == idalerttype;
    });
    return result.length === 0 ? '' : result[0].name;   
}

helper.getTaskName = function(idtasktype, instructions) {
    if (instructions == '' || instructions == null)
        return helper.getTaskTypeName(idtasktype)
    else
        return helper.getTaskTypeName(idtasktype) + ': ' + instructions 
}

helper.getTaskTypeName = function(idtasktype) {    
    if (!globals.tasktypes)
        return '';    
    var result = $.grep(globals.tasktypes, function(e) {
        return e.idtasktype === idtasktype;
    });
    return result.length === 0 ? '' : result[0].name;   
}

helper.getPriorityName = function(idpriority) {
    if (!globals.priorities)
        return '';    
    var result = $.grep(globals.priorities, function(e) {
        return e.idpriority === idpriority;
    });
    return result.length === 0 ? '' : result[0].name;    
}

helper.getPriorityColor = function(idpriority) {
    if (!globals.priorities)
        return '';    
    var result = $.grep(globals.priorities, function(e) {
        return e.idpriority === idpriority;
    });
    return result.length === 0 ? '' : result[0].backgroundcolor;    
}

helper.getFacilityName = function(idfacility) {
    if (!globals.facilities)
        return '';    
    var result = $.grep(globals.facilities, function(e) {
        return e.idfacility === idfacility;
    });
    return result.length === 0 ? '' : result[0].name;    
}

helper.getFacilityAndZones = function(idfacility) {
    if (!globals.facilities)
        return '';    
    var result = $.grep(globals.facilities, function(e) {
        return e.idfacility === idfacility;
    });
    
    if (result.length === 0)
        return '';
    var txt = helper.shortenHabitacion(result[0].name);
    if (result[0].zone != '')        
        txt += ' - ' + result[0].zone; 
    if (result[0].parentzone != '')        
        txt += ' - ' + result[0].parentzone;  
    
    return txt;
}

helper.getFacilityTypeName = function(idfacility) {
    if (!globals.facilities)
        return '';    
    var result = $.grep(globals.facilities, function(e) {
        return e.idfacility === idfacility;
    });
    return result.length === 0 ? '' : result[0].type;    
}

helper.getShortFacilityName = function(idfacility) {
    var name = helper.getFacilityName(idfacility);
    return helper.shortenHabitacion(name);    
}

helper.getFacilityLodging = function(idfacility) {
    if (!globals.facilities)
        return '';    
    var result = $.grep(globals.facilities, function(e) {
        return e.idfacility === idfacility;
    });
    return result.length === 0 ? 0 : result[0].lodging;    
}

helper.shortenHabitacion = function(facilityName) {
    return facilityName.replace('Habitación', 'Hab.');    
}

helper.hasPicture = function(uris) {
    return (uris != '' && uris != null);
}

helper.getAlertStatusName = function(idalertstatus) {
    switch (idalertstatus) {
        case 1 :
            return "Pendiente";
            break;
        case 2 :
            return "En Progreso";
            break;
        case 3 :
            return "Resuelta";
            break;
        case 4 :
            return "Pausada";
            break;
    }
    
    return "";
}

helper.getTaskStatusName = function(idtaskstatus) {
    switch (idtaskstatus) {
        case 1 :
            return "Sin Comenzar";
            break;
        case 2 :
            return "En Progreso";
            break;
        case 3 :
            return "Finalizada";
            break;
        case 4 :
            return "Pausada";
            break;
    }
    
    return "";
}

helper.getStaff = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? null : result[0];      
}

helper.getStaffFullName = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? '?' : result[0].name + ' ' + helper.fixNull(result[0].lastname);      
}

helper.getStaffFirstName = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? '' : result[0].name;      
}

helper.getAvatar = function(avatar) {
    if (avatar == null)
        return 'resources/imgs/misc/avatarunknown.png' 
    return avatar;
}

helper.getStaffAvatar = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? 'resources/imgs/misc/avatarunknown.png' : helper.getAvatar(result[0].avatar);      
}

helper.getStaffRole = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? '' : helper.getRole(result[0].role);      
}

helper.getStaffRoleName = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? '' : result[0].role;      
}

helper.getStaffTypeName = function(idstaff) {
    if (!globals.staff)
        return '';    
    var result = $.grep(globals.staff, function(e) {
        return e.idstaff === idstaff;
    });
    return result.length === 0 ? '' : result[0].type;      
}

helper.getModuleChiefs = function(idmodule) {
    if (!globals.staff)
        return null;    
    var result = [];
    if (idmodule === globals.MODULE_HOUSEKEEPING) {
        result = $.grep(globals.staff, function(e) {
            return e.idmodule === idmodule && e.role === globals.ROLE_HOUSEKEEPER;
        });        
    } else if (idmodule === globals.MODULE_MAINTENANCE) {
        result = $.grep(globals.staff, function(e) {
            return e.idmodule === idmodule && e.role === globals.ROLE_MAINTENANCECHIEF;
        });        
    }
    
    // Operations role is chief of both housekeeping and maintenance
    var operations = $.grep(globals.staff, function(e) {
        return e.role === globals.ROLE_OPERATIONS
    });

    result = result.concat(operations);
    
    result = $.map(result, function(e) {
        return e.idstaff;
    })      
    
    return result;
    //return result.length === 0 ? null : result[0].idstaff;       
}

// Does not return module chiefs...
helper.getModuleStaff = function(idmodule) {
    if (!globals.staff)
        return null;    
    var result = [];
    if (idmodule === globals.MODULE_HOUSEKEEPING) {
        result = $.grep(globals.staff, function(e) {
            return e.idmodule === idmodule && e.role === globals.ROLE_MAID;
        });        
    } else if (idmodule === globals.MODULE_MAINTENANCE) {
        result = $.grep(globals.staff, function(e) {
            return e.idmodule === idmodule && e.role === globals.ROLE_MAINTENANCE;
        });        
    }
    
    result = $.map(result, function(e) {
        return e.idstaff;
    })      
    
    return result;
    //return result.length === 0 ? null : result[0].idstaff;       
}

helper.getManagers = function() {
    if (!globals.staff)
        return [];    
    var result = [];
    r = $.grep(globals.staff, function(e) {
        return e.role === globals.ROLE_MANAGER;
    });        
    r.forEach(function(entry) {
        result.push(entry.idstaff);
    });
    
    return result.length === 0 ? [] : result;       
}

// Basically makes a translation for when language is spanish.
helper.getRole = function(role) {    
    if (!$lan.isSpanish())
        return role;
    else {
        if (role === globals.ROLE_HOUSEKEEPER)
            return "Ama de Llaves";
        else if (role === globals.ROLE_MAINTENANCECHIEF)
            return "Jefe de Mantenimiento";
        else if (role === globals.ROLE_MAID)
            return "Mucama";
        else if (role === globals.ROLE_MAINTENANCE)
            return "Mantenimiento";
        else if (role === globals.ROLE_OPERATIONS)
            return "Operaciones";
    }
    
    return role; 
}

helper.getModuleName = function(idmodule) {
    if (idmodule === globals.MODULE_HOUSEKEEPING)
        return "Ama de Llaves";
    if (idmodule === globals.MODULE_MAINTENANCE)
        return "Mantenimiento";
    return "";
}

helper.getBrotherModuleName = function(myidmodule) {
    if (myidmodule === globals.MODULE_HOUSEKEEPING)
        return "Mantenimiento";
    if (myidmodule === globals.MODULE_MAINTENANCE)
        return "Ama de Llaves";
    return "";
}

helper.getRoleModule = function(role) {    
    switch (role) {
        case globals.ROLE_MAID: 
        case globals.ROLE_HOUSEKEEPER :
            return globals.MODULE_HOUSEKEEPING;
            break;
        case globals.ROLE_MAINTENANCE: 
        case globals.ROLE_MAINTENANCECHIEF :
            return globals.MODULE_MAINTENANCE;
            break;        
        case globals.ROLE_MANAGER :
            return globals.MODULE_MANAGEMENT;
            break;
    }    
    return 0;
}

helper.isWorkingText = function(isWorking) {
    return (isWorking ? "En turno" : "Fuera de turno");
}

helper.isAvailableText = function(available) {    
    return (available === 1 ? "Disponible" : "No Disponible");
}
/*
helper.getLocationName = function(idlocation) {
switch(idlocation) {
case globals.ITEM_LOCATION_BATHROOM:  return "Baño"; break;
case globals.ITEM_LOCATION_FURNITURE:  return "Muebles"; break;
case globals.ITEM_LOCATION_SERVICES:  return "Servicios"; break;
case globals.ITEM_LOCATION_FACILITY:  return "Instalaciones"; break;
}
return "";
}
*/

helper.getItemImagePath = function(image) {
    if (image === "" || image === null)
        return "resources/imgs/items/general.jpg";
    else
        return "resources/imgs/items/" + image + ".jpg";
}

helper.getItemCategoryImagePath = function(image) {
    if (image === "" || image === null)
        return "resources/imgs/items/general.jpg";
    else
        return "resources/imgs/itemcategories/" + image + ".jpg";
}

///// translate ////

helper.trans = function(texto) {
    if (globals.lan == "es")
        return "Inicio";
    else
        return "home";
}

// CHANGE CONNECTION ICON COLOR 
helper.setConnectionIconColor = function(status) {    
    switch (status) {
        case globals.ONLINE:
            $(".connectionStatus").removeClass('isOffline apiCallFailed isCallingAPI').addClass('isOnline');
            break;       
        case globals.OFFLINE:
            $(".connectionStatus").removeClass('isOnline apiCallFailed isCallingAPI').addClass('isOffline');
            break;    
        case globals.APICALLERROR:
            $(".connectionStatus").removeClass('isOffline isOnline isCallingAPI').addClass('apiCallFailed');
            break;       
        case globals.APICALLING:
            $(".connectionStatus").removeClass('isOffline isOnline apiCallFailed').addClass('isCallingAPI');
            break;               
    }   
}

/// ANIMATE
helper.hide = function(id) {
    $(id)
        .css({opacity: 0.0, visibility: "visible"})
        .animate({opacity: 0}, 0);        
}

helper.show = function(id) {
    $(id)
        .css({opacity: 0.0, visibility: "visible"})
        .animate({opacity: 1.0}, 500);
}

/***** USER ALERTING AND INTERACTION *******/

helper.smallBottomAlert = function(message) {
    $(".bottomMessage").html(message);
}

helper.smallBottomAlertRestore = function() {
    $(".bottomMessage").html('<i class="mdi mdi-checkbox-marked-circle"></i>');
}


helper.showAlert = function(message, title, callback) {
    if (!navigator.notification)
        return;
    //This is the cordoba alert method
    navigator.notification.alert(loc.t(message), callback || function () {
    }, loc.t(title), 'OK');
};

helper.showError = function(message) {     
    helper.showAlert(message, 'Error');
};

helper.showConfirm = function(message, title, callback) {
    navigator.notification.confirm(loc.t(message), callback || function () {
    }, loc.t(title), ['OK', 'Cancel']);
}

// The Loading Message does not show if you are using flat or nova styles. It only shows the animation.
// You can use together with showSmartAlert..

helper.showLoading2 = function(message, type) {
    type = typeof type == 'undefined' ? 'alert-info' : type;
    app.mobileApp.showLoading();
    helper.showSmartAlert(type, message, false);
}

helper.hideLoading2 = function() {
    app.mobileApp.hideLoading();
    helper.closeSmartAlert();
}

helper.pleaseWait = function() {
    helper.showLoading(loc.t("Por favor espere..."));          
}

helper.showLoading = function(message) {
    var msg = message === null ? 'Espere...' : message;
    app.mobileApp.changeLoadingMessage(msg);    
    app.mobileApp.showLoading();
}

helper.hideLoading = function() {     
    app.mobileApp.changeLoadingMessage('Espere');    
    app.mobileApp.hideLoading();     
}

helper.showWorking = function(message) {
    $("#dingdonemessagecontent").html(message || '');
    $("#dingdonemessage").show();
}

helper.hideWorking = function() {
    $("#dingdonemessage").hide();    
}

///// BOOTSTRAP

helper.showSmartAlert = function(type, message, hasCloseButton, timeout) {
    if (!$('#smartAlert').length)
        return;     // if element does not exists, return
    $("#smartAlert").removeClass('hidden');
    $("#smartAlert").addClass(type);
    $("#smartAlert button").after("");  
    $("#smartAlert button").after(loc.t(message));  
    hasCloseButton = typeof hasCloseButton !== 'undefined' ? hasCloseButton : true;
    if (!hasCloseButton)
        $("#smartAlert button").remove();
    if (timeout != null)
        setTimeout(function() {
            helper.closeSmartAlert()
        }, timeout);
}
   
helper.closeSmartAlert = function() {
    if (!$('#smartAlert').length)
        return; 
    $("#smartAlert").addClass('hidden');
    $("#smartAlert button").after("");  
}

helper.showDialog = function(name) {
    app.homeView.get(name).data("kendoWindow").center().open();
    //helper.fixNPTIssue(); 
}

helper.dialogComment = null;

helper.showDialogComment = function(prompt, success) {
    if (helper.dialogComment === null)
        helper.dialogComment = $("#dialogComment").kendoWindow({        
                                                                   width: "90%",
                                                                   title: '',
                                                                   visible: false,
                                                                   draggable: false,
                                                                   modal: true,
                                                                   maximize: false,
                                                                   actions: ['Close'],                      
                                                                   activate: function() {                                
                                                                       setTimeout(function() {
                                                                           $('#dialogCommentText').select();
                                                                           $('#dialogCommentText').focus();
                                                                       }, 50);                    
                                                                   }
                                                               }).data("kendoWindow");
    
    $("#dialogCommentText").val(''); 
    $("#dialogCommentRequiredMessage").hide();
    
    //$("#dialogComment").parent().removeClass('magictime magic spaceOutUp');    
    
    $("#dialogCommentPrompt").html(prompt);
    
    $("#dialogCommentbuttonNO").off('click'); // Prevent stacking of same event handler
    $("#dialogCommentbuttonNO").on('click', function() {
        //$("#dialogComment").parent().addClass('magictime magic ');
        helper.dialogComment.close();    
    });
    $("#dialogCommentbuttonYES").off('click'); // Prevent stacking of same event handler. clear event handler
    $("#dialogCommentbuttonYES").on('click', function() {
        var comment = $("#dialogCommentText").val();        
        if (comment === '') {
            $("#dialogCommentRequiredMessage").show();
            $('#dialogCommentText').select();
            return;
        }
        //$("#dialogComment").parent().addClass('magictime spaceOutUp');
        helper.dialogComment.close();            
        if (success)
            success(comment);
    });
    
    //helper.dialogComment.center().open();   
    helper.dialogComment.open();   
}

helper.dialogYNJ = null;

helper.showDialogYNJ = function(prompt, success) {    
    if (helper.dialogYNJ === null)
        helper.dialogYNJ = $("#dialogYNJ").kendoWindow({        
                                                           width: "90%",
                                                           title: '',
                                                           visible: true,
                                                           draggable: false,
                                                           modal: true,
                                                           mazimize: false,
                                                           actions: ['Close'],      
                                                           activate: function() {                                
                                                               setTimeout(function() {
                                                                   $('#dialogYNJreason').select();
                                                                   $('#dialogYNJreason').focus();
                                                               }, 50);                    
                                                           }
                                                       }).data("kendoWindow");
    
    $("#dialogYNJreason").val('');        
    $("#dialogRequiredMessage").hide();
    
    //$("#dialogYNJ").parent().removeClass('magictime magic spaceOutUp');    
    
    $("#dialogYNJPrompt").html(prompt);
    
    $("#dialogYNJbuttonNO").off('click'); // Prevent stacking of same event handler
    $("#dialogYNJbuttonNO").on('click', function() {
        //$("#dialogYNJ").parent().addClass('magictime magic ');
        helper.dialogYNJ.close();    
    });
    $("#dialogYNJbuttonYES").off('click'); // Prevent stacking of same event handler. clear event handler
    $("#dialogYNJbuttonYES").on('click', function() {
        var reason = $("#dialogYNJreason").val();        
        if (reason === '') {
            $("#dialogRequiredMessage").show();
            $('#dialogYNJreason').select();
            return;
        }
        //$("#dialogYNJ").parent().addClass('magictime spaceOutUp');
        helper.dialogYNJ.close();            
        if (success)
            success(reason);
    });
        
    //helper.dialogYNJ.data("kendoWindow").center().open();
    helper.dialogYNJ.open();
}
    
helper.dialogYN = null;

// destroy = true => es para borrar, etc, entonces el botón de YES se pone en rojo

helper.showDialogYN = function(prompt, success, destroy, nop) {
    if (helper.dialogYN === null)
        helper.dialogYN = $("#dialogYN").kendoWindow({        
                                                         width: "90%",
                                                         title: '',
                                                         visible: false,
                                                         draggable: false,
                                                         modal: true,
                                                         mazimize: false,
                                                         actions: ['Close'],                                                
                                                     }).data("kendoWindow");
    
    //$"#dialogYN").parent().removeClass('magictime magic spaceOutUp');        
    
    $("#dialogYNPrompt").html(prompt);
    
    $("#dialogYNbuttonNO").off('click'); // Prevent stacking of same event handler
    $("#dialogYNbuttonNO").on('click', function() {
        //$("#dialogYN").parent().addClass('magictime magic');
        helper.dialogYN.close();    
        if (nop)
            nop();
    });
    if (destroy)
        $("#dialogYNbuttonYES").addClass('b-main4');
    else
        $("#dialogYNbuttonYES").removeClass('b-main4');
    $("#dialogYNbuttonYES").off('click'); // Prevent stacking of same event handler. clear event handler
    $("#dialogYNbuttonYES").on('click', function() {
        //$("#dialogYN").parent().addClass('magictime spaceOutUp ');
        helper.dialogYN.close();            
        if (success)
            success();
    });
        
    helper.dialogYN.center().open();    
}

helper.dialogSolution = null;

helper.showSolutionTextDialog = function(prompt, success, solutionrequired) {
    if (helper.dialogSolution === null)
        helper.dialogSolution = $("#dialogSolution").kendoWindow({        
                                                                     width: "100%",
                                                                     title: '',
                                                                     visible: true,
                                                                     draggable: false,
                                                                     modal: true,
                                                                     mazimize: false,
                                                                     actions: ['Close'],      
                                                                     activate: function() {                                
                                                                         setTimeout(function() {
                                                                             $('#dialogSolutionreason').select();
                                                                             $('#dialogSolutionreason').focus();
                                                                         }, 50);                    
                                                                     }
            
                                                                 }).data("kendoWindow");
    
    $("#dialogSolutionreason").val('');        
    $("#dialogSolutionRequiredMessage").hide();
    
    //$("#dialogYNJ").parent().removeClass('magictime magic spaceOutUp');    
    
    $("#dialogSolutionPrompt").html(prompt);
    
    $("#dialogSolutionbuttonNO").off('click'); // Prevent stacking of same event handler
    $("#dialogSolutionbuttonNO").on('click', function() {
        //$("#dialogYNJ").parent().addClass('magictime magic ');
        helper.dialogSolution.close();    
    });
    $("#dialogSolutionbuttonYES").off('click'); // Prevent stacking of same event handler. clear event handler
    $("#dialogSolutionbuttonYES").on('click', function() {
        var solutiontext = $("#dialogSolutionreason").val();        
        if (solutiontext === '' && solutionrequired) {
            $("#dialogSolutionRequiredMessage").show();
            $('#dialogSolutionreason').select();
            return;
        }        
        helper.dialogSolution.close();            
        if (success)
            success(solutiontext);
    });
        
    //helper.dialogYNJ.data("kendoWindow").center().open();
    helper.dialogSolution.open();
}

helper.dialogMessage = null;

helper.showDialogMessage = function(title, prompt, success) {
    if (helper.dialogMessage === null)
        helper.dialogMessage = $("#dialogMessage").kendoWindow({        
                                                                   width: "90%",
                                                                   title: '',
                                                                   visible: false,
                                                                   draggable: false,
                                                                   modal: true,
                                                                   mazimize: false,
                                                                   actions: ['Close'],                                                
                                                               }).data("kendoWindow");
    
    $("#dialogMessagePrompt").html(prompt);
    
    $("#dialogMessageClose").off('click'); // Prevent stacking of same event handler. clear event handler
    $("#dialogMessageClose").on('click', function() {        
        helper.dialogMessage.close();            
        if (success)
            success();
    });
        
    helper.dialogMessage.center().open();
}

helper.windowMessage = null;

helper.showWindowMessage = function(prompt) {
    if (helper.windowMessage === null)
        helper.windowMessage = $("#windowMessage").kendoWindow({        
                                                                   width: "100%",
                                                                   title: false,
                                                                   visible: false,
                                                                   draggable: false,
                                                                   //modal: true,
                                                                   mazimize: false,
                                                                   //actions: ['Close'],                                                            
                                                               }).data("kendoWindow");
    
    $("#windowMessagePrompt").parent().parent().css('background-color', '#E52E86');
    $("#windowMessagePrompt").parent().css('background-color', '#E52E86');
    $("#windowMessagePrompt").html(prompt);
        
    helper.windowMessage.open();
}


helper.notificationWindow = null;


helper.showPushNotification = function(args, iOS) {

  //  args = {type: 1, alert: 'Cómo vas con eso?', category: 'Javier dice:', 
  //          alertname: 'A/C no function', facility: 'Habitación 301'};
    

    if (helper.notificationWindow === null)
        helper.notificationWindow = $("#windowPushNotification").kendoWindow({        
                                                                   width: "100%",
                                                                   title: false,
                                                                   visible: false,
                                                                   draggable: false,
                                                                   //modal: true,
                                                                   mazimize: false,
                                                                   //actions: ['Close'],                                                            
                                                               }).data("kendoWindow");
    
    $("#PushNotificationAlertName").html(''); 
    $("#PushNotificationFacilityName").html('');
    
    var background_color = '#ff362f'
   
    
    if (args.type == globals.NOTIFICATION_TASK) {
        background_color ='#00bcd4';        
    }
    
    $("#PushNotificationPrompt").parent().parent().css('background-color', background_color );
    $("#PushNotificationPrompt").parent().css('background-color', background_color);
   
    if (iOS == true) {
        $("#PushNotificationTitle").html(args.category);
        $("#PushNotificationPrompt").html(args.alert);
        $("#PushNotificationAlertName").html(args.alertname); 
        $("#PushNotificationFacilityName").html(args.facility);
        
        $("#PushNotificationGo").unbind('click');
        $("#PushNotificationGo").click(function() {
             helper.notificationWindow.close();
             app.homeView.goPushNotificationAlert(args.idalert); 
             
        })
        
    } 
    else { // Android
        $("#PushNotificationTitle").html(args.payload.title);
        $("#PushNotificationPrompt").html(args.message);
        if (typeof args.payload.customData != 'undefined') {
            $("#PushNotificationAlertName").html(args.payload.customData.alertname); 
            $("#PushNotificationFacilityName").html(args.payload.customData.facility);
        }
        
        $("#PushNotificationGo").unbind('click');
        $("#PushNotificationGo").click(function() {
            helper.notificationWindow.close() 
            if (typeof args.payload.customData != 'undefined') {
                app.homeView.goPushNotificationAlert(args.payload.customData.idalert);   
            }
        })
            
    }
    
        
    helper.notificationWindow.open();
}






// Adds data-transition-native = false, to telerik dialogs, to avoid the app to freeze 
//because of Native Page Transitions enabled. (Cordova plugin)
helper.fixNPTIssue = function() {    
    //$('.k-window-actions [role="button"]').attr('data-transition-native', 'false');
    $('.k-window-actions [role="button"]').hide();
}

/////////////////////////////////////////////////////////////////////////////////////////



/***************** DOWNLOAD APK AND INSTALL ***********************/

function downloadApkAndroid(data) {
    var fileURL = "cdvfile://localhost/persistent/CegekaMon.apk";

    var fileTransfer = new FileTransfer();
    var uri = encodeURI(data.android);

    fileTransfer.download(
        uri,
        fileURL,
        function (entry) {
            console.log("download complete: " + entry.fullPath);

            promptForUpdateAndroid(entry);
        },
        function (error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        },
        false, {

        }
        );
}
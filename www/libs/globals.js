/*
  SuisseWorks (c) 2014
  Matthias Malek
  August, 2014	
*/




globals = {};

//globals.version = "0.500";
// idstaff and idhotel are in app.idstaff and app.idhotel.

globals.NOTIFICATION_ALERT = 1;
globals.NOTIFICATION_TASK  = 2;


globals.IS_ALERT = 1;
globals.IS_TASK  = 2;

globals.MAX_INT = 2147483647;  // Mysql

globals.ACTION_REPORTED           = 0;    // Default    
globals.ACTION_RECEIVED_BY_MODULE = 1;    // Lo recibió el Jefe de Mantenimiento o la Ama de LLaves
globals.ACTION_ASSIGNED           = 2;    
globals.ACTION_REASSIGNED         = 3;    // Creo quen no se ocupa (evaluar). Al reasignar, pasamos al action = 1.
globals.ACTION_RECEIVED_BY_OWNER  = 4;    // Lo recibió la persona a la cual se le asignó la alerta/tarea
globals.ACTION_WILLCHECK          = 5;    // Owner indicated when he will check the alert...willcheck field is set.
globals.ACTION_STARTED            = 6;    // 
globals.ACTION_PAUSED             = 7;
globals.ACTION_RESUMED            = 8;    // Se resume la alerta/tarea luego de una pausa
globals.ACTION_RESOLVED           = 9;

globals.ACTION_ALERT_TO_TASK      = 10;   // NEW.....o.....ACTION_TASK_FROM_ALERT
//globals.ACTION_TASK_ALREADY_DONE  = 11;   // When creating/reporting work already done...

globals.ACTION_ESTIMATED_DURATION = 12;
globals.ACTION_PICTURE            = 13;
globals.ACTION_REOPEN             = 14;

globals.ACTION_COMMENT            = 50;

/////
globals.GUEST_ACTIVITY_HAS_NOT_ARRIVED = 1;
globals.GUEST_ACTIVITY_CHECKED_IN      = 2;
/*globals.GUEST_ACTIVITY_IN_HOUSE        = 2;
globals.GUEST_ACTIVITY_BREAKFAST       = 3;
globals.GUEST_ACTIVITY_LUNCH           = 4;
globals.GUEST_ACTIVITY_DINNER          = 5;
globals.GUEST_ACTIVITY_ON_TOUR         = 6;*/
globals.GUEST_ACTIVITY_CHECKED_OUT     = 3;



/*
globals.ACTION_REPORTED           = 0;    // Default    
globals.ACTION_RECEIVED_BY_MODULE = 1;    // Lo recibió el Jefe de Mantenimiento o la Ama de LLaves
globals.ACTION_RECEIVED_BY_OWNER  = 2;    // Lo recibió la persona a la cual se le asignó la alerta/tarea
globals.ACTION_REASSIGNED         = 3;    // Creo quen no se ocupa (evaluar). Al reasignar, pasamos al action = 1.
globals.ACTION_WILLCHECK          = 4;    // Owner indicated when he will check the alert...willcheck field is set.
globals.ACTION_STARTED            = 5;    // 
globals.ACTION_RESOLVED           = 6;
globals.ACTION_ASSIGNED           = 7;    
globals.ACTION_PAUSED             = 8;
globals.ACTION_RESUMED            = 9;    // Se resume la alerta/tarea luego de una pausa

globals.ACTION_COMMENT            = 50;

*/

// PUSH NOTICATIONS

globals.PN_ALERT_CREATED          = 1;
globals.PN_ALERT_RECEIVED         = 2; 
globals.PN_ALERT_STARTED          = 3;
globals.PN_ALERT_PAUSED           = 4;
globals.PN_ALERT_RESOLVED         = 5;
globals.PN_ALERT_DELETED          = 6;
globals.PN_ALERT_RESUMED          = 7;
globals.PN_ALERT_ASSIGNED         = 8;
globals.PN_ALERT_REASSIGNED       = 9;
globals.PN_ALERT_COMMENT          = 10;
globals.PN_ALERT_EVALUATE         = 11;
globals.PN_ALERT_DND              = 12;
globals.PN_ALERT_MARKFINISHED     = 13;
globals.PN_ALERT_WILLCHECK        = 14;
globals.PN_ALERT_TAKEN            = 15;
globals.PN_RECEIVED_BY_OWNER      = 16;
globals.PN_ALERT_TASKCREATED      = 17;





globals.PN_TASK_STARTED              = 3;  
globals.PN_TASK_FINISHED             = 4;  
globals.PN_TASK_DND                  = 5;  
globals.PN_TASK_MARKFINISHED         = 6;  
globals.PN_TASK_ASSIGNED             = 7;  
globals.PN_TASK_RECEIVED_BY_OWNER    = 8;  



// TAGS


globals.TAG_DND                = 1; /// ??
globals.TAG_MARKED_AS_FINISHED = 2;
globals.REASSIGNED             = 3; //
globals.TAG_TAKEN              = 4;  // Cuando tomo una alerta (no me la asignan)
globals.TAG_ALREADY_DONE       = 6;
globals.TAG_ESCALATED          = 7;
globals.TAG_MARKED_AD_NOT_DONE = 8;



//ACTIVITY TYPES
globals.ACTIVITY_ALERT = 1;
globals.ACTIVITY_TASK  = 2;
globals.ACTIVITY_OTHER = 3;  


globals.MODULE_MANAGEMENT   = 1;
globals.MODULE_FRONTDESK    = 2;
globals.MODULE_HOUSEKEEPING = 3;
globals.MODULE_MAINTENANCE  = 4;
globals.MODULE_OPERATIONS   = 5;





globals.ROLE_NONE             = 0;
globals.ROLE_MAINTENANCE      = 1;
globals.ROLE_MAINTENANCECHIEF = 2;
globals.ROLE_MAID             = 3;
globals.ROLE_HOUSEKEEPER      = 4;
globals.ROLE_OPERATIONS       = 5;
globals.ROLE_FRONTDESK        = 6;
globals.ROLE_MANAGER          = 7;

globals.ROLE_SUPUERUSER       = 100;


// ALERT TYPE CATEGORIES
globals.alertCategories         = ['Problema','Solicitud', 'LOST & FOUND']

globals.ALERT_CATEGORY_ISSUE        = 1;     // Problema
globals.ALERT_CATEGORY_REQUEST      = 2;     // Pedido /Solicitud
globals.ALERT_CATEGORY_LOSTANDFOUND = 3;     // Lost & Found   




// VISIBLITY to ALERTS 
globals.VISIBILITY_ALL = 0;
globals.VISIBILITY_MY_DEPARTMENT_PLUS_ALERTS_WITH_NO_DEPARTMENT = 1;
globals.VISIBILITY_MY_DEPARTMENT_ONLY = 2;




// ITEM CATEGORY

globals.itemCategories = ['Baño','Muebles','Servicios','Instalaciones'];

globals.ITEM_LOCATION_BATHROOM  = 1;
globals.ITEM_LOCATION_FURNITURE = 2;
globals.ITEM_LOCATION_SERVICES  = 3;
globals.ITEM_LOCATION_FACILITY  = 4;



//LOGIN
globals.LOGIN_SUCCESS           = 1;
globals.LOGIN_SUCCESS_OFFLINE   = 7;

globals.LOGIN_FAIL              = -1;
globals.INVALID_CREDENTIALS     = 2;
globals.INVALID_USER_ROLE       = 3;
globals.USER_DOES_NOT_EXIST     = 4;
globals.FORCE_LOGIN             = 5;
globals.DEVICE_BLOCKED          = 6;

//OFFLINE
globals.APICALLERROR        = -2;
globals.OFFLINE             = -1;
globals.ONLINE              = 1;
globals.APICALLING          = 2;


globals.TABSTRIP_HOME     = 0;
globals.TABSTRIP_PROFILE  = 1;
globals.TABSTRIP_CALENDAR = 2;
globals.TABSTRIP_ALERT    = 3;


globals.STAFF_STATUS_ACTIVE    = 1;
globals.STAFF_STATUS_INACTIVE  = 2;



//FULL SYNC
globals.FULL_SYNC_FAILED    = -1;


///// TASK STATUSES

/*
globals.TASK_STATUS_NOT_STARTED  = 1;
globals.TASK_STATUS_IN_PROGRESS  = 2;
globals.TASK_STATUS_PAUSED       = 3;
globals.TASK_STATUS_FINISHED 	= 100;
*/

globals.ALERT_STATUS_PENDING     = 1;
globals.ALERT_STATUS_IN_PROGRESS = 2;
globals.ALERT_STATUS_PAUSED      = 3;
globals.ALERT_STATUS_RESOLVED    = 100;



/// SOUNDS
globals.SOUND_ALERT_DING       = 1;
globals.SOUND_ALERT_DONE       = 2;
globals.SOUND_OTHER            = 3;  // meh
globals.SOUND_CHAT             = 5;
//globals.SOUND_ALERT_EXTERIOR   = 4;



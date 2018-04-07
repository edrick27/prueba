// Matthias Malek
// 11 Julio, 2016

var idhotel,    // required for api calls.
    idstaff,
    role,    // user role
    paused = false,  
    apiURL = '',
    xhr = new XMLHttpRequest(),
    
    // Alerts
    intervalUpdateAlerts     = null,
    alertsInterval           = 60,   // seconds;
    maxLastmodifiedAlerts;    
    
    


self.addEventListener("message", function(e) {  
    switch(e.data.message) {
        case "init": {
            idhotel = e.data.idhotel;
            idstaff = e.data.idstaff;
            role    = e.data.role;
            apiURL = e.data.apiurl;            
            alertsInterval = e.data.alertsinterval;
            maxLastmodifiedAlerts = e.data.maxlastmodifiedalerts; 
            limit   = e.data.limit;
            //self.postMessage(maxLastmodifiedAlerts);            
            break;
            //setInterval(function() {self.postMessage("MESSAGE FROM WORKER")},2000);            
        }
        case "updatelastmodifiedalerts": {
            maxLastmodifiedAlerts = e.data.maxlastmodifiedalerts;
            //self.postMessage(maxLastmodifiedAlerts);               
            break;
        }
        case "start": {
            intervalUpdateAlerts = setInterval(function() {checkAlertUpdates()}, alertsInterval * 1000);
            break;            
        }
        
        case "finish": {
            clearInterval(intervalUpdateAlerts);
            intervalUpdateAlerts = null;
           // console.log('finish');
           // self.close();
            break;
        }
        
        case "pause": {
            paused = true;
            break;            
        }
        
        case "resume": {
            paused = false;
            break;            
        }
        
        case "callapi": {
            checkAlertUpdates();
            break;
        }
        
        case "changeUpdateInterval": {
            //TODO    
        }
        
    }    
    
});


xhr.onreadystatechange = function(){
    if (xhr.readyState == 4 && xhr.status == 200) {
        // retrieve result                
        self.postMessage(xhr.response);
    }
}


function checkAlertUpdates() {
    if (paused == true) {        
       //console.info('Worker Paused'); return;
    }
    // console.info('Worker'); 
    //self.postMessage(apiURL);               
    //console.log("Checking for Updates");
    //console.log("Lastmodified=>" + maxLastmodifiedAlerts);
    
    if (maxLastmodifiedAlerts == null)
        xhr.open("GET",apiURL + "alerts?idhotel=" + idhotel +"&limit="+limit+ "&idstaff=" + idstaff + "&role=" + role);    
    else 
        xhr.open("GET",apiURL + "alerts?idhotel=" + idhotel+"&limit="+limit+ "&idstaff=" + idstaff + "&role=" + role + "&condition=t.lastmodified>'" + maxLastmodifiedAlerts + "'");            
    
    xhr.timeout = 2000;
    
    xhr.send();
}

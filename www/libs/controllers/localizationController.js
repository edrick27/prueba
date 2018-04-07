// Matthias Malek
// SuisseWorks
// Jan, 2016
// Implements 2 Controllers (Date and Language) for handling localization specific aspects, such as language, timezone, date and times....
// For DateTime functions we use the moment.js utility => http://momentjs.com/
// For Timezone we use => http://momentjs.com/timezone/docs/


(function (window) {
    
/**************************************************************/
/*            DateController                                  */
/**************************************************************/
    
    function DateController() {
        
        // Ésto no es necesario, ya que las fechas se despliegan en el timezone en el que se encuentra el celular.
        //this.timezone = 'America/Costa_Rica';
        
        //"moment().format("dddd, MMMM Do YYYY, h:mm:ss a");"
        
        var _dateFormat = "dddd DD, ha";
        var _timeFormat = "";
        
        var _24clock   = true;   // If false, we use am/pm (12 hour clock);
        var locale     = "es";
        

        this.init = function() {
            this.locale(locale);            
        }
        
        this.locale = function(lang) {            
            moment.locale(lang);            
        }
        
        
        
        // IMPORTANT...USES Timezone
       
        
        
        this.today = function() {
            return moment().format("dddd, MMMM DD, YYYY, h:mm a");
        }
        
        this.todayDate = function() {
            return moment().format("dddd, MMMM DD, YYYY");    
        }
        
        this.todayTime = function() {
            return moment().format("hh:mm:ss a");
        }
        
        this.moment = function(format) {
            return moment().format(format);
        }
        
        
        
        // Used for filtering stuff later than yesterday. (ex: today only)
        // Substract 1 sec from today... we get yesterday at 23.59:59, but need to add/substract utcOffset
        this.yesterday = function() {
            var date = moment();
            date.hours(0);
            date.minutes(0);
            date.seconds(0);
            date.subtract(1, 'seconds');
            date.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
            
            return date;
        }
        
         this.tomorrow = function() {
            var date = moment();
            date.hours(23);
            date.minutes(59);
            date.seconds(59);
            //date.add(1, 'seconds');
           
            date.add(moment().utcOffset()*-1,'minutes'); // fix to timezone
            
            return date;
        }
        
         this.tomorrowNoUTCOffset = function() {
            var date = moment();
            date.hours(23);
            date.minutes(59);
            date.seconds(59);
            //date.add(1, 'seconds');
                        
            
            return date;
        }
        
        
        
        // RETURNS TIMESTSTAMP = Current UTC time as primite value => Milliseconds since Unix Epoch on January 1st, 1970 at UTC.
        // Javascript timestamps are in milliseconds as opposed to php timestamps, which are in seconds.
        this.timestamp = function() {            
            return moment().utc().valueOf();
        }
        
        this.timestampUTC = function() {
            return moment().add(  moment().utcOffset() * (-1),'minutes').utc().valueOf();
        }
        
        this.timestampUTCNoTime = function() {
            var date = moment().add(  moment().utcOffset() * (-1),'minutes').utc();
           /* date.hours(0);
            date.minutes(0);
            date.seconds(0);*/
            return date.valueOf();
        }
        
        
        
        this.toUTC = function(date) {
            //return moment(date).utc().valueOf();
            return moment(date).add(  moment().utcOffset() * (-1),'minutes').utc().valueOf();    
        }
        
         this.toUTC2 = function(date) {
            //return moment(date).utc().valueOf();
            return moment(date).add(  moment().utcOffset() * (-1),'minutes').utc();    
        }
        
        this.toCurrentTimeZone = function(date) {
            return moment(date).add(moment().utcOffset(),'minutes');
        }
        
        
        
        // IMPORTANTE: Si la hora es gmt- 6 (costa rica), para obtener el utc, hay que sumarle +, por eso multiplicamos por -1.
        //             Si la hora es gmt + 2, hay que restarle 2 horas para obtner el utc..
        this.utcTime = function() {            
            return moment().add(  moment().utcOffset() * (-1),'minutes').utc();
            
        }
        
        // javascript timestemp to MySQL DateTime Format ("Y-m-d H:i:s")
        // This is used when sending dates in the condition parameter sent to the api
        this.toMySQLFormat = function(timestamp) {
            return moment(timestamp).format("YYYY-MM-D HH:mm:ss");            
        }
        
        
        
        // Display using default format
        this.date = function(date, showText) {  
            
            if (showText && this.isToday(date)) {
                return "HOY"; // cambiar/ traducir dependiendo de locale
            }
            else if (showText && this.isYesterday(date)) {
                return "AYER"; // cambiar/ traducir dependiendo de locale
            }            
            else {            
                date = moment(date).add(moment().utcOffset(),'minutes');
                return date.format(_dateFormat);
            }
            return date;            
        }
        
       
        
        // IMPORTANTE, Supone que el date está en UTC...
        // Se le agrega el utcOffset a la fecha para obtener la fecha/hora en el timezone del celular
        this.datef = function(date, format, showToday) { // if true, it will return 'Today' and 'Yesterday'  if applicable. Default is false.                        
            showToday = (typeof showToday === 'undefined' ? false: showToday);                        
            if (showToday && this.isToday(date)) 
                return "HOY"; 
            else if (showToday && this.isYesterday(date))
                return "AYER";
            else
            {
                 return moment(date).add(moment().utcOffset(),'minutes').format(format);
            }             
        }
        
        //Has no time, so we dont need to offset utc
        this.datefNoUTC = function(date, format, showToday) {
              showToday = (typeof showToday === 'undefined' ? false: showToday);                        
            if (showToday && this.isTodayNoUTC(moment(date)))
                return "HOY" 
            else {
                 return moment(date).format(format);
            }        
            
        }
        
        
        this.isToday = function(date) {
            var today = moment();
            var date  = moment(date).add(moment().utcOffset(),'minutes');
            return (today.date() === date.date() && today.month() === date.month() && today.year() === date.year());
        }
        
       
        
        // ??
        this.isYesterday = function(date) {
            var yesterday = moment().subtract(1,"days");
            var date  = moment(date).add(moment().utcOffset(),'minutes');
            return (yesterday.date() === date.date() && yesterday.month() === date.month() && yesterday.year() === date.year());
        }
        
        
        // Shows time if reported today "h:mm a"
        // Shows AYER a las "h:mm a"
        // or Shows 13 Aug a las "h:mm a" if before yesterday
        
        // assumes date is is current timezone and is a moment already
        this.isTodayNoUTC = function(date) {
            var today = moment();            
            return (today.date() === date.date() && today.month() === date.month() && today.year() === date.year());
        }
        
        // assumes date is is current timezone and is a moment already
        this.isYesterdayNoUTC = function(date) {
            var yesterday = moment().subtract(1,"days");            
            return (yesterday.date() === date.date() && yesterday.month() === date.month() && yesterday.year() === date.year());
        }
        
        this.showAlertReportedDate = function(date) {
            var date = moment(date).add(moment().utcOffset(),'minutes'); // Time Zone offeset
            if (this.isTodayNoUTC(date))
                return "HOY a las " + date.format("h:mm a");
            else if (this.isYesterday(date))
                return  "AYER a las " + date.format("h:mm a");
            else
                return  date.format("D MMM")  +" " + date.format("h:mm a");
        }
        
        this.showTaskStartDate = function(date) {
            var date = moment(date).add(moment().utcOffset(),'minutes'); // Time Zone offeset
            if (this.isTodayNoUTC(date))
                return "HOY a las " + date.format("h:mm a");
            else if (this.isYesterday(date))
                return  "AYER a las " + date.format("h:mm a");
            else
                return  date.format("D MMM")  +" " + date.format("h:mm a");
        }
        
    } 
    
    window.DateController = DateController;
    
    
/**************************************************************/
/*            LanguageController                              */
/**************************************************************/
    
    function LanguageController() {
        
        _lang     = "es";    
        _loaded   = false;
        _error    = false;
        _basepath = 'libs/localization/lang/';
        
        _langString = '';
        
        this.isSpanish = function() {
            return _lang === "es";
        }
                
        this.getLanFileName = function() {        
            return _basepath + _lang + '.js';
        }
        
        this.loadLanguage = function() {
            var deferred = $.Deferred();        
            if (this.isSpanish()) 
                deferred.resolve(true); 
            else {    
                var fileName = this.getLanFileName();
                $.getScript(fileName)
                .done(function( script, textStatus ) {            
                    _loaded = true;        
                    deferred.resolve(true);
                })
                .fail(function( jqxhr, settings, exception ) {            
                    _loaded = false;
                    _error = true;
                    deferred.reject(jqxhr);
                });       
           }
            
            return deferred.promise();
        }
        
        // Translates HTML elements who have the translate attribute
        // Ej: <span translate>Text to be translated</span>
        // The source language is always spanish.
        // Target language is the one lodaded in langString
        this.translate = function() {        
            if (this.isSpanish()) return;            
            // Translate elements who have the translate attribute
            $("[translate]").each(function(index) {                                                        
                $(this).text(loc.t($( this ).text()));
            });    
            // Translate Input value
            $("input[translate]").each(function(index) {                                                                 
                $(this).val(loc.t($( this ).val()));        
                $(this).attr("placeholder",loc.t($(this).attr('placeholder')));
            });    
            // Translate textarea placeholder
             $("textarea[translate]").each(function(index) {                                                                         
                 $(this).attr("placeholder",loc.t($(this).attr('placeholder')));
            });       
        }
        
        // Translates given text
        this.t = function(text) {
            if (this.isSpanish()) return text;  // source language is spanish
            if (typeof _langString !== 'undefined' && _langString[text]) return _langString[text];    
            return text;
        }


    
        
        
    }
    
    window.LanguageController = LanguageController;
    
    
    
}) (window);

var $date = new DateController(); 
$date.init();
var $lan  = new LanguageController();
    

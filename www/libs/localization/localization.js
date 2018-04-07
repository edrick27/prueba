/*
  Matthias Malek
  12/12/2014

   Para que funcione en tags...se ocupa agregar el atributo translate
   ej:  <span translate>Inicio</span>
   En código Javascript, se utiliza la funcion loc.t
   ej:  loc.t('Espere')

   En textareas e inputs...traduce el placeholder,
   en inputs....traduce el val.

*/

loc = {};
loc.lang = "es";    


loc.loaded = false;
loc.error = false;



loc.translate = function() {
        
    if (loc.isSpanish()) return;            
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



loc.t = function(text) {
    if (loc.isSpanish()) return text;
    if (typeof loc.langString != 'undefined' && loc.langString[text]) return loc.langString[text];    
    return text;
}


loc.loadLanguage = function() {
    var deferred = $.Deferred();        
    if (loc.isSpanish()) 
        deferred.resolve(true); 
    else {    
        var fileName = loc.getLanFileName();
        $.getScript(fileName)
        .done(function( script, textStatus ) {            
            loc.loaded = true;        
            deferred.resolve(true);
        })
        .fail(function( jqxhr, settings, exception ) {            
            loc.loaded = false;
            loc.error = true;
            deferred.resolve(false);
        });       
   }
    
    return deferred.promise();
}



loc.getLanFileName = function() {        
    return 'libs/localization/lang/' + loc.lang + '.js';
}

loc.isSpanish = function() {
    return loc.lang == "es";
}

    

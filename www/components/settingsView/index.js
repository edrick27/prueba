'use strict';

app.settingsView = kendo.observable({
    
    profile: {},
    
    password: {
        current:      '',
        newpassword:  '',
        newpassword2: ''
    },
    
    preferences: {exterior: false, autorefresh: true },
    
    goHome: function() {
        app.navigateHome();        
    },
    
    goBack: function() {           
        app.mobileApp.navigate("#:back");      
    },
    
    beforeShowViewPassword: function() {
        var that = app.settingsView;
        
        that.set('password', {
            current:      '',
            newpassword:  '',
            newpassword2: ''
        });        
    },
    
    
    beforeShow: function() {        
        
        
        app.settingsView.set('profile.fullname', app.user.fullname);    
        app.settingsView.set('profile.avatar', helper.getAvatar(app.user.avatar));        
        app.settingsView.set('profile.role',  helper.getStaffRole(app.user.idstaff));         
        app.settingsView.set('profile.idstaff',  app.user.idstaff);
        app.settingsView.set('profile.hotelname',  app.hotel.name);
        
        app.user.preferences = app.user.preferences || app.settingsView.preferences;                    
        
        if (typeof app.user.preferences.autorefresh == 'undefined')
            app.user.preferences.autorefresh = true;
        
                
        app.settingsView.set('preferences',app.user.preferences);
        
        
        
                
                
        if (helper.isAndroid())
            app.settingsView.set('url',app.url_android);
        else if (helper.isiOS())
            app.settingsView.set('url',app.url_ios);
        
        $("#versionInfo").attr('href',app.settingsView.get('url'));
        $("#versionInfo").html(app.version_latest);
        
    },
    
    
     onShow: function() {},
    
    
    
     takePicture: function() {                        
        everliveController.takePictureSmall()
        .done(function(data) {                        
            var image = document.getElementById("imgAvatar"); 
            image.src = "data:image/jpeg;base64," + data;  
            everliveController.sendPicture(data)
            .done(function(uri) {                    
                app.user.avatar = uri;
                $smart.setAvatar(app.user.idstaff, uri)
                .done(function(result) {
                    
                });
            })            
        })      
        .fail(function() {
           //helper.showAlert(error,'Error al salvar foto!');       
        })
    },
    
    goChangePassword: function() {        
        app.mobileApp.navigate('components/settingsView/changePassword.html');                 
    },
    
    changePassword: function() {
        var that = app.settingsView;
        var password = that.get('password');
        
        if (password.current == '' || password.newpassword == '' || password.newpassword2 == '') 
            $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>  Ingresar todos los campos!");
        
        else if (password.newpassword != password.newpassword2) 
            $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>  Contraseñas nuevas no coinciden!");
        else {       
            $smart.changePassword(app.user.idstaff, password.current, password.newpassword)
           .done(function(r) {               
               $smart.showMessageDialog("<i class='mdi mdi-info mdi-2x c-main3'></i><br>  Contraseña modificada exitosamente!");
               app.mobileApp.navigate("#:back");     
            })
            .fail(function(error) {
               $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>" + error);                
            })
            
        }                
    },
    
    
    
    toggleExteriorMode: function() {
        app.user.preferences.exterior = !app.settingsView.preferences.exterior;        
        app.settingsView.updatePreferences();
    },
    
     toggleAutoRefresh: function() {         
        app.user.preferences.autorefresh = !app.settingsView.preferences.autorefresh;                 
         
         console.info(app.user.preferences.autorefresh);
         if (app.user.preferences.autorefresh == true)
              $smart.syncWorker.postMessage({message: "start"});
         else
             $smart.syncWorker.postMessage({message: "finish"});
        //app.settingsView.updatePreferences();
    },
    
    
    updatePreferences: function() {        
        helper.showLoading('Espere');
        
        $smart.updatePreferences(app.user.preferences)
        .done(function() {                        
           helper.hideLoading();
        })
        .fail(function() {
            helper.hideLoading();
        })
    }
    
   
    
});

// START_CUSTOM_CODE_contactsView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    
})();
// END_CUSTOM_CODE_contactsView
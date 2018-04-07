'use strict';

app.loginView = kendo.observable({
    version: '',
    hotel: '',

    onShow: function() {

        $("#fullsync").prop("checked", false);

    },

    afterShow: function() {

    },

    init: function() {
       // navigator.splashscreen.hide();
        app.loginView.set('version',app.version);
        app.loginView.set('server',app.server);
        app.loginView.set('hotelname',app.hotelname);
    },

    username: '',
    password: '',
    code    : '',

    onLoginKeyword: function() {
        return;
        if (event.keyCode === 13) {
            $("#password").blur();
            app.loginView.onLogin();
        }
    },


    onLogin: function() {


        if (!app.isOnline())
            $smart.showMessageDialog("<i class='mdi mdi-wifi-off mdi-2x c-main3'></i>  No hay conexión a internet!");

        else { // online
            var username = this.get("username").trim(),
                password = this.get("password").trim(),
                code     = this.get("code").trim();

            if (username === "" || password === "")
                 //helper.showError("Usuario y contraseña requeridos!");
                 $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>  Usuario y contraseña requeridos!");
             else {
                 helper.pleaseWait();
                 $smart.login(code,username, password)
                 .done(function(){
                     $smart.initialSynchronization(true) //app.user.dofullsync == 1 || $("#fullsync").is(":checked"))
                     .done(function() {
                         window.FirebasePlugin.getToken(function(token) {
                            $smart.setFCMtoken(app.user.idstaff, token)
                            .done(function(result) {
                                helper.hideLoading();
                                app.justLoggedIn = true;
                                app.navigateHome();
                            });
                        }, function(error) {
                            alert(error);
                        });
                     })
                     .fail(function(error) {
                          helper.hideLoading();
                         // helper.showDialogMessage('', error, null);
                         console.log(error);
                         app.loginView.showRestarSync();
                     })
                 })
                 .fail(function(error){
                     helper.hideLoading();
                     if (error === globals.INVALID_CREDENTIALS || (error === globals.USER_DOES_NOT_EXIST))
                         helper.showDialogMessage('',"<i class='mdi mdi-2x mdi-account-alert c-main3'></i><br>  Usuario o Contraseña incorrectos!",null);

                    else if (error === globals.INVALID_USER_ROLE) {
                        $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>  Role de usuario no es válido!");
                    }
                    else if (error === globals.DEVICE_BLOCKED) {
                        $smart.showMessageDialog("<i class='mdi mdi-account-alert mdi-2x c-main3'></i><br>  No permitido!");
                    }
                    else
                         $smart.showMessageDialog("<i class='mdi mdi-wifi-off mdi-2x c-main3'></i><br>  No hay red!<br> Reintentar más tarde!");
                 });
             }
        }
    },

    RestarSync:function(reason) {
        if (!app.isOnline())
        {
          $smart.showMessageDialog("<i class='mdi mdi-wifi-off mdi-2x c-main3'></i>  No hay conexión a internet!");
        }else{
           helper.pleaseWait();
           $smart.initialSynchronization(true)
              .done(function() {
                 helper.hideLoading();
                 app.justLoggedIn = true;
                 everliveController.enableNotifications();
                 app.navigateHome();
               })
               .fail(function(error) {
                 helper.hideLoading();
                 console.log(error);
                 app.loginView.showRestarSync();
               });
        }
    },

     showRestarSync: function() {
        helper.showDialogYN('Algo salió mal!, ¿Reintendar nuevamente?', function(reason) {app.loginView.RestarSync(reason)});
    },

});


// START_CUSTOM_CODE_loginView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
(function () {
    app.loginView.set('title', 'DingDONE Login');


})();
// END_CUSTOM_CODE_loginView

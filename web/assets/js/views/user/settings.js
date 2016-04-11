define([
    'app-state', 'jquery', 'backbone', 'underscore', 'websocket', 'views/form', 'models/message'
], function(appState, $, Backbone, _, websocket, FormView, MessageModel) {
    var SettingsModel = Backbone.Model.extend({
        validate: function(attributes) {
            var r = {};
            if (!attributes.name) r.name = 'Имя пользователя не может быть пустым';
            if (Object.keys(r).length) return r;
        },
        defaults: {
            name: null
        },
        sync: function(method, model, options) {
            if (method != 'create') return false;
            this.trigger('request', model);
            websocket.request('user/settings', {
                name: model.get('name')
            }, function(data){
                if (data.errors) {
                    if (data.errors)
                        options.error('Неизвестная ошибка');
                    return;
                }
                options.success();
            }, options.error);
        }
    });

    var UserPasswordModel = Backbone.Model.extend({
        validate: function(attributes) {
            var r = {};
            if (!attributes.passwordOld) r.passwordOld = 'Укажите текущий пароль';
            if (attributes.password != attributes.password2) r.common = 'Пароли не совпадают';
            if (!attributes.password) r.password = 'Пароль не может быть пустым';
            if (!attributes.password2) r.password2 = 'Пароль не может быть пустым';
            if (Object.keys(r).length) return r;
        },
        defaults: {
            passwordOld: null,
            password: null,
            password2: null
        },
        sync: function(method, model, options) {
            if (method != 'create') return false;
            this.trigger('request', model);
            websocket.request('user/password', {
                passwordOld: model.get('passwordOld'),
                password: model.get('password')
            }, function(data){
                if (data.errors) {
                    if (data.errors.indexOf('invalidPassword') != -1)
                        options.error('Неправильный пароль');
                    else
                        options.error('Неизвестная ошибка');
                    return;
                }
                options.success();
            }, options.error);
        }
    });

    var SettingsView = Backbone.View.extend({
        initialize: function() {
            //this.message
            this.settingsForm = new FormView({
                submitCaption: 'Сохранить',
                fields: [
                    {name: 'name', caption: 'Имя', type: 'text'}
                ],
                model: new SettingsModel({
                    name: appState.get('user')
                }),
                success: function() {
                    alert('Победа');
                }
            });
            this.passwordForm = new FormView({
                submitCaption: 'Сохранить',
                fields: [
                    {name: 'passwordOld', caption: 'Текущий пароль', type: 'password'},
                    {name: 'password', caption: 'Новый пароль', type: 'password'},
                    {name: 'password2', caption: 'Повторите пароль', type: 'password'}
                ],
                model: new UserPasswordModel,
                success: function() {
                    alert('Победа');
                }
            });
        },
        render: function () {
            this.$el.empty()
                .append(this.settingsForm.render().el)
                .append($('<hr>')).append(this.passwordForm.render().el);
            return this;
        }
    });

    appState.route({
        route: 'settings',
        name: 'settings',
        handler: function () {
            var view = new SettingsView;
            appState.applyView(view);
        },
        caption: 'Параметры',
        showAnonymous: false,
        position: 'right'
    });
});
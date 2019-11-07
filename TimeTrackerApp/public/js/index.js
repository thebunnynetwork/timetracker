let baseUrl = 'http://192.168.33.10';

const routes = [{
    path: '/',
    component: mainWrapper,
    children: [
        {path: '/', component: brosey_enterprises_time_tracking_sprint},
        {path: '/timetracker', component: brosey_enterprises_time_tracking_sprint},
        {path: '/timetracker/:id', component: brosey_enterprises_time_tracking_time_entries, props: true},
        {path: '/users/', component: users_dashboard},
    ]},
    { path: '/login', component: login, meta: {noAuthReq: true}}
]

var auth = {
    auth: false,
    checkAuth: function() {
        return window.localStorage.getItem('timetracker-auth');
    },
    createAuth: function(key) {
        window.localStorage.setItem('timetracker-auth', key);
    },
    logout: function() {
        window.localStorage.setItem('timetracker-auth', "");
    }
};

axios.interceptors.request.use(function(config) {
    config.headers.common['Authorization'] = auth.checkAuth();
    return config;
}, function(error) {
    console.log(error);
    return Promise.reject(error);
});

axios.interceptors.response.use(function(response) {
    return response;
}, function(error) {
    console.log(error.response.status);
    if (error.response.status == 403) {
        auth.logout();
        window.location = "#/login";
    }
    return Promise.reject(error);
});

const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    if (!to.matched.some(record => record.meta.noAuthReq)) {
        if (auth.checkAuth() == "") {
            next({
                path: '/login',
                query: {redirect: to.fullPath}
            })
        } else {
            if (to.matched.length == 0) {
                var appname = to.path.split('/')[2];
                next(false);
                loadApp(appname, function() {
                    router.push(to.path);
                });
            } else {
                next();
            }
        }
    } else {
        next();
    }
});

function loadApp(app, next) {
    loadScript(app + ".js", function() {
        router.addRoutes(routes2);
        next();
    });
}

function loadScript(src, callback) {
    var s, r, t;
    r = false;
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    s.onload = s.onreadystatechange = function() {
        if (!r && (!this.readyState || this.readyState == 'complete')) {
            r = true;
            callback();
        }
    };
    t = document.getElementsByTagName('script')[0];
    t.parentNode.insertBefore(s, t);
}

new Vue({
    router: router,
    el: '#app'
});

const mainWrapper = {
        data () {
            return {
                drawer: true,
                mini: false,
                right: null,
                isadmin: false,
                ispoweruser: false
            }
        },
        created () {
            this.fetchData();
        },
        watch: {
            '$route': 'fetchData'
        },
        methods: {
            fetchData () {
                var $this = this;
                if (typeof auth.checkAuth() !== 'undefined') {
                    axios.post(baseUrl + "/isadmin/", {
                        token: auth.checkAuth()
                    }).then(function(data) {
                        if (data.data.admin) {
                            $this.isadmin = true;
                        }
                        if (data.data.poweruser) {
                            $this.poweruser = true;
                        }
                    });
                }
            },
            logout () {
                auth.logout();
                router.push('/login');
            },
        },
        template: `
            <v-app id="Time Tracker" toolbar>
                <v-navigation-drawer absolute persistent light :mini-variant.sync="mini" v-model="drawer" overflow app>
                    <v-toolbar flat class="transparent">
                        <v-list class="pa-0">
                            <v-list-tile avatar tag="div">
                                <v-list-tile-avatar>
                                    <img src="https://randomuser.me/api/portraits/men.78.jpg" />
                                </v-list-tile-avatar>
                                <v-list-tile-content>
                                    <v-list-tile-title>Dev User</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list>
                    </v-toolbar>

                    <v-list class="pt-0" dense>
                        <v-divider></v-divider>
                        <v-list-tile to="/">
                            <v-list-tile-action>
                                <v-icon>dashboard</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>Time Tracker</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>

                        <div v-if="isadmin">
                            <v-list-tile to="/users/">
                                <v-list-tile-action>
                                    <v-icon>dashboard</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>Users</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </div>
                    </v-list>
                </v-navigation-drawer>
                <v-toolbar clipped-left fixed class="blue" app>
                    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
                    <v-toolbar-title>Time Tracker</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn @click="logout" icon>
                            <v-icon>power_settings_new</v-icon>
                        </v-btn>
                        <v-btn icon>
                            <v-icon>settings</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-content>
                    <v-container fluid grid-list-lg>
                        <router-view></router-view>
                        <div id="appview"></div>
                    </v-container>
                </v-content>
            </v-app>`
    }

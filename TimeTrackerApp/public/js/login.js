const login = {
        data: () => ({
            username: '',
            password: ''
        }),
        methods: {
            submit: function(event) {
                var cont = this;
                event.preventDefault();
                axios.post(baseUrl + "/login", {
                    username: this.username,
                    password: this.password
                }).then(function(data) {
                    if (data.data.token) {
                        auth.createAuth(data.data.token);
                        if (cont.$route.query.redirect) {
                            cont.$router.push(cont.$route.query.redirect);
                        } else {
                            cont.$router.push('/');
                        }
                    } else {
                        window.location = "#/login";
                    }
                })
            }
        },
        template: `
            <div>
                <v-app>
                    <v-content>
                        <v-container fluid grid-list-lg>
                            <v-layout row>
                                <v-flex xs12 sm4 offset-sm4>
                                    <v-card>
                                        <v-form v-on:submit="submit">
                                            <v-card-title primary-title>
                                                <div>
                                                    <div class="headline">Login</div>
                                                </div>
                                            </v-card-title>
                                            <v-card-text>
                                                <v-text-field
                                                    label="Username"
                                                    v-model="username">
                                                </v-text-field>
                                                <v-text-field
                                                    label="Password"
                                                    type="password"
                                                    v-model="password">
                                                </v-text-field>
                                                <v-btn flat type="submit" color="blue">Login</v-btn>
                                            </v-card-text>
                                            <v-card-actions>
                                            </v-card-actions>
                                        </v-form>
                                    </v-card>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-content>
                </v-app>
            </div>`
    }
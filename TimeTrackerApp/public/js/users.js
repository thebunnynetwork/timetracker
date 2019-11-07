const users_dashboard = {
    data () {
        return {
            isadmin: false,
            ispoweruser: false,
            dialog: false,
            changePasswordDialog: false,
            Headers: [
                {text: 'Username', value: 'username'},
                {text: 'Admin', value: 'admin'},
                {text: 'Power User', value: 'poweruser'},
                {text: 'Actions', value: 'name', sortable: false}
            ],
            newuser: {
                username: '',
                password: '',
                confirmpassword: '',
                isadmin: false,
                ispoweruser: false
            },
            changePassword: {
                username: '',
                password: '',
                confirmpassword: ''
            },
            usernameRules: [ (v) => !!v || 'Username is required.'],
            passwordRules: [ (v) => !!v || 'Password is required.'],
            confirmChangePasswordRules: [
                (v) => !!v || 'Confirm Password is required.',
                (v) => v == this.changePassword.password || "Passwords don't match."
            ],
            confirmNewUserPasswordRules: [
                (v) => !!v || 'Confirm Password is required.',
                (v) => v == this.newuser.password || "Passwords don't match"
            ],
            loading: true,
            search: '',
            Records: []
        }
    },
    created () {
        this.fetchData();
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        changePasswordLoadDialog (item) {
            this.changePassword.username = item.username;
            this.changePasswordDialog = true;
        },
        changePasswordCloseDialog () {
            this.changePasswordDialog = false;
        },
        changePasswordSaveDialog () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/changepassword/", {
                username: $this.changePassword.username,
                password: $this.changePassword.password,
                token: auth.checkAuth()
            }).then(function (data) {
                $this.loading = false;
                $this.changePassword.username = '';
                $this.changePassword.password = '';
                $this.changePassword.confirmpassword = '';
                $this.changePasswordDialog = false;
            });
        },
        close () {
            this.dialog = false;
        },
        fetchData () {
            var $this = this;
            axios.post(baseUrl + "/users/", {
                token: auth.checkAuth()
            }).then(function (data) {
                $this.loading = false;
                $this.Records = data.data;
            })
        },
        removeUser (item) {
            if (confirm('Are you sure you want to remove this user?')) {
                var $this = this;
                $this.loading = true;
                axios.post(baseUrl + "/removeuser/", {
                    username: item.username,
                    token: auth.checkAuth()
                }).then(function (data) {
                    $this.loading = true;
                    $this.Records = data.data;
                    $this.dialog = false;
                });
            }
        },
        save () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/userinsert/", {
                username: $this.newuser.username,
                password: $this.newuser.password,
                isadmin: $this.newuser.isadmin,
                ispoweruser: $this.newuser.ispoweruser,
                token: auth.checkAuth()
            }).then(function (data) {
                $this.loading = false;
                $this.newuser.username = '';
                $this.newuser.password = '';
                $this.newuser.confirmpassword = '';
                $this.newuser.isadmin = false;
                $this.newuser.ispoweruser = false;
                $this.Records = data.data;
                $this.dialog = false;
            })
        }
    },
    template: `
        <div v-if="loading">
            <v-layout row wrap>
                <v-flex lg12>
                    <p>Loading</p>
                </v-flex>
            </v-layout>
        </div>
        <div v-else>
            <v-layout row wrap>
                <v-flex xs12 lg12>
                    <v-card>
                        <v-card-title primary-title>
                            <div class="headline">User List</div>
                            <v-spacer></v-spacer>
                            <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Search"
                                single-line
                                hide-details>
                            </v-text-field>
                            <v-dialog v-model="dialog" max-width="500px">
                                <v-btn slot="activator" color="primary" class="mb-2">New User</v-btn>
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">Add New User</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="newuser.username"
                                                        :rules="usernameRules"
                                                        label="Username"
                                                        required>
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="newuser.password"
                                                        :rules="passwordRules"
                                                        label="Password"
                                                        :type="'password'"
                                                        required>
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="newuser.confirmpassword"
                                                        :rules="confirmNewUserPasswordRules"
                                                        label="Confirm Password"
                                                        :type="'password'"
                                                        required>
                                                    </v-text-field>
                                                    <v-checkbox v-model="newuser.isadmin" label="Is Admin">
                                                    </v-checkbox>
                                                    <v-checkbox v-model="newuser.ispoweruser" label="Is Power User">
                                                    </v-checkbox>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="changePasswordDialog" max-width="500px">
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">Change Password</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="changePassword.password"
                                                        :rules="passwordRules"
                                                        label="Password"
                                                        :type="'password'"
                                                        required>
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="changePassword.confirmpassword"
                                                        :rules="confirmChangePasswordRules"
                                                        label="Confirm Password"
                                                        :type="'password'"
                                                        required>
                                                    </v-text-field>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="changePasswordCloseDialog">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="changePasswordSaveDialog">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-card-title>
                        <v-data-table
                            :headers="Headers"
                            :items="Records"
                            class="elevation-1">
                            <template slot="items" slot-scope="props">
                                <td>{{ props.item.username }}</td>
                                <td>{{ props.item.admin }}</td>
                                <td>{{ props.item.poweruser }}</td>
                                <td class="justify-center layout px-0">
                                    <v-icon
                                        small
                                        class="mr-2"
                                        @click="changePasswordLoadDialog(props.item)">
                                        edit
                                    </v-icon>
                                    <v-icon
                                        small
                                        @click="removeUser(props.item)">
                                        delete
                                    </v-icon>
                                </td>
                            </template>
                            <v-alert slot="no-results" :value="true" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>
                        </v-data-table>
                    </v-card>
                </v-flex>
            </v-layout>
        </div>`
    }
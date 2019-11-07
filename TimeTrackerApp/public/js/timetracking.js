const brosey_enterprises_time_tracking_sprint = {
    data () {
        return {
            isAdmin: false,
            newSprintDialog: false,
            editSprintDialog: false,
            Headers: [
                {text: 'Sprint', value: 'sprint_name'},
                {text: 'Date Range', value: 'date_range'},
                {text: 'Actions', value: 'name', sortable: false}
            ],
            newsprint: {
                sprintid: 0,
                sprint_name: '',
                date_range: ''
            },
            editsprint: {
                sprintid: 0,
                sprint_name: '',
                date_range: ''
            },
            PaginationSync: {
                rowsPerPage: -1
            },
            sprintNameRules: [ (v) => !!v || 'Sprint name is required.'],
            loading: true,
            info: {},
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
        modifySprint (item) {
            this.editsprint.sprintid = item.sprintid;
            this.editsprint.sprint_name = item.sprint_name;
            this.editsprint.date_range = item.date_range;
            this.editSprintDialog = true;
        },
        editSprintDialogClose () {
            this.editsprint.sprintid = 0;
            this.editsprint.sprint_name = '';
            this.editsprint.date_range = '';
            this.editSprintDialog = false;
        },
        editSprintDialogSave () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/timetracking/updatesprint", {
                sprintid: $this.editsprint.sprintid,
                sprint_name: $this.editsprint.sprint_name,
                date_range: $this.editsprint.date_range
            }).then(function (data) {
                $this.loading = false;
                $this.editsprint.sprintid = 0;
                $this.editsprint.sprint_name = '';
                $this.editsprint.date_range = '';
                $this.editSprintDialog = false;
            });
        },
        newSprintDialogClose () {
            this.newsprint.sprint_name = '';
            this.newsprint.date_range = '';
            this.newSprintDialog = false;
        },
        newSprintDialogSave () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/timetracking/insertsprint", {
                sprint_name: $this.newsprint.sprint_name,
                date_range: $this.newsprint.date_range
            }).then(function (data) {
                $this.loading = false;
                $this.newsprint.sprint_name = '';
                $this.newsprint.date_range = '';
                $this.Records = data.data;
                $this.newSprintDialog = false;
            });
        },
        fetchData () {
            this.loadSprints();
        },
        loadSprints () {
            var $this = this;
            return axios.post(baseUrl + "/timetracking/loadsprints")
                .then(function (data) {
                    $this.loading = false;
                    $this.Records = data.data;
                });
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
                            <div class="headline">Time Tracker</div>
                            <v-spacer></v-spacer>
                            <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Search"
                                single-line
                                hide-details>
                            </v-text-field>
                            <v-dialog v-model="newSprintDialog" max-width="500px">
                                <v-btn slot="activator" color="primary" class="mb-2">New Sprint</v-btn>
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">New Sprint</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="newsprint.sprint_name"
                                                        :rules="sprintNameRules"
                                                        label="Sprint Name"
                                                        required>
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="newsprint.date_range"
                                                        label="Date Range">
                                                    </v-text-field>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="newSprintDialogClose">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="newSprintDialogSave">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="editSprintDialog" max-width="500px">
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">Edit Sprint</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="editsprint.sprint_name"
                                                        :rules="sprintNameRules"
                                                        label="Sprint Name"
                                                        required>
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="editsprint.date_range"
                                                        label="Date Range">
                                                    </v-text-field>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="editSprintDialogClose">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="editSprintDialogSave">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-card-title>
                        <v-data-table
                            :headers="Headers"
                            :items="Records"
                            :pagination.sync="PaginationSync"
                            :sort-by="Sprint"
                            :sort-desc="true"
                            class="elevation-1">
                            <template slot="items" slot-scope="props">
                                <td><a :href="'#/timetracker/' + props.item.sprintid">{{ props.item.sprint_name }}</a></td>
                                <td>{{ props.item.date_range }}</td>
                                <td class="justify-center layout px-0">
                                    <v-icon
                                        small
                                        class="mr-2"
                                        @click="modifySprint(props.item)">
                                        edit
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
        </div>
    `
};

const brosey_enterprises_time_tracking_time_entries = {
    props: ['id'],
    data () {
        return {
            isAdmin: false,
            newTimeEntryDialog: false,
            editTimeEntryDialog: false,
            colorCLN: 'green',
            colorDEV: 'green',
            colorEXC: 'green',
            colorLRN: 'green',
            colorORG: 'green',
            colorPUB: 'green',
            colorREL: 'green',
            colorSPR: 'green',
            colorTOT: 'green',
            colorPLAY: 'green',
            colorSLEEP: 'green',
            currentTOT: 0,
            currentDashboard: {},
            currentSprint: {},
            taskTypes: [],
            Headers: [
                {text: 'Day', value: 'day'},                
                {text: 'Task', value: 'task'},
                {text: 'Description', value: 'description'},
                {text: 'Time', value: 'time'},
                {text: 'TaskType', value: 'tasktype'},
                {text: 'Actions', value: 'name', sortable: false}
            ],
            PaginationSync: {
                rowsPerPage: -1
            },
            newTimeEntry: {
                timeentryid: 0,
                day: '',
                task: '',
                tasktype: '',
                description: '',
                time: ''
            },
            editTimeEntry: {
                timeentryid: 0,
                day: '',
                task: '',
                tasktype: '',
                description: '',
                time: ''
            },
            loading: true,
            info: {},
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
        modifyTimeEntry (item) {
            this.editTimeEntry.timeentryid = item.timeentryid;
            this.editTimeEntry.day = item.day;
            this.editTimeEntry.task = item.task;
            this.editTimeEntry.tasktype = item.tasktype;
            this.editTimeEntry.description = item.description;
            this.editTimeEntry.time = item.time;
            this.editTimeEntryDialog = true;
        },
        removeTimeEntry (item) {
            if (confirm('Are you sure you want to remove this time entry?')) {
                var $this = this;
                $this.loading = true;
                axios.post(baseUrl + "/timetracking/removetimeentry", {
                    timeentryid: item.timeentryid
                }).then(function (data) {
                    $this.loading = false;
                    $this.Records = data.data;
                    $this.dialog = false;
                });
            }
        },
        editTimeEntryDialogClose () {
            this.editTimeEntry.timeentryid = 0;
            this.editTimeEntry.day = '';
            this.editTimeEntry.task = '';
            this.editTimeEntry.tasktype = '';
            this.editTimeEntry.description = '';
            this.editTimeEntry.time = '';
            this.editTimeEntryDialog = false;
        },
        editTimeEntryDialogSave () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/timetracking/updatetimeentry", {
                timeentryid: $this.editTimeEntry.timeentryid,
                day: $this.editTimeEntry.day,
                task: $this.editTimeEntry.task,
                tasktype: $this.editTimeEntry.tasktype,
                description: $this.editTimeEntry.description,
                time: $this.editTimeEntry.time
            }).then(function (data) {
                $this.editTimeEntry.timeentryid = 0;
                $this.editTimeEntry.day = '';
                $this.editTimeEntry.task = '';
                $this.editTimeEntry.tasktype = '';
                $this.editTimeEntry.description = '';
                $this.editTimeEntry.time = '';
                $this.editTimeEntryDialog = false;
                $this.Records = data.data;
                $this.loading = false;
            });
        },
        newTimeEntryDialogClose () {
            this.newTimeEntry.day = '';
            this.newTimeEntry.task = '';
            this.newTimeEntry.tasktype = '';
            this.newTimeEntry.description = '';
            this.newTimeEntry.time = '';
            this.newTimeEntryDialog = false;
        },
        newTimeEntryDialogSave () {
            var $this = this;
            $this.loading = true;
            axios.post(baseUrl + "/timetracking/inserttimeentry", {
                sprintid: $this.id,
                day: $this.newTimeEntry.day,
                task: $this.newTimeEntry.task,
                tasktype: $this.newTimeEntry.tasktype,
                description: $this.newTimeEntry.description,
                time: $this.newTimeEntry.time
            }).then(function (data) {
                $this.loadSprintDashboard();                
                $this.newTimeEntry.day = '';
                $this.newTimeEntry.task = '';
                $this.newTimeEntry.tasktype = '';
                $this.newTimeEntry.description = '';
                $this.newTimeEntry.time = '';
                $this.newTimeEntryDialog = false;
                $this.Records = data.data;
                $this.loading = false;
            });
        },
        fetchData () {
            this.loadSprint();
            this.loadSprintDashboard();
            this.loadTaskTypes();
            this.loadTimeEntries();
        },
        loadSprint () {
            var $this = this;
            return axios.post(baseUrl + "/timetracking/loadsprint", {
                    sprintid: $this.id
                }).then(function (data) {
                    $this.currentSprint = data.data;
                });
        },
        loadSprintDashboard () {
            var $this = this;
            return axios.post(baseUrl + "/timetracking/loadsprintdashboard", {
                    sprintid: $this.id
                }).then(function (data) {
                    $this.currentDashboard = data.data;
                    var currentDate = new Date();
                    if (currentDate.getDay() == 0) {
                        $this.colorCLN = 'green';
                        $this.colorDEV = 'green';
                        $this.colorEXC = 'green';
                        $this.colorLRN = 'green';
                        $this.colorORG = 'green';
                        $this.colorPUB = 'green';
                        $this.colorREL = 'green';
                        $this.colorSPR = 'green';
                        $this.colorTOT = 'green';
                        $this.colorPLAY = 'green';
                        $this.colorSLEEP = 'green';
                    }
                    else if (currentDate.getDay() == 1) {
                        if ($this.currentDashboard.CLN < 1) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 1) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 1) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 1) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 1) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 1) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 1) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 1) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 9) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 1) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 8) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                    else if (currentDate.getDay() == 2) {
                        if ($this.currentDashboard.CLN < 2) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 2) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 2) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 2) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 2) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 2) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 2) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 2) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 18) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 2) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 16) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                    else if (currentDate.getDay() == 3) {
                        if ($this.currentDashboard.CLN < 3) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 3) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 3) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 3) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 3) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 3) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 3) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 3) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 27) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 3) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 24) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                    else if (currentDate.getDay() == 4) {
                        if ($this.currentDashboard.CLN < 4) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 4) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 4) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 4) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 4) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 4) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 4) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 4) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 36) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 4) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 32) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                    else if (currentDate.getDay() == 5) {
                        if ($this.currentDashboard.CLN < 5) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 5) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 5) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 5) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 5) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 5) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 5) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 5) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 45) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 5) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 40) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                    else if (currentDate.getDay() == 6) {
                        if ($this.currentDashboard.CLN < 6) {
                            $this.colorCLN = 'red';
                        } else {
                            $this.colorCLN = 'green';
                        }
                        if ($this.currentDashboard.DEV < 6) {
                            $this.colorDEV = 'red';
                        } else {
                            $this.colorDEV = 'green';
                        }
                        if ($this.currentDashboard.EXC < 6) {
                            $this.colorEXC = 'red';
                        } else {
                            $this.colorEXC = 'green';
                        }
                        if ($this.currentDashboard.LRN < 6) {
                            $this.colorLRN = 'red';
                        } else {
                            $this.colorLRN = 'green';
                        }
                        if ($this.currentDashboard.ORG < 6) {
                            $this.colorORG = 'red';
                        } else {
                            $this.colorORG = 'green';
                        }
                        if ($this.currentDashboard.PUB < 6) {
                            $this.colorPUB = 'red';
                        } else {
                            $this.colorPUB = 'green';
                        }
                        if ($this.currentDashboard.REL < 6) {
                            $this.colorREL = 'red';
                        } else {
                            $this.colorREL = 'green';
                        }
                        if ($this.currentDashboard.SPR < 6) {
                            $this.colorSPR = 'red';
                        } else {
                            $this.colorSPR = 'green';
                        }
                        if ($this.currentDashboard.TOT < 56) {
                            $this.colorTOT = 'red';
                        } else {
                            $this.colorTOT = 'green';
                        }
                        if ($this.currentDashboard.PLAY < 6) {
                            $this.colorPLAY = 'red'
                        } else {
                            $this.colorPLAY = 'green'
                        }
                        if ($this.currentDashboard.SLEEP < 48) {
                            $this.colorSLEEP = 'red'
                        } else {
                            $this.colorSLEEP = 'green'
                        }
                    }
                });
        },
        loadTaskTypes () {
            var $this = this;
            return axios.post(baseUrl + "/timetracking/loadtasktypes")
                .then(function (data) {
                    $this.taskTypes = data.data;
                });
        },
        loadTimeEntries () {
            var $this = this;
            return axios.post(baseUrl + "/timetracking/loadtimeentries", {
                sprintid: $this.id
                }).then(function (data) {
                    $this.loading = false;
                    $this.Records = data.data;
                });
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
                            <div class="headline">Time Tracking - {{ currentSprint.sprint_name }}</div>
                            <v-spacer></v-spacer>
                            <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Search"
                                single-line
                                hide-details>
                            </v-text-field>
                            <v-dialog v-model="newTimeEntryDialog" max-width="500px">
                                <v-btn slot="activator" color="primary" class="mb-2">New Time Entry</v-btn>
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">New Time Entry</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="newTimeEntry.day"
                                                        label="Day">
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="newTimeEntry.task"
                                                        label="Task">
                                                    </v-text-field>
                                                    <v-select
                                                        :items="taskTypes"
                                                        v-model="newTimeEntry.tasktype"
                                                        label="Task Type">
                                                    </v-select>
                                                    <v-text-field
                                                        v-model="newTimeEntry.description"
                                                        label="Description">
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="newTimeEntry.time"
                                                        label="Time Spent">
                                                    </v-text-field>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="newTimeEntryDialogClose">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="newTimeEntryDialogSave">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="editTimeEntryDialog" max-width="500px">
                                <v-card>
                                    <v-card-title>
                                        <span class="headline">Edit Time Entry</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container grid-list-md>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <v-text-field
                                                        v-model="editTimeEntry.day"
                                                        label="Day">
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="editTimeEntry.task"
                                                        label="Task">
                                                    </v-text-field>
                                                    <v-select
                                                        :items="taskTypes"
                                                        v-model="editTimeEntry.tasktype"
                                                        label="Task Type">
                                                    </v-select>
                                                    <v-text-field
                                                        v-model="editTimeEntry.description"
                                                        label="Description">
                                                    </v-text-field>
                                                    <v-text-field
                                                        v-model="editTimeEntry.time"
                                                        label="Time Spent">
                                                    </v-text-field>
                                                </v-flex>
                                            </v-layout>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue darken-1" flat @click="editTimeEntryDialogClose">Cancel</v-btn>
                                        <v-btn color="blue darken-1" flat @click="editTimeEntryDialogSave">Save</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-card-title>
                        <v-card>
                            <v-card-title>
                                <span v-bind:style="{ color: colorCLN }">&nbsp;CLN: {{ currentDashboard.CLN }}</span>
                                <span v-bind:style="{ color: colorDEV }">&nbsp;DEV: {{ currentDashboard.DEV }}</span>
                                <span v-bind:style="{ color: colorEXC }">&nbsp;EXC: {{ currentDashboard.EXC }}</span>
                                <span v-bind:style="{ color: colorLRN }">&nbsp;LRN: {{ currentDashboard.LRN }}</span>
                                <span v-bind:style="{ color: colorORG }">&nbsp;ORG: {{ currentDashboard.ORG }}</span>
                                <span v-bind:style="{ color: colorPUB }">&nbsp;PUB: {{ currentDashboard.PUB }}</span>
                                <span v-bind:style="{ color: colorREL }">&nbsp;REL: {{ currentDashboard.REL }}</span>
                                <span v-bind:style="{ color: colorSPR }">&nbsp;SPR: {{ currentDashboard.SPR }}</span>
                                <br>
                                <span v-bind:style="{ color: colorTOT }">&nbsp;&nbsp;TOT: {{ currentDashboard.TOT }}</span>
                                <span v-bind:style="{ color: colorPLAY }">&nbsp;PLAY: {{ currentDashboard.PLAY }}</span>
                                <span v-bind:style="{ color: colorSLEEP }">&nbsp;SLEEP: {{ currentDashboard.SLEEP }}</span>                                
                            </v-card-title>
                        </v-card>
                        <v-data-table
                            :headers="Headers"
                            :items="Records"
                            :pagination.sync="PaginationSync"
                            class="elevation-1">
                            <template slot="items" slot-scope="props">
                                <td>{{ props.item.day }}</td>
                                <td>{{ props.item.task }}</td>
                                <td>{{ props.item.tasktype }}</td>
                                <td>{{ props.item.description }}</td>
                                <td>{{ props.item.time }}</td>
                                <td class="justify-center layout px-0">
                                    <v-icon
                                        small
                                        class="mr-2"
                                        @click="modifyTimeEntry(props.item)">
                                        edit
                                    </v-icon>
                                    <v-icon
                                        small
                                        class="mr-2"
                                        @click="removeTimeEntry(props.item)">
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
};

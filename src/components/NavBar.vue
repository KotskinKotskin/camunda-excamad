<template>
<div>
    <div class="allNavbars">
        <div class="FirstNavBar">
            <b-navbar toggleable="md" type="light">
                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

                <router-link to="/migration">
                    <b-navbar-brand>EXCAMAD</b-navbar-brand>
                </router-link>

                <b-collapse is-nav id="nav_collapse">
                    <b-navbar-nav>
                        <b-nav-item-dropdown text="Processes">
                            <b-dropdown-item to="/migration">Stats and migration</b-dropdown-item>
                            <b-dropdown-item to="/history">History and search</b-dropdown-item>
                            <b-dropdown-item to="/oldactivity">Old processes</b-dropdown-item>
                            <b-dropdown-item to="/embedded">Embed and share</b-dropdown-item>
                            <b-dropdown-item to="/startdefinition">Start processes</b-dropdown-item>
                            <b-dropdown-item to="/complexmigration">Migration</b-dropdown-item>
                            <b-dropdown-item to="/variablebatch">Variables edit</b-dropdown-item>
                            <b-dropdown-item to="/modificationbatch">Modification</b-dropdown-item>
                        </b-nav-item-dropdown>
                        <b-nav-item-dropdown text="Decisions">
                            <b-dropdown-item to="/decisiondefinitions">Stats and definitions</b-dropdown-item>
                            <b-dropdown-item disabled to="/migration">History and search</b-dropdown-item>
                        </b-nav-item-dropdown>

                        <b-nav-item to="/incident">Incidents</b-nav-item>

                        <b-nav-item to="/stream">Live</b-nav-item>

                        <b-nav-item to="/tasklist">Task list</b-nav-item>
                        <b-nav-item-dropdown text="Misc" right>
                            <b-dropdown-item to="/deploytable">Deployments</b-dropdown-item>
                            <b-dropdown-item to="/batch">Batches</b-dropdown-item>
                            <b-dropdown-item to="/groups">Groups</b-dropdown-item>
                            <b-dropdown-item to="/users">Users</b-dropdown-item>
                            <b-dropdown-item to="/report">Report</b-dropdown-item>
                        </b-nav-item-dropdown>
                    </b-navbar-nav>

                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto">
                        <ul class="ulrouter" v-if="routes.length">
                            <b-list-group>
                                <b-list-group-item @click="route.handler" v-for="route in routes" :key="route.name + Math.random()" v-html="route.title"></b-list-group-item>
                            </b-list-group>
                        </ul>
                        <search v-on:setUrlFromSearch="setUrlFromEmit"></search>

                        <b-nav-item to="/settings">Settings</b-nav-item>
                        <b-nav-item-dropdown text="Systems" right>
                            <b-dropdown-item to="/systems">More</b-dropdown-item>
                            <b-dropdown-item-button @click="userSetBaserUrlFromBadge(item.name)" :key="item.name" v-for="item in list">
                                <b v-if="item.name == baseurl">></b>
                                <b-badge pill :variant="calculatePillColorForUrl(item.name)">{{calculateEnvormentForUrl(item.name)}}</b-badge>
                                {{substringUrl(item.name)}}
                            </b-dropdown-item-button>
                            <b-dropdown-divider></b-dropdown-divider>
                            <b-dropdown-item-button @click="clear()">Clear</b-dropdown-item-button>
                            <input class="hide" v-on:keyup.right="setVisible" />
                        </b-nav-item-dropdown>

                        <b-nav-item v-b-tooltip.hover title="FAQ and manual" to="/help">
                            <font-awesome-icon icon="question-circle" />
                        </b-nav-item>
                    </b-navbar-nav>

                    <login></login>
                </b-collapse>
            </b-navbar>
        </div>
        <div class="secondNavBar">
            <b-nav size="sm">
                <small>
                    <b-nav-text>
                        <b-badge class="ml-3" pill :variant="pillColorStatus">{{pillColorStatus}}</b-badge>
                    </b-nav-text>
                </small>
                <small>
                    <b-nav-text>
                        <b-badge class="ml-2" pill :variant="pillColor">{{envortment}}</b-badge>
                    </b-nav-text>
                </small>
                <small>

                    <b-nav-text v-if="authType != null || secureDate != null">
                        <b-badge class="ml-2" pill variant="dark">

                            {{authType}}
                            {{secureDate}}
                        </b-badge>
                    </b-nav-text>

                </small>
                <small>
                    <b-nav-text v-if="baseurl !=''" class="ml-2">{{baseurl}}</b-nav-text>
                </small>

                <small></small>
            </b-nav>
        </div>
    </div>
</div>
</template>

<script>
import {
    library
} from '@fortawesome/fontawesome-svg-core'
import * as access from '@/store/modules/accessSetings'
import {
    faSync,
    faQuestion,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons'
import {
    AUTH_REQUEST,
    AUTH_CAMUNDA_REQUEST
} from '@/store/actions/auth'

library.add(faSync)
library.add(faQuestion)
library.add(faQuestionCircle)

import {
    PRODSUBSTRING,
    TESTSUBSTRING,
    PREFIXURLINPATHTOREMOVE,
    POSTFIXURLINPATHTOREMOVE
} from '@/config/settings'
export default {
    components: {},
    data() {
        return {
            query: '',
            routes: [],
            list: [],
            productionAlert: '',
            testAlert: '',
            privateurl: '',
            status: '',
            substringForProduction: PRODSUBSTRING,
            substringForTest: TESTSUBSTRING,
            statusDate: '',
            envortment: '',
            secretButtonPressed: false
        }
    },
    mounted() {
        if (localStorage.lastUrl) {
            this.userSetBaserUrlFromBadge(localStorage.lastUrl)
        }
        if (localStorage.enableRestPassword == true) {
            if (localStorage.restUsername != null && localStorage.restPassword != null) {
                this.$store.commit("setRestPasswordEnabled", this.enableRestPassword);
                this.$store.commit("setRestsername", localStorage.restUsername);
                this.$store.commit("setRestpassword", localStorage.restPassword);
            }
        }

        this.healthcheck()
        this.getList()
        setTimeout(() => {
            this.healthcheck()
            this.checkEnvortment()
        }, 30)

        setInterval(
            function growUp() {
                this.healthcheck()
                this.checkEnvortment()
            }.bind(this),
            9000
        )
    },
    computed: {
        baseurl() {
            return this.$store.state.baseurl
        },
        workOnBpmAsSerivce() {
            return this.$store.state.workOnBpmasservice
        },
        authType() {
            return this.$store.state.restAuthType
        },
        secureDate() {
            if (this.$store.state.secureDate) {
                return this.$momenttrue(this.$store.state.secureDate).fromNow()
            } else return null
        },
        pillColor() {
            if (this.envortment == 'PRODUCTION') {
                return 'warning'
            }
            if (this.envortment == 'TEST') {
                return 'info'
            }
            if (this.envortment != 'TEST' && this.envortment != 'PRODUCTION') {
                return 'secondary'
            } else return 'warning'
        },
        pillColorStatus() {
            if (this.serverStatus == true) {
                return 'success'
            }
            if (this.serverStatus != true) {
                return 'danger'
            } else return 'danger'
        },
        envortmentFromStore() {
            return this.$store.state.envortment
        },
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        },
        serverStatus() {
            return this.$store.state.serverStatus
        }
    },
    watch: {
        baseurl() {
            this.getList()
        }
    },
    methods: {
        setUrlFromEmit: function (newUrl) {
            this.userSetBaserUrlFromBadge(newUrl)
            this.$router.push({
                name: 'migration'
            })
        },
        refresh() {
            this.$emit('refresh')
        },
        calculatePillColorForUrl(name) {
            var testAlert = name.indexOf(this.substringForTest)
            var productionAlert = name.indexOf(this.substringForProduction)

            if ((productionAlert > 0 || productionAlert < 0) && testAlert > 0) {
                return 'info'
            }
            if (productionAlert > 0 && testAlert < 0) {
                return 'warning'
            }
            if (productionAlert < 0 && testAlert < 0) {
                return 'secondary'
            }
        },
        substringUrl(name) {
            return name
                .replace(PREFIXURLINPATHTOREMOVE, '')
                .replace(POSTFIXURLINPATHTOREMOVE, '')
        },

        calculateEnvormentForUrl(name) {
            var testAlert = name.indexOf(this.substringForTest)
            var productionAlert = name.indexOf(this.substringForProduction)

            if (productionAlert > 0 && testAlert > 0) {
                return 'TEST'
            }
            if (productionAlert > 0 && testAlert < 0) {
                return 'PRODUCTION'
            }
            if (productionAlert < 0 && testAlert < 0) {
                return 'UNKNOWN'
            }
            if (productionAlert < 0 && testAlert > 0) {
                return 'TEST'
            }
        },

        healthcheck() {
            this.$api()
                .get('/engine')
                .then(() => {
                    this.status = 'UP'
                    this.statusDate = Date()
                    this.$store.commit('changeServerStatus', true) //
                })
                .catch(() => {
                    this.status = 'DOWN'
                    this.statusDate = Date()
                    this.$store.commit('changeServerStatus', false) //
                })
        },
        checkEnvortment() {
            this.testAlert = this.baseurl.indexOf(this.substringForTest)
            this.productionAlert = this.baseurl.indexOf(this.substringForProduction)
            if (
                this.testAlert > 0 &&
                (this.productionAlert > 0 || this.productionAlert < 0)
            ) {
                this.envortment = 'TEST'
            }
            if (this.productionAlert > 0 && this.testAlert < 0) {
                this.envortment = 'PRODUCTION'
            }
            if (this.productionAlert < 0 && this.testAlert < 0) {
                this.envortment = 'UNKNOWN'
            }
            this.$store.commit('changeEnvortment', this.envortment) //
        },
        clear() {
            this.list = []
        },
        getList() {
            if (localStorage.urllist) {
                const arr = JSON.parse(localStorage.urllist)

                var result = arr.reduce((unique, o) => {
                    if (!unique.some(obj => obj.name === o.name)) {
                        unique.push(o)
                    }
                    return unique
                }, [])
                this.list = result
            }
        },
        userSetBaserUrlFromBadge(item) {
            this.$notify({
                group: 'foo',
                title: 'Url setuped',
                text: item,
                type: 'success'
            })
            this.$store.commit('setBaseUrl', item)
            this.checkEnvortment()
            this.refresh()

            localStorage.lastUrl = item
            if (localStorage.usertoken != null) {
                var usertokenstring = atob(localStorage.usertoken).split(':')

                var userName = usertokenstring[0]
                var password = usertokenstring[1]
                this.$store
                    .dispatch(AUTH_REQUEST, {
                        userName,
                        password
                    })
                    .then(() => {})
                this.$store
                    .dispatch(AUTH_CAMUNDA_REQUEST, {
                        userName,
                        password
                    })
                    .then(() => {})
            }
        },
        setVisible() {
            this.secretButtonPressed = true
        }
    }
}
</script>

<style>
.allNavbars {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 800;
    background-color: white;
    border-bottom: solid 2px #cecece;
}

.hide {
    border: solid 0px;
    height: 35px;
}

.secondNavBar {
    background: #f2f2f2;
}

.routerinput {
    font-size: 0.75rem;
    padding: 0.5rem;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid rgb(230, 230, 230);
    outline: none;
    box-sizing: border-box;
}

.ulrouter {
    margin-top: 40px;
    position: absolute;
    list-style: none;
    z-index: 500;
    padding: 0;
    background-color: rgb(250, 250, 250);
    width: 145px;
}

.lirouter {
    display: block;
    z-index: 500;
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}

.lirouter:hover {
    background-color: #eee;
}
</style>

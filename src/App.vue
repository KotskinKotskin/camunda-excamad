<template>
<div id="app">
    <navbar v-on:refresh="refreshRoute" v-if="!dashboard"></navbar>
    <transition name="fade">
        <div id="containerOverRouter" :class="containerClass">
            <router-view :key="$route.fullPath + key" class="mt-3" />
        </div>
    </transition>
    <notifications group="foo" />
    <the-footer class="footer"></the-footer>
</div>
</template>

<script>
import Navbar from "@/components/NavBar.vue";
import {
    AUTH_REQUEST,
    AUTH_CAMUNDA_REQUEST
} from "@/store/actions/auth";

export default {
    name: "home",
    components: {
        Navbar
    },
    data() {
        return {
            containerClass: "",
            key: 1,
            dashboard: false
        };
    },
    computed: {
        baseurl() {
            return this.$store.state.baseurl
        },
    },
    watch: {
        baseurl(newValue) {
            this.$router.push({
                query: {
                    baseurl: newValue
                }
            })
        }
    },

    created() {
        if (this.$route.query.baseurl) {
            this.$store.commit("setBaseUrl", this.$route.query.baseurl);
        }
    },
    mounted() {
        if (this.$route.query.dashboard == "true") {
            this.dashboard = true;
            this.containerClass = "container width content";
        } else this.dashboard = false;

        setTimeout(() => {
            this.ContainerOrNot();
        }, 50);

        if (localStorage.usertoken != null) {
            var usertokenstring = atob(localStorage.usertoken).split(":");

            var userName = usertokenstring[0];
            var password = usertokenstring[1];
            this.$store.dispatch(AUTH_REQUEST, {
                userName,
                password
            }).then(() => {});
            this.$store
                .dispatch(AUTH_CAMUNDA_REQUEST, {
                    userName,
                    password
                })
                .then(() => {});
        }
        setTimeout(() => {
            if (this.baseurl != null) {

                if (localStorage.restAuthArray) {
                    var array = JSON.parse(localStorage.restAuthArray)
                    var url = array.find(x => x.url == this.baseurl)
                    if (url) {
               
                        this.$store.commit("setRestsername", url.login);
                        this.$store.commit("setRestpassword", url.password);
                        this.$store.commit("setRestToken", url.JWT);
                        this.$store.commit("setRestAuthType", url.type);
                         this.$store.commit("setRestPasswordEnabled", true);
                        this.$store.commit("setSecureDate", url.date)
                    }
                }
            }
        }, 300);

    },
    methods: {
        refreshRoute() {
            this.key = this.key + 1;
        },
        ContainerOrNot: function () {
            this.containerClass = "container content";
            if (this.dashboard == true) {
                this.containerClass = "";
            }
        }
    }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

#containerOverRouter {
    max-width: 1400px;
    margin-top: 110px;
}

.content {
    min-height: calc(100vh - 20px);
}

.footer {
    height: 50px;
}
</style>

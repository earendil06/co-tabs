import Vue from 'vue'
import App from './App.vue'
import firebase from "firebase";
import router from "./router";

Vue.config.productionTip = false;

export class Music {
    constructor() {
        this.coid = "";
        this.title = "";
        this.rawText = "";
        this.instrument = "ukulele";
        this.lyrics = "";
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyADKild1U0LwKOAMQcl56HtTa-l7CPlANY",
    authDomain: "cotabs-d4fac.firebaseapp.com",
    databaseURL: "https://cotabs-d4fac.firebaseio.com",
    projectId: "cotabs-d4fac",
    storageBucket: "cotabs-d4fac.appspot.com",
    messagingSenderId: "376742261185",
    appId: "1:376742261185:web:0f324f7b951793b458ff40"
};
firebase.initializeApp(firebaseConfig);

let app = '';
firebase.auth().onAuthStateChanged(function () {
    if (!app) {
        app = new Vue({
            router,
            render: h => h(App),
        }).$mount('#app');
    }
});

window.instruments = ["guitar", "ukulele"];
window.tabs = [];
firebase.firestore().collection("tabs")
    .onSnapshot(function (snapshot) {
        const tabs = [];
        snapshot.forEach(function (tab) {
            const t = tab.data();
            tabs.push(t);
        });
        window.tabs = tabs;
    });

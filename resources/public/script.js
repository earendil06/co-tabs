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
const db = firebase.firestore();

const app = new Vue({
    el: '#app',
    data: {
        editor: "",
        title: "",
        mouseOver: "",
        musicsDb: [],
        email: "",
        password: "",
        user: null,
        resultHtml: "",
        inputModal: "",
        titleToRemove: "",
        coid: ""
    },
    computed: {
        model: function () {
            return {coid: this.coid, title: this.title, rawText: this.editor};
        },
        logged: function () {
            return this.user != null;
        },
        firebaseEmail: function () {
            return this.user != null ? this.user.email : ""
        },
        noteViewerSrc: function () {
            return this.mouseOver !== "" ? "images/" + this.mouseOver + ".png" : ""
        },
        downloadDisabled: function () {
            return this.title.trim() === "" || this.editor.trim() === ""
        },
        saveDisabled: function () {
            return this.title.trim() === "";
        }
    },
    watch: {
        model: function (value, old) {
            console.log(value);
            axios.post(url + '/markdown', {
                body: value
            }).then((response) => {
                const converter = new showdown.Converter();
                converter.setOption('tables', 'true');
                this.resultHtml = converter.makeHtml(response.data);
                db.collection(firebase.auth().currentUser.uid).doc(this.coid).set(value);
            });

        }
    },
    methods: {
        mouseOverNote: function (event) {
            this.mouseOver = event.target.innerText;
        },
        mouseOutNote: function (event) {
            this.mouseOver = "";
        },
        loginFirebase: function () {
            firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then(() => this.user = firebase.auth().currentUser);
        },
        logoutFirebase: function () {
            firebase.auth().signOut().then(() => this.user = firebase.auth().currentUser);

        },
        downloadAsPDF: function () {
            const element = document.getElementById("result");
            html2pdf()
                .from(element)
                .save();
        },
        createMusic: function () {
            this.title = this.inputModal;
            this.editor = "";
            this.coid = Math.random().toString(36).substring(7);
            db.collection(firebase.auth().currentUser.uid).doc(this.coid).set(this.model);
        },
        loadOnline: function(coid) {
            const found = this.musicsDb.find(e => e.coid === coid);
            this.title = found.title;
            this.editor = found.rawText;
            this.coid = found.coid;
        },
        rmOnline: function () {
            const found = this.musicsDb.find(e => e.coid === this.coidToRemove);
            db.collection(firebase.auth().currentUser.uid).doc(found.coid).delete();
            if (this.coidToRemove === this.coid) {
                this.title = "";
                this.editor = "";
                this.coid = "";
            }
        },
        setCoidToRemove: function (coid) {
            this.coidToRemove = coid;
        }
    }
});

firebase.auth().onAuthStateChanged(function (user) {
    app.user = user;
    db.collection(user.uid)
        .onSnapshot(function (querySnapshot) {
            const tabs = [];
            querySnapshot.forEach(function (tab) {
                tabs.push(tab.data());
            });
            app.musicsDb = tabs;
        });
});

$('#newModal').on('show.bs.modal', function (e) {
    app.inputModal = "";
});

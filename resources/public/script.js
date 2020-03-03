const url = 'https://cotabs.florentpastor.com';
// const url = 'http://localhost:3000';

const app = new Vue({
    el: '#app',
    data: {
        tabs: "",
        title: "",
        result: "",
        notes: [],
        mouseOver: "",
        store: []
        // user: ""
    },
    computed: {
        model: function () {
            const lines = this.tabs.split("\n");
            const array = lines.map(e => {
                const elements = e.split(" ");
                const note = elements[0];
                const arrows = elements[1];
                const rep = parseInt(elements[2]);
                return {note: note, arrows: arrows, repeat: rep};
            });
            return {title: this.title, tabs: array, rawText: this.tabs};
        },
        noteViewer: function () {
            return "images/" + this.mouseOver + ".png"
        }
    },
    watch: {
        model: function (value, old) {
            axios.post(url + '/markdown', {
                // axios.post('http://localhost:3000/markdown', {
                body: value
            }).then(response => {
                const converter = new showdown.Converter();
                converter.setOption('tables', 'true');
                const text = response.data;
                this.result = converter.makeHtml(text);
            }).catch(e => {
                console.log(e)
            });
        },
        tabs: function (value, old) {
            updatedb(this.model);
        }
    },
    methods: {
        test: function (event) {
            this.mouseOver = event.target.innerText;
            if (event) {
                event.preventDefault()
            }
        },
        clickStore: function (event) {
            const title = event.target.innerText;
            const found = this.store.find(e => e.title === title);
            this.title = title;
            this.tabs = found.rawText;
        }
    },
    mounted() {
        axios
            .get(url + "/notes")
            .then(response => this.notes = response.data)
    }
});

function generatePDF() {
    const element = document.getElementById("result");
    html2pdf()
        .from(element)
        .save();
}

function login() {
    firebase.auth().signInWithEmailAndPassword($("#username").val(), $("#password").val()).catch(function (error) {
        console.log("login failed");
    });
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    db.collection(user.uid)
        .onSnapshot(function (querySnapshot) {
            const tabs = [];
            querySnapshot.forEach(function (tab) {
                tabs.push(tab.data());
            });
            app.store = tabs;
        });
});

const db = firebase.firestore();

function updatedb(value) {
    db.collection(firebase.auth().currentUser.uid).doc(value.title).set(value);
}





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

const recordAudio = () => {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({audio: true})
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                const start = () => {
                    mediaRecorder.start();
                };

                const stop = () => {
                    return new Promise(resolve => {
                        mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks);
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            const play = () => {
                                audio.play();
                            };

                            resolve({audioBlob, audioUrl, play});
                        });

                        mediaRecorder.stop();
                    });
                };

                resolve({start, stop});
            });
    });
};

const MODE_EDIT = "edit";
const MODE_VIEW = "view";

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
        coid: "",
        listURLAudio: [],
        recorder: null,
        mode: MODE_EDIT,
        lyrics: ""
    },
    computed: {
        isModeView: function () {
            return this.mode === MODE_VIEW;
        },
        isModeEdit: function () {
            return this.mode === MODE_EDIT;
        },
        model: function () {
            return {coid: this.coid, title: this.title, rawText: this.editor, lyrics: this.lyrics};
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
        },
        listRecords: function () {
            const found = this.musicsDb.find(e => e.coid === this.coid);
            if (found != null) {
                return found.records;
            }
            return [];
        }
    },
    watch: {
        model: function (value, old) {
            console.log(value);
            axios.post('/markdown', {
                body: value
            }).then((response) => {
                const converter = new showdown.Converter();
                converter.setOption('tables', 'true');
                this.resultHtml = converter.makeHtml(response.data);
                db.collection(firebase.auth().currentUser.uid).doc(this.coid).set(value, {merge: true});
            });

        },
        listRecords: function (value, old) {
            if (value.length === old.length) {
                return;
            }
            const self = this;
            this.listURLAudio = [];
            const found = this.musicsDb.find(e => e.coid === this.coid);
            if (found != null) {
                const starsRef = firebase.storage().ref();
                found.records.forEach(e => {
                    const child = starsRef.child(firebase.auth().currentUser.uid + "/" + e);
                    child.getDownloadURL().then(function (url) {
                        self.listURLAudio.push({
                            url: url,
                            name: e
                        });
                    })
                });
            }
        }
    },
    methods: {
        switchModeView: function () {
            this.mode = MODE_VIEW;
        },
        switchModeEdit: function () {
            this.mode = MODE_EDIT;
        },
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
            this.lyrics = "";
            this.coid = Math.random().toString(36).substring(7);
            db.collection(firebase.auth().currentUser.uid).doc(this.coid).set(this.model);
        },
        loadOnline: function (coid) {
            const found = this.musicsDb.find(e => e.coid === coid);
            this.title = found.title;
            this.editor = found.rawText;
            this.coid = found.coid;
            this.lyrics = found.lyrics;
        },
        rmOnline: function () {
            const found = this.musicsDb.find(e => e.coid === this.coidToRemove);
            db.collection(firebase.auth().currentUser.uid).doc(found.coid).delete();
            if (this.coidToRemove === this.coid) {
                this.title = "";
                this.editor = "";
                this.coid = "";
                this.lyrics = "";
            }
        },
        setCoidToRemove: function (coid) {
            this.coidToRemove = coid;
        },
        removeAudio: function (name) {
            const storageRef = firebase.storage().ref();
            const child = storageRef.child(firebase.auth().currentUser.uid + '/' + name);
            child.delete().then(function (snapshot) {
                db.collection(firebase.auth().currentUser.uid).doc(app.coid).set(
                    {records: firebase.firestore.FieldValue.arrayRemove(name)}, {merge: true}
                );
            });
        },

        startAudio: async function () {
            this.recorder = await recordAudio();
            this.recorder.start();
        },
        stopAudio: async function () {
            const self = this;
            const audio = await self.recorder.stop();
            const storageRef = firebase.storage().ref();
            const name = Math.random().toString(36).substring(7);
            const child = storageRef.child(firebase.auth().currentUser.uid + '/' + name);
            child.put(audio.audioBlob).then(function (snapshot) {
                db.collection(firebase.auth().currentUser.uid).doc(self.coid).set(
                    {records: firebase.firestore.FieldValue.arrayUnion(name)}, {merge: true}
                );
            });
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

$('#libraryModal').on('show.bs.modal', function (e) {
    app.inputModal = "";
});

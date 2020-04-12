<template>
  <div>
    <button :disabled="stopDisabled" class="btn-danger btn btn-sm" style="float: right; margin-right: 30px"
            @click="stopAudio">
      <i class="fas fa-stop"></i>
    </button>
    <button :disabled="startDisabled" class="btn-success btn btn-sm" style="float: right"
            @click="startAudio">
      <i class="fas fa-play"></i>
    </button>
  </div>
</template>

<script>
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

    import firebase from "firebase"

    export default {
        name: "Recorder",
        props: {
            currentId: String
        },
        data: function () {
            return {
                recorder: null
            }
        },
        computed: {
            stopDisabled: function () {
                return this.recorder == null || this.currentId === "";
            },
            startDisabled: function () {
                return this.recorder != null || this.currentId === "";
            }
        },
        methods: {
            startAudio: async function () {
                this.recorder = await recordAudio();
                this.recorder.start();
            },
            stopAudio: async function () {
                const userId = firebase.auth().currentUser.uid;
                const audio = await this.recorder.stop();
                this.recorder = null;
                const storageRef = firebase.storage().ref();
                const name = Math.random().toString(36).substring(7);
                const child = storageRef.child(userId + '/' + name);
                const self = this;
                child.put(audio.audioBlob).then(function () {
                    firebase.firestore().collection(userId).doc(self.currentId).set({
                        records: firebase.firestore.FieldValue.arrayUnion(name)
                    }, {merge: true});
                });
            }
        }
    }
</script>

<style scoped>

</style>

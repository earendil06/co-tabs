<template>
  <table>
    <Modal :on-yes="removeAudio" title="Sure?" no-msg="NO" yes-msg="YES" yes-class="danger" modal-id="soundDelete">
      Do you really want to delete the record?
    </Modal>
    <tr v-for="item in sounds" :key="item.name">
      <td>{{item.name}}</td>
      <td>
        <audio controls :src="item.url">
          Your browser does not support the
          <code>audio</code> element.
        </audio>
      </td>
      <td>
        <button @click="setAudioToRemove(item.name)"
                class="btn-danger btn btn-sm" data-toggle="modal" data-target="#soundDelete">
          <i class="fas fa-times"></i>
        </button>
      </td>
    </tr>
  </table>
</template>

<script>
    import firebase from "firebase";
    import Modal from "./Modal";

    export default {
        name: "RecordsLibrary",
        components: {Modal},
        props: {
            currentId: String
        },
        data: function () {
            return {
                sounds: []
            }
        },
        methods: {
            removeAudio: function () {
                const self = this;
                const storageRef = firebase.storage().ref();
                const child = storageRef.child(firebase.auth().currentUser.uid + '/' + this.audioToRemove);
                child.delete().then(function () {
                    firebase.firestore().collection(firebase.auth().currentUser.uid).doc(self.currentId).set(
                        {records: firebase.firestore.FieldValue.arrayRemove(self.audioToRemove)}, {merge: true}
                    );
                });
            },
            setAudioToRemove: function (id) {
                this.audioToRemove = id;
            }
        },
        watch: {
            currentId: function (value) {
                const self = this;
                firebase.firestore()
                    .collection(firebase.auth().currentUser.uid)
                    .where("coid", "==", value)
                    .onSnapshot(function (querySnapshot) {
                        self.sounds = [];
                        querySnapshot.forEach(function (doc) {
                            const starsRef = firebase.storage().ref();
                            doc.data().records.forEach(id => {
                                const child = starsRef.child(firebase.auth().currentUser.uid + "/" + id);
                                child.getDownloadURL().then(function (url) {
                                    self.sounds.push({
                                        url: url,
                                        name: id
                                    });
                                })
                            });
                        });
                    });
            }
        }
    }
</script>

<style scoped>

</style>

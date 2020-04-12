<template>
  <div>
    <ul class="list-group">
      <li class="list-group-item" v-for="music in musics" :key="music.coid">
        <span>{{music.title}}</span>
        <div v-if="music.deleteMode" style="float: right">
          <button @click="remove(music.coid)" type="button" class="btn btn-success btn-sm">
            <i class="fas fa-check"></i>
          </button>
          <button type="button" class="btn btn-warning btn-sm" @click="deleteMode(music, false)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-else style="float: right">
          <button data-dismiss="modal" @click="load(music)" type="button" class="btn btn-primary btn-sm">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="deleteMode(music, true)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      
      </li>
    </ul>
    <div class="input-group mb-3" style="padding-top: 15px">
      <div class="input-group-prepend">
        <span class="input-group-text" id="titleModal">Title</span>
      </div>
      <input type="text" class="form-control" aria-label="Sizing example input"
             aria-describedby="titleModal" v-model="newTitle">
      <button type="button" class="btn btn-primary" @click="create" :disabled="createButtonDisabled">
        Create
      </button>
    </div>
  </div>
</template>

<script>
    import firebase from "firebase";
    import {Music} from "../main";

    export default {
        name: "MusicLibrary",
        data: function () {
            return {
                newTitle: "",
                musics: []
            }
        },
        computed: {
            createButtonDisabled: function () {
                return this.newTitle === '';
            }
        },
        methods: {
            remove: async function (id) {
                await firebase.firestore()
                    .collection(firebase.auth().currentUser.uid)
                    .doc(id)
                    .delete();
                this.$emit("musicRemoved", id);
            },
            create: function () {
                const self = this;
                const uid = Math.random().toString(36).substring(7);
                const music = new Music();
                music.coid = uid;
                music.title = this.newTitle;
                firebase.firestore()
                    .collection(firebase.auth().currentUser.uid)
                    .doc(uid).set(Object.assign({}, music)).then(function () {
                        self.newTitle = "";
                    }
                );

            },
            load: function (music) {
                this.$emit("musicLoaded", music);
            },
            deleteMode: function (music, bool) {
                this.musics.forEach(m => m.deleteMode = false);
                music.deleteMode = bool;
            }
        },
        mounted() {
            let self = this;
            firebase.firestore().collection(firebase.auth().currentUser.uid)
                .onSnapshot(function (snapshot) {
                    const tabs = [];
                    snapshot.forEach(function (tab) {
                        const music = tab.data();
                        music.deleteMode = false;
                        tabs.push(music);
                    });
                    self.musics = tabs;
                });
        }
    }
</script>

<style scoped>

</style>

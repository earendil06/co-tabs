<template>
  <div>
    <Modal title="My library" no-msg="Close" yes-msg="" modal-id="libraryModal">
      <MusicLibrary @musicLoaded="loadMusic" @musicRemoved="musicRemoved"/>
    </Modal>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand">Co tabs!</a>
        <div>
          <div class="btn-group btn-group-sm" role="group" aria-label="Mode">
            <button :disabled="isInViewMode" @click="switchViewMode" type="button" class="btn btn-primary"><i
                class="fas fa-eye"></i></button>
            <button :disabled="isInEditMode" @click="switchEditMode" type="button" class="btn btn-primary"><i
                class="fas fa-edit"></i></button>
            <button :disabled="isInCreatorMode" @click="switchCreatorMode" type="button" class="btn btn-primary"><i
                class="fas fa-guitar"></i></button>
          </div>
        </div>
        
        <button style="margin-left: 30px" type="button" data-toggle="modal" data-target="#libraryModal"
                class="btn btn-primary btn-sm">
          <i class="fas fa-music"></i>
        </button>
        
        
        <button type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive"
                aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler"><span
            class="navbar-toggler-icon"></span></button>
        <div id="navbarResponsive" class="collapse navbar-collapse">
          <ul class="navbar-nav ml-auto">
            <li class="nav-item">
              <span style="color: white; padding-right: 15px">
                Welcome <b>{{username}}</b>
              </span>
              <button class="btn-primary btn btn-sm" @click="logout">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container-fluid" style="padding-top: 10px">
      <div class="row" v-if="isInViewMode">
        <div class="col-5">
          <div class="card">
            <div class="card-header">
              Lyrics
            </div>
            <div class="card-body">
              <LyricsViewer :lyrics="model.lyrics"/>
            </div>
          </div>
        </div>
        <div class="col-7">
          <div class="card">
            <div class="card-header">
              Result
            </div>
            <div class="card-body">
              <ResultViewer :title="model.title" :instrument="model.instrument" :rawText="model.rawText"/>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              Records
            </div>
            <div class="card-body">
              <Recorder :current-id="model.coid"></Recorder>
              <RecordsLibrary :current-id="model.coid"></RecordsLibrary>
            </div>
          </div>
        
        </div>
      </div>
      
      <div class="row" v-if="isInEditMode">
        <div class="col-5">
          <div class="card">
            <div class="card-header">
              Editor
            </div>
            <div class="card-body">
              <MusicEditor editorid="editor1" :model="model" :disabled="editorDisabled"/>
            </div>
          </div>
        </div>
        <div class="col-7">
          <div class="card">
            <div class="card-header">
              Result
            </div>
            <div class="card-body">
              <ResultViewer hide-download :title="model.title" :instrument="model.instrument" :rawText="model.rawText"/>
            </div>
          </div>
        
        </div>
      </div>
      
      <div class="row" v-if="isInCreatorMode">
        <div class="col-5">
          <div class="card">
            <div class="card-header">
              Tab Library
            </div>
            <div class="card-body">
              <TabLibrary></TabLibrary>
            </div>
          </div>
        </div>
        <div class="col-7">
          <div class="card">
            <div class="card-header">
              Tab Creator
            </div>
            <div class="card-body">
              <TabCreator/>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  </div>
</template>

<script>

    import firebase from 'firebase'
    import MusicLibrary from "../components/MusicLibrary";
    import LyricsViewer from "../components/LyricsViewer";
    import Modal from "../components/Modal";
    import MusicEditor from "../components/MusicEditor";
    import ResultViewer from "../components/ResultViewer";
    import {Music} from "../main";
    import Recorder from "../components/Recorder";
    import RecordsLibrary from "../components/RecordsLibrary";
    import TabCreator from "../components/TabCreator";
    import TabLibrary from "../components/TabLibrary";

    const VIEW_MODE = "view";
    const EDIT_MODE = "edit";
    const CREATOR_MODE = "creator";

    export default {
        name: "Home",
        components: {
            TabLibrary,
            TabCreator,
            RecordsLibrary,
            Recorder,
            MusicLibrary,
            LyricsViewer,
            Modal, MusicEditor, ResultViewer
        },
        data: function () {
            return {
                model: new Music(),
                mode: VIEW_MODE
            };
        },
        computed: {
            username: () => {
                return firebase.auth().currentUser.email;
            },
            editorDisabled: function () {
                return this.model.coid === "";
            },
            isInViewMode: function () {
                return this.mode === VIEW_MODE;
            },
            isInEditMode: function () {
                return this.mode === EDIT_MODE;
            },
            isInCreatorMode: function () {
                return this.mode === CREATOR_MODE;
            }
        },
        methods: {
            logout: function () {
                firebase.auth().signOut().then(() => {
                    this.$router.replace("login");
                });
            },
            loadMusic: function (music) {
                this.model = music;
            },
            musicRemoved: function (id) {
                if (this.model.coid === id) {
                    this.model = new Music();
                }
            },
            switchMode: function (mode) {
                this.mode = mode;
            },
            switchViewMode: function () {
                this.switchMode(VIEW_MODE)
            },
            switchEditMode: function () {
                this.switchMode(EDIT_MODE)
            },
            switchCreatorMode: function () {
                this.switchMode(CREATOR_MODE)
            }
        },
        watch: {
            model: {
                handler: function (value) {
                    if (value.coid !== "") {
                        const save = new Music();
                        save.coid = value.coid;
                        save.title = value.title;
                        save.rawText = value.rawText;
                        save.instrument = value.instrument;
                        save.lyrics = value.lyrics;
                        firebase.firestore()
                            .collection(firebase.auth().currentUser.uid)
                            .doc(save.coid).set(Object.assign({}, save), {merge: true});
                    }
                }, deep: true
            }
        }
    }
</script>

<style scoped>

</style>

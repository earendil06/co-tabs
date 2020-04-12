<template>
  <div>
    
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text">Title</span>
      </div>
      <input type="text" class="form-control" aria-label="Sizing example input"
             aria-describedby="title" v-model="model.title" :disabled="disabled">
    </div>
    
    <div class="form-group">
      <label :for="idFormInstruments">Instrument</label>
      <select class="form-control" :id="idFormInstruments" v-model="model.instrument" :disabled="disabled">
        <option v-for="instr in instruments" :key="instr">{{instr}}</option>
      </select>
    </div>
    
    <div class="form-group">
      <label :for="idFormTabs">Tabs:</label>
      <textarea style="height: 150px" class="form-control" :id="idFormTabs" v-model="model.rawText"
                :disabled="disabled" rows="3"></textarea>
    </div>
    
    <div class="form-group">
      <label :for="idFormLyrics">Lyrics:</label>
      <textarea :id="idFormLyrics" style="height: 200px" class="form-control" v-model="model.lyrics"
                :disabled="disabled"></textarea>
    </div>
  
  
  </div>

</template>

<script>

    export default {
        name: "MusicEditor",
        props: {
            disabled: Boolean,
            editorid: String,
            model: Object
        },
        computed: {
            idFormInstruments: function () {
                return this.editorid + "instr";
            },
            idFormTabs: function () {
                return this.editorid + "tabs";
            },
            idFormLyrics: function () {
                return this.editorid + "lyrics";
            },
            instruments: function () {
                return window.instruments;
            }
        }
    }
</script>

<style scoped>

</style>

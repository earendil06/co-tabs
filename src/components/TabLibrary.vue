<template>
  <div :id="'accordion' + uuid">
    <div v-for="(group, i) in groups" :key="i" class="card">
      <div class="card-header" :id="'headingOne' + i">
        <h5 class="mb-0">
          <button class="btn btn-link" data-toggle="collapse" :data-target="'#collapseOne' + i" aria-expanded="true"
                  :aria-controls="'collapseOne'+i">
            {{group[0]}}
          </button>
        </h5>
      </div>
      
      <div :id="'collapseOne'+i" class="collapse" :aria-labelledby="'headingOne'+i"
           :data-parent="'#accordion'+uuid">
        <div class="card-body row">
          <div class="col-8">
            <ul>
              <li v-for="note in Array.from(new Set(group[1].map(m => m.title[0].toUpperCase())))" :key="note">
                <span style="margin-left: 3px" v-for="(tab, idx) in group[1].filter(f => f.title.toUpperCase().startsWith(note)).sort()"
                      :key="idx"
                      @mouseover="setOver(group[0], tab.title)" class="badge badge-info">{{tab.title}}</span>
              </li>
            </ul>
          </div>
          <div class="col-4">
            <TabCreator v-for="(tab, idx) in group[1]" :key="idx"
                        v-show="showTab(group[0], tab.title)" image
                        :initial-model="getModel(group[0], tab.title)"></TabCreator>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import firebase from "firebase"
    import TabCreator from "./TabCreator";

    export default {
        name: "TabLibrary",
        components: {TabCreator},
        data: function () {
            return {
                uuid: Math.random().toString(36).substring(7),
                tabs: [],
                currentOverTab: ""
            }
        },
        computed: {
            groups: function () {
                const groupBy = function (list, keyGetter) {
                    const map = new Map();
                    list.forEach(item => {
                        const key = keyGetter(item);
                        const collection = map.get(key);
                        if (!collection) {
                            map.set(key, [item]);
                        } else {
                            collection.push(item);
                        }
                    });
                    return map;
                }

                return groupBy(this.tabs, k => k.instrument)
            }
        },
        methods: {
            getModel: function (i, n) {
                return {instrument: i, title: n}
            },
            showTab: function (i, n) {
                return this.currentOverTab === i + n;
            },
            setOver: function (i, n) {
                this.currentOverTab = i + n;
            }
        },
        mounted() {
            let self = this;
            firebase.firestore().collection("tabs")
                .onSnapshot(function (snapshot) {
                    self.tabs = [];
                    snapshot.forEach(function (tab) {
                        self.tabs.push(tab.data());
                    });
                });
        }
    }
</script>

<style scoped>

</style>

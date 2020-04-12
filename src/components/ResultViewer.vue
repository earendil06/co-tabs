<template>

  <div>
    <button v-if="!hideDownload" class="btn-primary btn btn-sm" @click="download" :disabled="downloadDisabled"
            style="float: right; ">
      Download PDF
    </button>
  
    <div id="resultContent">
      <h3 style="text-align: center"><u>{{title}}</u></h3>
      <div v-for="(part, indexPart) in parts" :key="part.label"
           :class="{labelSpace: part.label !== '' && indexPart > 0}">
        <h5 style="color: darkgreen">{{part.label}}</h5>
        <table>
          <thead>
          <tr>
            <th v-for="(tab, index) in part.tabs" :key="index" style="text-align:center;"></th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td v-for="(tab, index) in part.tabs" :key="index" style="text-align:center;">
              <TabCreator image :initial-model="{instrument, title:tab.note}"></TabCreator>
<!--              <img :src="getUrl(tab.note)" alt="">-->
            </td>
          </tr>
          <tr>
            <td v-for="(tab, index) in part.tabs" :key="index" style="text-align:center;">
            <span style="font-size: 1.5em"
                v-for="(arrow, indexArrow) in tab.arrows" :key="indexArrow" v-html="getArrowSymbol(arrow)">
            </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>

<script>
    import TabCreator from "./TabCreator";
    export default {
        name: "ResultViewer",
        components: {TabCreator},
        props: {
            title: String,
            instrument: String,
            rawText: String,
            hideDownload: Boolean
        },
        computed: {
            downloadDisabled: function () {
                return this.title.trim() === "";
            },
            lines: function () {
                return this.rawText.trim().split("\n")
                    .map(line => line.trim()).filter(f => f.length > 0);
            },
            parts: function () {
                const parts = [];

                let part = {
                    label: "",
                    tabs: []
                };
                this.lines.forEach(line => {
                    if (line.endsWith(":")) {
                        part = {
                            label: "",
                            tabs: []
                        };
                        part.label = line.substring(0, line.indexOf(":"));
                        parts.push(part);
                    } else if (line === "---") {
                        part = {
                            label: "",
                            tabs: []
                        };
                        parts.push(part);
                    } else {
                        const [note, arrows, repeat] = line.split(" ").filter(f => f.length > 0);
                        const tab = {};
                        tab.note = note;
                        tab.arrows = arrows || "";
                        const rep = parseInt(repeat) || 1;
                        for (let i = 0; i < rep; i++) {
                            part.tabs.push(tab);
                        }
                    }
                });

                return parts;
            }
        },
        methods: {
            download: function () {
                const element = document.getElementById("resultContent");
                window.html2pdf()
                    .from(element)
                    .save();
            },
            getUrl: function (note) {
                return "images/" + this.instrument + "/" + note + ".png";
            },
            getArrowSymbol: function (arrow) {
                if (arrow === "d") {
                    return "&#8595;"
                }
                if (arrow === "u") {
                    return "&#8593;"
                }
                if (arrow === "_") {
                    return "&nbsp;"
                }
                if (arrow === "(") {
                    return "&#40;"
                }
                if (arrow === ")") {
                    return "&#41;"
                }
            }
        }
    }
</script>

<style scoped>
  .labelSpace {
    padding-top: 30px;
  }
</style>

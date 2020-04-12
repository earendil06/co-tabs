<template>
  <div>
    <div v-show="!image">
      <div class="row justify-content-center">
        <div class="col-3" style="padding-bottom: 10px">
          <label class="sr-only" >Username</label>
          <div class="input-group mb-2">
            <div class="input-group-prepend">
              <div class="input-group-text">Title</div>
            </div>
            <input v-model="title" type="text" class="form-control"  placeholder="">
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-4">
          <div class="col-auto" style="padding-bottom: 10px">
            <select class="form-control" v-model="instrument">
              <option v-for="instr in instruments" :key="instr">{{instr}}</option>
            </select>
          </div>
          <div class="col-auto">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Gap</div>
              </div>
              <input v-model="caseN" type="number" class="form-control" placeholder="">
            </div>
          </div>
        </div>
        <div class="col-4">
          <canvas :id="'tabCanvas' + uid" :width="canvasWidth" :height="canvasHeight"
                  style="background-color: white; border: 2px solid black">
          </canvas>
        </div>
        <div class="col-4">
          <div class="col-auto">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Fret 1</div>
              </div>
              <input v-model="case1" type="text" class="form-control" placeholder="">
            </div>
          </div>
          <div class="col-auto">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Fret 2</div>
              </div>
              <input v-model="case2" type="text" class="form-control" placeholder="">
            </div>
          </div>
  
          <div class="col-auto">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Fret 3</div>
              </div>
              <input v-model="case3" type="text" class="form-control" placeholder="">
            </div>
          </div>
  
          <div class="col-auto">
            <div class="input-group mb-2">
              <div class="input-group-prepend">
                <div class="input-group-text">Fret 4</div>
              </div>
              <input v-model="case4" type="text" class="form-control" placeholder="">
            </div>
          </div>
        
        </div>
      </div>
      
      <div class="row">
        <div class="col">
          <div class="btn-group" role="group" aria-label="Basic example">
            <button @click="save" type="button" class="btn btn-success">Save</button>
            <button @click="del" type="button" class="btn btn-danger">Delete</button>
          </div>
        </div>
      </div>
      

    </div>
    
    <div v-show="image">
      <div :id="'replace' + uid"></div>
    </div>
  </div>

</template>

<script>
    import $ from "jquery"
    import firebase from "firebase";

    export default {
        name: "TabCreator",
        props: {
            initialModel: Object,
            image: Boolean
        },
        data: function () {
            const found = window.tabs.find(f =>
                f.title === this.initialModel?.title && f.instrument === this.initialModel?.instrument)
            return {
                uid: Math.random().toString(36).substring(7),
                canvasWidth: 250,
                canvasHeight: 400,
                instrument: found?.instrument || "guitar",
                title: found?.title || "",
                case1: found?.case1 || "",
                case2: found?.case2 || "",
                case3: found?.case3 || "",
                case4: found?.case4 || "",
                caseN: found?.caseN || 1
            };
        },
        computed: {
            instruments: function () {
                return window.instruments;
            },
            numberCases: function () {
                return 4;
            },
            numberStrings: function () {
                switch (this.instrument) {
                    case "guitar":
                        return 6
                    case "ukulele":
                        return 4
                }
                return 0
            }
        },
        watch: {
            $data: {
                handler: function () {
                    this.draw();
                    if (this.image) {
                        this.updateImg();
                    }
                },
                deep: true
            },
            initialModel: function () {
                const found = window.tabs.find(f =>
                    f.title === this.initialModel?.title && f.instrument === this.initialModel?.instrument);
                this.instrument = found?.instrument || "guitar";
                this.title = found?.title || "";
                this.case1 = found?.case1 || "";
                this.case2 = found?.case2 || "";
                this.case3 = found?.case3 || "";
                this.case4 = found?.case4 || "";
                this.caseN = found?.caseN || "";
            },
            title: function () {
                const found = window.tabs.find(f =>
                    f.title === this.title && f.instrument === this.instrument);
                if (found) {
                    this.instrument = found?.instrument || "guitar";
                    this.title = found?.title || "";
                    this.case1 = found?.case1 || "";
                    this.case2 = found?.case2 || "";
                    this.case3 = found?.case3 || "";
                    this.case4 = found?.case4 || "";
                    this.caseN = found?.caseN || "";
                }
            }
        },
        methods: {
            draw: function () {
                const canvas = document.getElementById('tabCanvas' + this.uid)
                const ctx = canvas.getContext('2d')
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineWidth = 5;

                const spaceUp = 60;
                const spaceDown = 10;
                const spaceLeft = 60;
                const spaceRight = 30;
                //draw title
                ctx.font = "" + (spaceUp / 2) + "px Arial";
                ctx.fillText(this.title, this.canvasWidth / 2 - (this.title.length * (spaceUp / 6)), spaceUp / 2);

                //draw table
                const realWidth = this.canvasWidth - (spaceLeft + spaceRight);
                const realHeight = this.canvasHeight - (spaceUp + spaceDown);
                const widthSpace = realWidth / (this.numberStrings - 1)
                const heightSpace = realHeight / this.numberCases;
                ctx.beginPath();

                for (let i = 0; i < this.numberStrings; i++) {
                    ctx.moveTo(i * widthSpace + spaceLeft, spaceUp);
                    ctx.lineTo(i * widthSpace + spaceLeft, this.canvasHeight - spaceDown);
                    ctx.stroke();
                }
                for (let i = 0; i < this.numberCases + 1; i++) {
                    ctx.moveTo(spaceLeft, spaceUp + i * heightSpace);
                    ctx.lineTo(this.canvasWidth - spaceRight, spaceUp + i * heightSpace);
                    ctx.stroke();
                }
                //draw case
                if (this.caseN > 1) {
                    // ctx.moveTo(spaceLeft, spaceUp + i * heightSpace);
                    ctx.fillText(this.caseN, spaceLeft / 2, spaceUp);

                }

                //draw points
                const cases = [];
                const radius = widthSpace / 2;
                const pi2 = Math.PI * 2;
                cases.push(this.case1, this.case2, this.case3, this.case4);
                cases.forEach((c, i) => {
                    if (c.indexOf("-") !== -1) {
                        const tuple = c.split("-")
                            .map(m => parseInt(m.trim()))
                            .filter(f => f > 0 && f <= this.numberStrings);
                        const [startN, endN] = [tuple[0], tuple[1]];
                        const [centerXN1, centerYN1] = [spaceLeft + (startN - 1) * widthSpace, spaceUp * 1.5 + i * heightSpace];
                        const centerXN2 = spaceLeft + (endN - 1) * widthSpace;

                        ctx.moveTo(centerXN1, centerYN1);
                        ctx.fillRect(Math.min(centerXN1, centerXN2), centerYN1 - widthSpace / 4, Math.abs(centerXN2 - centerXN1), widthSpace);
                        ctx.moveTo(centerXN1, centerYN1 + widthSpace / 4);
                        ctx.arc(centerXN1, centerYN1 + widthSpace / 4, radius, 0, pi2, false);
                        ctx.moveTo(centerXN2, centerYN1 + widthSpace / 4);
                        ctx.arc(centerXN2, centerYN1 + widthSpace / 4, radius, 0, pi2, false);
                        ctx.fill();
                    } else {
                        const numbers = c.split(",")
                            .map(m => parseInt(m.trim()))
                            .filter(f => f > 0 && f <= this.numberStrings);
                        numbers.forEach(n => {
                            const [centerX, centerY] = [spaceLeft + (n - 1) * widthSpace, spaceUp * 1.5 + i * heightSpace + widthSpace / 3];
                            ctx.moveTo(centerX, centerY);
                            ctx.arc(centerX, centerY, radius, 0, pi2, false);
                            ctx.fill();
                        });
                    }
                });
            },
            updateImg: function () {
                const self = this;
                $("#tabCanvas" + this.uid).each(function (i, e) {
                    const img = e.toDataURL("image/png");
                    $("#replace" + self.uid).replaceWith($('<img src="' + img + '"/>').attr({
                        id: "replace" + self.uid,
                        width: 100,
                        height: 150,
                        style: $(e).attr("style")
                    }));
                });
            },
            save: function () {
                if (this.title !== "") {
                    firebase.firestore()
                        .collection("tabs")
                        .doc(this.instrument + this.title)
                        .set({
                            instrument: this.instrument,
                            title: this.title,
                            case1: this.case1,
                            case2: this.case2,
                            case3: this.case3,
                            case4: this.case4,
                            caseN: this.caseN
                        });
                }
            },
            del: function () {
                firebase.firestore()
                    .collection("tabs")
                    .doc(this.instrument + this.title)
                    .delete();
            }
        },
        mounted() {
            this.draw();
            if (this.image) {
                this.updateImg();
            }
        }
    }
</script>

<style scoped>

</style>

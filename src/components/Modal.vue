<template>
  <div>
    <div class="modal fade" :id="modalId" tabindex="-1" role="dialog" :aria-labelledby="labelId"
         aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="labelId">{{title}}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <button data-dismiss="modal" v-if="noMsg !== ''" type="button" class="btn btn-secondary">{{noMsg}}</button>
            <button v-if="yesMsg !== ''" type="button" :class="'btn-' + yesClass" class="btn btn-primary" data-dismiss="modal"
                    @click="onYes(context)">
              {{yesMsg}}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  
  import "bootstrap";
    export default {
        name: 'Modal',
        props: {
            noMsg: String,
            yesMsg: String,
            modalId: String,
            onYes: Function,
            title: String,
            context: Object,
            yesClass: String
        },
        computed: {
            labelId: function () {
                return "label" + this.modalId;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

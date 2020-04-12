<template>
  <!--  <div>-->
  <!--    <input v-model="email" type="text" placeholder="Email">-->
  <!--    <input v-model="password" type="password" placeholder="Password">-->
  <!--    <button @click="logFirebase">Connection</button>-->
  <!--  </div>-->
  
  <div class="container">
    <div class="row justify-content-center align-items-center" >
      <div class="col-4">
        <div class="card">
          <div class="card-body">
              <div class="form-group">
                <input placeholder="Email" v-model="email" type="text" class="form-control">
              </div>
              <div class="form-group">
                <input placeholder="Password" v-model="password" type="password" class="form-control">
              </div>
              <button @click="logFirebase" class="btn btn-primary" >Login</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    import firebase from "firebase"

    export default {
        name: "Login",
        data: function () {
            return {
                email: '',
                password: ''
            }
        },
        methods: {
            logFirebase: function () {
                const self = this;
                firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                    .then(function () {
                        self.$router.replace("home");
                    })
            }
        }
    }
</script>

<style scoped>
  .row {
    height:100vh
  }
</style>

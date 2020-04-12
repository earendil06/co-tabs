<template>
  <pre>
    {{lyrics}}
  </pre>
</template>

<script>
    export default {
        name: "LyricsViewer",
        props: {
            lyrics: String
        }
    }
</script>

<style scoped>

</style>

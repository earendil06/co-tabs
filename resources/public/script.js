// const url = 'https://cotabs.florentpastor.com';
const url = 'http://localhost:3000';

const app = new Vue({
    el: '#app',
    data: {
        tabs: "",
        title: "",
        result: "",
        notes: [],
        mouseOver:""
    },
    computed: {
        model: function () {
            const lines = this.tabs.split("\n");
            const array = lines.map(e => {
                const elements = e.split(" ");
                const note = elements[0];
                const arrows = elements[1];
                const rep = parseInt(elements[2]);
                return {note: note, arrows: arrows, repeat: rep};
            });
            return {title: this.title, tabs: array};
        },
        noteViewer: function () {
            return "images/" + this.mouseOver + ".png"
        }
    },
    watch: {
        model: function (value, old) {
            console.log(value);
            axios.post(url + '/markdown', {
                // axios.post('http://localhost:3000/markdown', {
                body: value
            }).then(response => {
                const converter = new showdown.Converter();
                converter.setOption('tables', 'true');
                const text = response.data;
                this.result = converter.makeHtml(text);
            }).catch(e => {
                console.log(e)
            });
        }
    },
    methods: {
        test: function (event) {
            this.mouseOver = event.target.innerText;
            if (event) {
                event.preventDefault()
            }
        }
    },
    mounted () {
        axios
            .get(url + "/notes")
            .then(response => (this.notes = response.data))
    }
});

function generatePDF() {
    const element = document.getElementById("result");
    html2pdf()
        .from(element)
        .save();
}

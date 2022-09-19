/* global Vue axios */ //> from vue.html
const $ = sel => document.querySelector(sel)
const GET = (url) => axios.get('/browse'+url)

const tasks = Vue.createApp ({

    data() {
      return {
        list: [],
        task: undefined
      }
    },

    methods: {

        async fetch (etc='') {
            const {data} = await GET(`/ListOfTasks`)
            tasks.list = data.value
        },

        async inspect (eve) {
            const task = tasks.task = tasks.list [eve.currentTarget.rowIndex-1]
            const res = await GET(`/Tasks/${task.ID}`)
            Object.assign (task, res.data)
        },
    }
}).mount('#app')

tasks.fetch() // initially fill list of tasks

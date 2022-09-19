/* global Vue axios */ //> from vue.html
const $ = sel => document.querySelector(sel)
const GET = (url) => axios.get('/browse'+url)
const POST = (cmd,data) => axios.post('/browse'+cmd,data)

const tasks = Vue.createApp ({

    data() {
      return {
        status: {
            state: "",
            text: ""
        },
        list: [],
        task: undefined,
        newTask: {
            title: "",
            description: "",
            duedate: null
        }
      }
    },

    methods: {

        async fetch () {
            const {data} = await GET(`/ListOfTasks`)
            tasks.list = data.value
        },

        async inspect (eve) {
            const task = tasks.task = tasks.list [eve.currentTarget.rowIndex-1];
            const res = await GET(`/Tasks/${task.ID}`);
            Object.assign (task, res.data);

            tasks.status.state = "";
            tasks.status.text = "";
        },

        async createNewTask () {
            const taskIDs = tasks.list.map( x => x.ID );
            const highestID = Math.max(...taskIDs);
            const newID = (highestID + 1).toString();
            const newObject = {
                title: tasks.newTask.title,
                description: tasks.newTask.description,
                duedate: tasks.newTask.duedate
            };

            try {
                const res = await POST(`/Tasks`, newObject);
                if(res && !res.error) {
                    tasks.status.state = "Success";
                    tasks.status.text = "New task added successfully";

                    tasks.fetch();
                    tasks.newTask = {
                        title: "",
                        description: "",
                        duedate: null
                    };
                } else {
                    tasks.status.state = "Error";
                    tasks.status.text = res && res.error ? res.error.message : "Unknown error";
                }
            } catch (e) {
                tasks.status.state = "Error";
                tasks.status.text = e.response.data.error ? e.response.data.error.message : e.response.data;
            }
        },
    }
}).mount('#app')

tasks.fetch() // initially fill list of tasks

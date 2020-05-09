import React, { Component } from 'react'

class Task extends Component {

    constructor(props) {
        super(props)
    
        this.state = {

            todoList:[],

            activeItem:{
                id: null,
                title: '',
                completed: false,
            },

            editing: false,
        }

        this.fetchTasks = this.fetchTasks.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getCookie = this.getCookie.bind(this)
        this.startEdit = this.startEdit.bind(this)
        this.deleteItem = this.deleteItem.bind(this)
        this.completeUncomplete = this.completeUncomplete.bind(this)

    }

    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    componentDidMount() {
        this.fetchTasks() 
    }

    fetchTasks() {
        fetch('http://127.0.0.1:8000/api/task-list/')
        .then(response => response.json())
        .then(data => 
            this.setState({
                todoList: data
            })
            )
    }

    handleChange(e){
        // let name = e.target.name
        let value = e.target.value

        this.setState({
            activeItem:{
                ...this.state.activeItem,
                title: value
            }
        })
    }

    handleSubmit(e){
        e.preventDefault()
        console.log('Item:', this.state.activeItem)

        //add the new task to the django
        let csrftoken = this.getCookie('csrftoken')
        let url = 'http://127.0.0.1:8000/api/task-create/'
        let method = 'POST'

        if(this.state.editing === true){
            url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
            method = 'PUT'
            this.setState({
                editing: false
            })
        }

        fetch(url, {
            method:method,
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(this.state.activeItem)
        }).then((response) => {
            this.fetchTasks()
            this.setState({
                activeItem:{
                    id: null,
                    title: '',
                    completed: false,
                }
            })
        }).catch(function(error){
            console.log('ERROR:', error)
        })
    }

    startEdit(task){
        this.setState({
            activeItem: task,
            editing: true,
        })
    }

    deleteItem(task){
        //add the new task to the django
        let csrftoken = this.getCookie('csrftoken')
        let url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`
        let method = 'DELETE'

        fetch(url, {
            method:method,
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrftoken,
            }
        }).then((response) => {
            this.fetchTasks()
        })

    }


    completeUncomplete(task){
        task.completed = !task.completed
        //add the new task to the django
        let csrftoken = this.getCookie('csrftoken')
        let url = `http://127.0.0.1:8000/api/task-update/${task.id}/`
        let method = 'PUT'

        fetch(url, {
            method: method,
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({'completed': task.completed, 'title': task.title})
        }).then(() => {
            this.fetchTasks() 
        })

    }
    
    render() {

        let tasks = this.state.todoList
        let self = this

        return (
            <React.Fragment>
                <div>
                    <h1 className="text-center">TOdo APp</h1>
                </div>
                <div id="task-container">

                    <div id="form-wrapper">
                    <form onSubmit={this.handleSubmit} id="form">
                        <div className="flex-wrapper">
                        <div style={{flex: 6}}>
                            <input onChange={this.handleChange} value={this.state.activeItem.title} className="form-control" id="title" type="text" name="title" placeholder="Add task..." />
                        </div>
                        <div style={{flex: 1}}>
                            <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                        </div>
                        </div>
                    </form>
                    </div>

                    <div id="list-wrapper">
                        {tasks.reverse().map(function(task, index){
                            return(
                                <div key={index} className="task-wrapper flex-wrapper">

                                    <div onClick={() => self.completeUncomplete(task)} style={{flex: 7}}>
                                        { task.completed ? <strike className="text-danger">{task.title}</strike> : <span>{task.title}</span> }
                                    </div>

                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                                    </div>

                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark px-3">-</button>
                                    </div>

                                </div>
                            )
                        })}
                    </div>

                </div>
            </React.Fragment>
        )
    }
}

export default Task

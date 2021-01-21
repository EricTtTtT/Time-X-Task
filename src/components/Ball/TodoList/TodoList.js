import { useState } from "react";
import { useMutation } from '@apollo/react-hooks'
import Item from "./TodoItem"
import Button from "./TodoButton"
import "../style/TodoList.css"
import {
    CREATE_ASSIGNMENT_MUTATION,
    UPDATE_ASSIGNMENT_MUTATION,
    DELETE_ASSIGNMENT_MUTATION
} from "../../../graphql"
import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css';

/*
"assignments": [
    {
        "id": "6006c1fc74a4fd4df4c3a7f4",
        "assignmentName": "Final Project",
        "deadline": {
            "day": 9,
            "month": 10,
            "year": 1992,
            "hour": 0,
            "minute": 0,
            "second": 0,
            "formatted": "1992-10-09T00:00:00Z"
        },
        "record": [],
        "status": null,
        "isComplete": null
    }
]
*/

const TodoList = ({ userID, projectID, assignments, timingFunc }) => {
    const [pages, setPages] = useState([
        {show: true, buttonName: "Active1"},
        {show: false, buttonName: "Active2"},
        {show: false, buttonName: "All"},
        {show: false, buttonName: "Completed"},
    ]);
    const [date, setDate] = useState(undefined);
    const [createAssignment] = useMutation(CREATE_ASSIGNMENT_MUTATION)
    const [updateAssignment] = useMutation(UPDATE_ASSIGNMENT_MUTATION)
    const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT_MUTATION)
    
    const date2Human = (date) => {
        if (date === undefined)
            return "";
        return date.toLocaleDateString();
    }

    const deleteItem = (id) => {
        return async (event) => {
            const reply = await deleteAssignment({
                variables: {
                    userID: userID,
                    assignmentID: id
                }
            })
            console.log(reply);
        }
    }

    // const addItem = (event) => {
    //     if(event.keyCode === 13 && event.target.value !== '') {
    //         const todo = event.target.value;
    //         let time = event.target.parentNode.childNodes[1].childNodes[1].value;
    //         let deadline;
    //         if (date !== undefined && time !== "") {
    //             const ISO = date.toISOString();
    //             deadline = ISO.substring(0, 11) + time + ISO.substring(16)
    //         } else {
    //             deadline = undefined;
    //         }

    //         console.log(todo);
    //         console.log(deadline);

    //         createAssignment({
    //             variables: {
    //                 userID: userID,
    //                 data: {
    //                     projectID: projectID,
    //                     assignmentName: todo,
    //                     deadline: deadline
    //                 }
    //             }
    //         })

    //         event.target.value = "";
    //         event.target.parentNode.childNodes[1].childNodes[1].value = "";
    //         setDate(undefined);
    //     }
    // }

    const addItem__button = (event) => {
        const box = event.target.parentNode.parentNode;
        if (box.childNodes[0].value !== '') {
            const todo = box.childNodes[0].value;
            let time = box.childNodes[1].childNodes[1].value;
            let deadline;
            if (date !== undefined && time !== "") {
                const date_obj = new Date(date);
                deadline = (new Date(
                    date_obj.getFullYear(),
                    date_obj.getMonth(),
                    date_obj.getDate(),
                    parseInt(time.substring(0, 3)),
                    parseInt(time.substring(3))
                )).toISOString();
                console.log(deadline);
            } else {
                deadline = undefined;
            }

            // console.log(todo);
            // console.log(deadline);

            createAssignment({
                variables: {
                    userID: userID,
                    data: {
                        projectID: projectID,
                        assignmentName: todo,
                        deadline: deadline
                    }
                }
            })

            box.childNodes[0].value = "";
            box.childNodes[1].childNodes[1].value = "";
            setDate(undefined);
        }
    }

    const completeItem = (id, isComplete) => {
        return async (event) => {
            await updateAssignment({
                variables: {
                    userID: userID,
                    assignmentID: id,
                    data: { isComplete: !isComplete }
                }
            })
        }
    }

    const filterRule = () => {
        const rules = {
            "Active1": e => (!e.isComplete && e.deadline !== null),
            "Active2": e => (!e.isComplete && e.deadline === null),
            "All": e => (true),
            "Completed": e => (e.isComplete),
        }
        for (let page of pages) {
            if (page.show)
                return rules[page.buttonName];
        }
        return e => (true);
    }

    const changePage = (buttonNmae) => {
        return (event) => {
            let triggerIdx = pages.findIndex(e => (e.buttonName === buttonNmae));
            let newPages = JSON.parse(JSON.stringify(pages));
            for(let i=0; i<3; ++i) newPages[i].show = false;
            newPages[triggerIdx].show = true;
            setPages(newPages);
        }
    }

    const deleteCompleted = async (event) => {
        for (let a of assignments) {
            if (a.isComplete)
                await deleteItem(a.id); 
        }
    }

    const resetTime = (event) => {
        const formChildNodes = event.target.parentNode.childNodes;
        setDate(undefined);
        formChildNodes[1].value = "";
    }

    return (
        <div className="todolist__main">
            <div className="todo-app_box">
                <section className="todo-app__main">
                    <div className="todo-app__input__box">
                        <input className="todo-app__input" id="todo-input-assignment"
                        // onKeyUp={addItem} 
                        placeholder="What needs to be done?"></input>
                        <form className="todo-app__form">
                            <input className="todo-app__input" id="todo-input-deadline" readOnly={true}
                            placeholder="(no deadline)" value={date===""? null : date2Human(date)}></input>
                            <input className="todo-app__input" id="todo-input-clocktime" type="time"></input>
                            <input type="button" value="Enter" onClick={addItem__button} ></input>
                            <input type="reset" value="Reset" onClick={resetTime} ></input>
                        </form>
                    </div>
                    <ul className="todo-app__list" id="todo-list">
                        {
                            assignments.filter(filterRule()).map(e => (
                                <div onClick={timingFunc(e.id)}>
                                    <Item
                                        assignment={e}
                                        deleteItem={deleteItem}
                                        completeItem={completeItem}
                                    />
                                </div>
                            )) 
                        }
                    </ul>
                </section>
                    <footer className="todo-app__footer" id="todo-footer">
                        <div className="todo-app__total" id="todo-total">{assignments.length} left</div>
                        <ul className="todo-app__view-buttons" id="todo-view">
                            { pages.map(e => <Button buttonName={e.buttonName} show={e.show} changePage={changePage} />) }
                        </ul>
                        <div className="todo-app__clean" id="clear_completed_button">
                            <button onClick={deleteCompleted}>Clear completed</button>
                        </div>
                    </footer>
            </div>
            <div className="calendar__box">
                <Calendar
                    onChange={setDate}
                    value={date}
                />
            </div>
        </div>
    );
}

export default TodoList;
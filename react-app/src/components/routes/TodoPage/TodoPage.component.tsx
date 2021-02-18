import React, { useState } from 'react';
import { useQuery, useMutation } from "react-apollo";

import { GET_TODOS, ADD_TODO } from "@state/byModel/Todos/todos.queries";
import Counter from '@components/Shared/Counter/Counter';

export default function TodoPage() {

    const [task, setTask] = useState("");
    const { loading, error, data } = useQuery(GET_TODOS);
    const [addTodo] = useMutation(ADD_TODO);

    return (
        <>
            <p>Page2</p>
            <Counter />

            <pre>{JSON.stringify(data, null, 2)}</pre>


            <h1>TODOS:</h1>
            {data.todos.map((todo: any, i: number) => (
                <li key={i}> {todo.name} </li>
            ))}
            <input
                placeholder="add a Todo"
                onChange={e => setTask(e.target.value)}
                value={task}
            />
            <button
                onClick={() => {
                    console.log('wtf', task);
                    addTodo({
                        variables: {
                            name: task
                        }
                    });
                    // setTask("");
                }}
            >
                Add
            </button>



        </>
    );
}

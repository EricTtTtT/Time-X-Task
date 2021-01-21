import React, { useEffect, useCallback, useRef, useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useQuery } from '@apollo/react-hooks'
import './App.css'
// import 'antd/dist/antd.css'; 
// import { Button, Input, Tag } from 'antd'
import BallPool from "../BallPool"
import Search from "../Search"
import GlobalBall from "../../components/Ball/GlobalBall"
import SignInSide from "../../components/SignIn/SignInSide"
// import { Bounce, Shake } from 'react-motions'
// import { Dimensions, TouchableHighlight, Text } from 'react-native';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import {
  USER_QUERY,
  USER_SUBSCRIPTION,
  CREATE_USER_MUTATION,
  DELETE_ASSIGNMENT_MUTATION
} from '../../graphql'

function App() {
  // var variables = { userName: "A" }
  const [user, setUser] = useState("");
  const [changepage, setChangepage] = useState(true);
  const [logging, setLogging] = useState(true);
  const [register, setRegister] = useState(false);

  const { loading, error, data, subscribeToMore } = useQuery(USER_QUERY, {
    variables: { userName: user }
  });
  const [createUser] = useMutation(CREATE_USER_MUTATION);

  // const checkLogging = (event) => {
  //   const name = event.target.parentNode.childNodes[1].value;
  //   setUser(name);
  //   event.target.parentNode.childNodes[1].value = "";
  // }

  const checkLogging = ({event, newValue}) => {
    if (user && data.user) {
      setLogging(false);
    } else if (!user) {
      alert("請填寫你的名字")
    } else {
      alert("請先註冊")
      setRegister(true);
      setLogging(false);
    }
    console.log(data.user)
    // event.target.parentNode.childNodes[1].value = "";
  }

  const checkRegister = ({event, newValue}) => {
    if (user && data.user) {
      setRegister(false);
    } else if (!user) {
      alert("請填寫你的名字")
    } else {

      createUser({
        variables: {
            data: {
                userName: user,
            }
        }
    })

      // setRegister(false);
      // setLogging(false);
      console.log(user)
      console.log(data)
      console.log(data.user)

    }
    console.log(data.user)
    // event.target.parentNode.childNodes[1].value = "";
  }

  useEffect(() => {
    subscribeToMore({
      document: USER_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newUser = subscriptionData.data.user.data
        // console.log(newUser);
        return {newUser}
      }
    })
  }, [subscribeToMore])

  const tmp = () => {
    console.log(data.user);
    setChangepage(!changepage);
  }

  // const handleSubmit = event => { 
  //   event.preventDefault();
  //   if (user === "") {
  //     setLogging(false);
  //   } else {
  //     setLogging(true);
  //   }
  //   console.log(user);
  //   console.log(logging);
  // };

  return (
    <>
    {
      (register) ? (
        <div className="App">
          <div className="Register">
            <Typography component="h1" variant="h5">
              Register
            </Typography>
            {/* <Tag for="logging">User Name:</Tag> */}
            <TextField
              type="text"
              id="register"
              name="register"
              label="Your Name"
              value={user}
              onChange={(event) => {
                setUser(event.target.value); 
                setLogging(false)
              }} 
              variant="outlined"
              margin="normal"
              fullWidth
              autoFocus
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              onClick={checkRegister}
            >
              Register
            </Button>
          </div>
        </div>
      ): (user === "" || data.user === null || logging)? (
        <div className="App">
          <div className="Logging">
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            {/* <Tag for="logging">User Name:</Tag> */}
            <TextField
              type="text"
              id="logging"
              name="logging"
              label="Your Name"
              value={user}
              onChange={(event) => {
                setUser(event.target.value); 
                setLogging(true)
              }} 
              variant="outlined"
              margin="normal"
              fullWidth
              autoFocus
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              onClick={checkLogging}
            >
              Sign In
            </Button>
          </div>
        </div>
      ) : (
        <div className="App">
          <Button onClick={tmp} >Switch</Button>
          <div>
            {loading ? (<div>Loading...</div>) : changepage ? ( 
              <div>
                <Search />
              </div>
            ) : (
              <div>
                <BallPool user={data.user} />
                {/* <GlobalBall user={data.user} /> */}
              </div>
            )}
          </div>
        </div>
      )
    }

    </>
  )
}

export default App



import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { exams, developers, companies } from '@libs/client';
import { useRouter } from 'next/router';
import { parseCookies } from '@libs/client/cookies';
import {
  makeStyles,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  AppBar,
  Box,
  Typography,
  Tab,
  Tabs
} from '@material-ui/core';
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import BackupIcon from '@material-ui/icons/Backup';
import TimerIcon from '@material-ui/icons/Timer';
import HTMLReactParser from 'html-react-parser';
import { formatTimeOut, sendThanks } from '@client/business';
// import { node } from 'prop-types';


const TestProblemCoding = dynamic(() => import('../../../components/Examinations/TestProblemCoding'), {
  ssr: false,
});

const TestProblemMCQ = dynamic(() => import('../../../components/Examinations/TestProblemMCQ'), {
  ssr: false,
});


function TabPanel(props) {
  const { children, value, index } = props; // , ...other

  return (
    <>
      {value === index && (
        children
      )}
    </>
  );
}

// TabPanel.propTypes = {
//   children: PropTypes.node,
//   index: PropTypes.any.isRequired,
//   value: PropTypes.any.isRequired,
// };

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    backgroundColor: 'lightgray',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tab: {
    minWidth: 80,
    width: 80,
    minHeight: 60,
    height: 60,
  },
  title: {
    flexGrow: 1,
  },
  minutes: {
    marginRight: 25,
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: 'green',
    cursor: 'pointer',
  },
  submit: {
    display: 'block',
    float: 'right',
    marginTop: 20,
    marginRight: 80,
  },
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.5em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  }
}));


export default function Start({ user, examId, exam }) {
  const classes = useStyles();
  const router = useRouter();

  const [value, setValue] = React.useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isSolvedProblems, setIsSolvedProblems] = useState(new Array(exam.problems.length).fill(false));
  const [timeOut, setTimeOut] = useState(exam.duration);
  const [isSubmited, setIsSubmitted] = useState(false);


  const MySwal = withReactContent(Swal);

  const handleSubmit = () => {
    MySwal.fire({
      title: 'Are you sure?',
      icon: 'question',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      showConfirmButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        // router.push(`/examination/end/${examId}`);
        submit();
      }
    });
  }

  const submit = async () => {
    // Stop saving timeout to localStorage
    setIsSubmitted(true);
    // localStorage.removeItem(`${user.id}${examId}Timeout`);

    MySwal.fire({
      title: 'Please Wait !',
      html: 'Submitting...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      onBeforeOpen: () => {
        MySwal.showLoading();
      }
    });

    const results = [];
    let correct = 0;
    let score = 0;
    // Important! save results into firebase database
    for (let i = 0; i < isSolvedProblems.length; i += 1) {
      if (isSolvedProblems[i] === false) {
        results.push(null);
      } else {
        // get from LocalStorage
        const resultJson = localStorage.getItem(`${user.id}${examId}${i}`);

        if (resultJson !== null) {
          const resultObject = JSON.parse(resultJson);

          if (resultObject.isMCQ === true) {
            results.push({
              isMCQ: true,
              status: exam.problems[i].correctIndices === resultObject.selectedAnswer,
              details: {
                selectedAnswer: resultObject.selectedAnswer,
                correctAnswer: exam.problems[i].correctIndices
              }
            });

            // Check status
            if (exam.problems[i].correctIndices === resultObject.selectedAnswer) {
              correct += 1;
              score += exam.problems[i].score;
            }
          } else {
            results.push(resultObject);

            // Check status
            if (resultObject.status === "Accepted") {
              correct += 1;
              score += exam.problems[i].score;
            }
          }

          // remove item from localstorage
          localStorage.removeItem(`${user.id}${examId}${i}`);
        }

        // remove temporary item from localstorage
        localStorage.removeItem(`${user.id}${examId}${i}Temporary`);
      }
    }

    // Remove isSolvedProblems from local storage
    localStorage.removeItem(`${user.id}${examId}isSolvedProblems`);
    await developers.createExamSubmission(user, {
      examId,
      total: exam.problems.length,
      correct,
      results,
      score,
      time: (exam.duration - timeOut < 0) ? 0 : exam.duration - timeOut
    });

    // Send thanks
    const comp = await companies.get(exam.companyId);
    await sendThanks(user.name, comp.name, exam.title, user.email, comp.email);

    MySwal.close();

    MySwal.fire({
      title: 'Finished!',
      icon: 'success',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showConfirmButton: true
    }).then((result) => {
      if (result.isConfirmed) {

        router.push(`/examination/end/${examId}`);
      }
    });
  }

  const handleIsSolvedProblemsChange = (index) => {
    const isSolvedProblemsDump = isSolvedProblems;
    isSolvedProblemsDump[index] = true;
    setIsSolvedProblems(isSolvedProblemsDump);

    // Save isSolvedProblems to LocalStorage
    localStorage.setItem(`${user.id}${examId}isSolvedProblems`, JSON.stringify(isSolvedProblemsDump));
  }


  let time;
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);

    if(timeOut !== exam.duration){
      time = setTimeout(async () => {
        if(isSubmited === false){
          if(timeOut === 0) {
            await submit();
          }
          else{
            // Save timeout into local storage
            // const timeOutLocalStorage = {
            //   timeOut,
            //   date: Date.now(),
            // };
            // localStorage.setItem(`${user.id}${examId}Timeout`, JSON.stringify(timeOutLocalStorage));
            setTimeOut(timeOut - 1);
          }
        }
        else{
          // localStorage.removeItem(`${user.id}${examId}Timeout`);
          // Stop time of setTimeout and remove timeout from local storage
          clearTimeout(time);
        }
      }, 1000);
    }
  }, [timeOut]);

  useEffect(() => {
    // Get isSolvedProblems from local storage
    const isSolvedProblemsJson = localStorage.getItem(`${user.id}${examId}isSolvedProblems`);
    if(isSolvedProblemsJson !== null){
      const isSolvedProblemsObject = JSON.parse(isSolvedProblemsJson);
      setIsSolvedProblems(isSolvedProblemsObject);
    }

    async function observerExam() {
      const result = await developers.getExamObserverByDeveloperIdAndExamId(user.id, examId);

      if(result === null){
        await developers.createExamObserver({developerId: user.id, examId, duration: exam.duration});
        setTimeOut(timeOut - 1);
      }
      else{
        clearTimeout(time);
        const timeOutTemp = Math.ceil(result.observer.endAt - result.now) < 0 ? 0 : (Math.ceil(result.observer.endAt - result.now) - 1);
        setTimeOut(timeOutTemp);
      }
    }

    observerExam();

    // Get timeout from local storage
    // const timeOutLocalStorage = localStorage.getItem(`${user.id}${examId}Timeout`);
    // if(timeOutLocalStorage !== null){
    //   clearTimeout(time);
    // const timeOutObject = JSON.parse(timeOutLocalStorage);
    // const timeOutTemp = (timeOutObject.timeOut - Math.ceil((Date.now() - timeOutObject.date) / 1000)) < 0 ? 0 : (timeOutObject.timeOut - Math.ceil((Date.now() - timeOutObject.date) / 1000));
    // setTimeOut(timeOutTemp);
    // }


  }, []);


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleQuestionChange = (newValue) => {
    setValue(newValue);
  }

  const handleNextQuestion = () => {
    if(value === exam.problems.length){
      setValue(0);
    }
    else{
      setValue(value + 1);
    }
  }


  //     setResults(resultsTemp);
  //     // setResults(prevState => [...prevState, result]);
  //     setNumberOfCorrect(numberOfCorrect + parseInt(correct, 10));


  return (
    <>
      <Head>
        <title>Examination | Smart Coder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AppBar position="static" style={{height: 60}}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            {exam.title}
          </Typography>

          <Box className={classes.minutes}>
            <TimerIcon />
              <Typography variant="h6">
                {formatTimeOut(timeOut)}
              </Typography>
          </Box>

          <Button onClick={() => handleSubmit()} color="inherit" size="large" startIcon={<BackupIcon />}>Submit</Button>
        </Toolbar>
      </AppBar>

      <div className={classes.root} style={{height: windowHeight - 60}}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          className={classes.tabs}
          textColor="primary"
          indicatorColor="primary"
        >
          {
            value === 0 &&
            <Tab style={{backgroundColor: 'white', fontWeight: 'bolder'}} label="All" className={classes.tab} {...a11yProps(0)} />
          }
          {
            value !== 0 &&
            <Tab label="All" className={classes.tab} {...a11yProps(0)} />
          }
          {
            exam.problems.map((problem, index) => {
              if((index + 1) === value){
                return (
                  <Tab style={{backgroundColor: 'white', fontWeight: 'bolder'}} label={index + 1} className={classes.tab} {...a11yProps(index + 1)} />
                )
              }

                return (
                  <Tab label={index + 1} className={classes.tab} {...a11yProps(index + 1)} />
                )

            })
          }
        </Tabs>
        <TabPanel value={value} index={0}>
          <Paper style={{paddingLeft: 50, paddingTop: 20, paddingBottom: 20, paddingRight: 50, maxHeight: windowHeight - 60, height: windowHeight - 60,  minWidth: windowWidth - 80, width: windowWidth - 80, overflow: 'auto'}}>
            <Table size="medium" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="h6" style={{color: 'gray'}}>
                      #
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" style={{color: 'gray'}}>
                      Questions
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" style={{color: 'gray'}}>
                      Type
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" style={{color: 'gray'}}>
                      Action
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              {
                exam.problems &&
                <TableBody>
                  {
                    exam.problems.map((problem, index) => (
                      <TableRow
                        key={problem.id}
                        hover
                        style={
                          index % 2
                            ? { background: 'rgb(250, 250, 250)' }
                            : { background: 'white' }
                        }
                      >
                        {
                          (problem.isMCQ === undefined || problem.isMCQ === false) &&
                            <>
                              <TableCell>
                                  {index + 1}
                              </TableCell>
                              <TableCell>
                                <Typography variant="h6">
                                  {problem.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                Coding
                              </TableCell>
                            </>
                        }
                        {
                          problem.isMCQ === true &&
                          <>
                            <TableCell>
                                {index + 1}
                            </TableCell>
                            <TableCell>
                              <Typography variant="h6">
                                {HTMLReactParser(problem.title)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              Multiple Choice
                            </TableCell>
                          </>
                        }
                        <TableCell>
                          {
                            isSolvedProblems[index] === false &&
                            <Button onClick={() => handleQuestionChange(index + 1)} size="large" variant="contained" color="primary">Solve</Button>
                          }
                          {
                            isSolvedProblems[index] === true &&
                            <Button onClick={() => handleQuestionChange(index + 1)} size="large" variant="outlined" color="primary">Modify</Button>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              }
            </Table>
            <Button onClick={() => handleSubmit()} size="large" variant="outlined" color="primary" className={classes.submit}>Submit</Button>
          </Paper>
        </TabPanel>
        {
          exam.problems.map((problem, index) => {
            if(problem.isMCQ === undefined ||problem.isMCQ === false){
              return (
                <TabPanel value={value} index={index + 1}>
                  <Paper style={{paddingLeft: 50, paddingTop: 20, paddingBottom: 20, paddingRight: 50, maxHeight: windowHeight - 60, height: windowHeight - 60,  minWidth: windowWidth - 80, width: windowWidth - 80, overflow: 'auto'}}>
                    <TestProblemCoding examId={examId} index={index.toString()} problem={problem} user={user} onIsSolvedProblemsChange={handleIsSolvedProblemsChange} onNextQuestion={handleNextQuestion} />
                  </Paper>
                </TabPanel>
              )
            }
              return (
                <TabPanel value={value} index={index + 1}>
                  <Paper style={{paddingLeft: 50, paddingTop: 20, paddingBottom: 20, paddingRight: 50, maxHeight: windowHeight - 60, height: windowHeight - 60,  minWidth: windowWidth - 80, width: windowWidth - 80, overflow: 'auto'}}>
                    <TestProblemMCQ examId={examId} index={index.toString()} problem={problem} user={user} onIsSolvedProblemsChange={handleIsSolvedProblemsChange} onNextQuestion={handleNextQuestion} />
                  </Paper>
                </TabPanel>
              )

          })
        }
      </div>
    </>
  );
}

export async function getServerSideProps({ params, req }) {
  const cookies = parseCookies(req);
  let user = null;
  let isInvited = false;
  let isParticipated = false;


  const items = await exams.get({ examId: params.id });


  if(items.published === undefined ||  items.published === false){
    return {
      redirect: {
        permanent: false,
        destination: "/examination/reject/unpublished_forbidden"
      }
    }
  }

  if(items.startAt > Date.now()) {
    return {
      redirect: {
        permanent: false,
        destination: "/examination/reject/notstarted_forbidden"
      }
    }
  }

  if(items.endAt < Date.now()) {
    return {
      redirect: {
        permanent: false,
        destination: "/examination/reject/ended_forbidden"
      }
    }
  }
  try {
    if (Object.keys(cookies).length !== 0) {
      if (cookies.user) {
        user = JSON.parse(cookies.user);

        if(user) {
          user = await developers.get(user.uid);

          // Unaccessed forbidden page
          if (user === undefined) {
            return {
              redirect: {
                permanent: false,
                destination: "/unaccessed_forbidden"
              }
            }
          }

          if(items.isPrivate === true){

            const invitedDevelopers = await exams.getInvitedDevelopers(params.id);

            for(let i = 0; i < invitedDevelopers.length; i+=1){
              if(invitedDevelopers[i] === user.email){
                isInvited = true;
                break;
              }
            }

            if(isInvited === false){
              return {
                redirect: {
                  permanent: false,
                  destination: "/examination/reject/uninvited_forbidden"
                }
              }
            }
          }
        }
        else {
          return {
            redirect: {
              permanent: false,
              destination: "/login"
            }
          }
        }
      }
      else{
        return {
          redirect: {
            permanent: false,
            destination: "/login"
          }
        }
      }
    }
    else{
      return {
        redirect: {
          permanent: false,
          destination: "/login"
        }
      }
    }
  } catch (e) {
    console.log(e);
  }

  const joinedExams = await developers.getJoinedExams(user);
  for(let i = 0; i < joinedExams.length; i+=1){
    if(joinedExams[i].id === params.id){
      isParticipated = true;
    }
  }

  const isSubmitted = await developers.getExamResults(user.id, params.id);
  if(isParticipated === true && isSubmitted.length > 0){
    return {
      redirect: {
        permanent: false,
        destination: "/examination/reject/participated_forbidden"
      }
    }
  }

  if(isParticipated === false){
    // Join Exam
    await developers.joinExam(user.id, params.id);
  }


  return {
    props: {
      user,
      examId: params.id,
      exam: items,
    },
  };
}

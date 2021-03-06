import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  makeStyles,
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormHelperText, Link,
} from '@material-ui/core';

// import { route } from 'next/dist/next-server/server/router';
// import HTMLReactParser from 'html-react-parser';
// import { calculateTotalExamTime } from '@libs/client/business';
// import AppLayout from '../../components/Layout';
import { parseCookies } from '@client/cookies';
import { exams, developers, companies } from '@libs/client';
import { useRouter  } from 'next/router';
import { formatTimeOut } from '@client/business';
import dateFormat from 'dateformat';
import withReactContent from 'sweetalert2-react-content';
import Swal from "sweetalert2";
import LeaderBoard from '@components/Examinations/LeaderBoard';
import HTMLReactParser from 'html-react-parser';

const useStyles = makeStyles({
  welcome: {
    marginTop: 100,
  },
  leaderBoard: {
    marginTop: 30,
  },
  rules: {
    marginTop: 100,
  },
  infoKey: {
    color: 'gray',
  },
  infoValue: {
    color: 'darkgreen',
  },
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  },
});

export default function Introduction({examId, examination, isInvited, isParticipated, examSubmissions}) {  // user,
  const classes = useStyles();
  const router = useRouter();

  const [windowHeight, setWindowHeight] = useState(0);
  const [value, setValue] = useState(false);
  const [leaderBoard, setLeaderBoard] = useState(false);
  const [company, setCompany] = useState({id: "#", name: "#", avatar: "/coding.png"});


  const handleLeaderBoardChange = () => {
    setLeaderBoard(!leaderBoard);
  }
  const handleValueChange = () => {
    setValue(!value);
  }

  useEffect(async () => {
    setWindowHeight(window.innerHeight);

    const comp = await companies.get(examination.companyId);

    if(comp !== null){
      setCompany(comp);
    }

  }, []);

  const MySwal = withReactContent(Swal);

  const handleBegin = async () => {
    if(value === false) {
      return;
    }

    MySwal.fire({
      // title: <p>Confirm</p>,
      html: "<p>If you click OK button, you cannot take the contest again!</p>",
      icon: 'warning',
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'Ok'
    }).then( async (result) => {
      if(result.isConfirmed){
        // await developers.joinExam(user.id, examId);
        router.push(`/examination/start/${examId}`);
      }
    });
  }

  return (
    <>
      <Head>
        <title>Examination | Smart Coder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Grid container >
        <Grid item xs={12} md={5} >
          <Paper style={{paddingLeft: 50, paddingTop: 50, paddingRight: 50, maxHeight: windowHeight, height: windowHeight, overflow: 'auto'}}>
            <Typography variant="h4" style={{fontWeight: 'bolder'}}>Smart Coder</Typography>
            <br />
            <br />
            <Typography variant="h4" style={{fontWeight: 'bold'}}>{examination.title}</Typography>
            <br />
            <br />
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="inherit" className={classes.infoKey}>Competition Duration</Typography>
                <Typography variant="h6" className={classes.infoValue}>{formatTimeOut(examination.duration)}</Typography>
              </Grid>
              <Grid item xs={6} >
                <Typography variant="inherit" className={classes.infoKey}>No. of questions</Typography>
                <Typography variant="h6" className={classes.infoValue}>{`${examination.problems.length} questions`}</Typography>
              </Grid>
              <Grid item />
              <Grid item xs={6} >
                <Typography variant="inherit" className={classes.infoKey}>Starts at</Typography>
                <Typography variant="h6" className={classes.infoValue}>
                  {dateFormat(
                    (new Date(examination.startAt)).toDateString(),
                    'dd/mm/yyyy "-" HH:MM TT'
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6} >
                <Typography variant="inherit" className={classes.infoKey}>Ends at</Typography>
                <Typography variant="h6" className={classes.infoValue}>
                  {dateFormat(
                    (new Date(examination.endAt)).toDateString(),
                    'dd/mm/yyyy "-" HH:MM TT'
                  )}
                </Typography>
              </Grid>
            </Grid>
            <br />
            <br />
             <Box>
              <Typography variant="h6" style={{color: 'darkgray'}}>Sponsored By <Link style={{color: "inherit", fontWeight: "bolder"}} href={`/profile/co/${company.id}`} underline="none">{company.name}</Link></Typography>
               <br />
               <Box style={{textAlign: 'center'}}>
                 <img style={{height: "120px", width: "120px"}} src={company.avatar} alt="coding icon" />
               </Box>
             </Box>
          </Paper>
        </Grid>
        {
          leaderBoard === false &&
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" square  style={{backgroundColor: 'lightgray', paddingLeft: 80, paddingTop: 80, paddingRight: 80, maxHeight: windowHeight, height: windowHeight, overflow: 'auto'}}>
              <Box className={classes.welcome}>
                <Typography variant="h5" style={{fontWeight: 'bolder'}}>Welcome!</Typography>
                <br />
                <Typography variant="subtitle1">
                  {
                    HTMLReactParser(`${examination.content}`)
                  }
                </Typography>
              </Box>
              <br />
              <br />

              <Box>
                {
                  (isParticipated === false && examination.startAt <= Date.now() && examination.endAt >= Date.now()) &&
                  <>
                    <Box style={{color: 'gray'}}>
                      <FormControl required error component="fieldset">
                        <FormGroup aria-label="position" row>
                          <FormControlLabel
                            value="end"
                            control={<Checkbox onChange={() => handleValueChange()} checked={value} color="primary" />}
                            label="I will not consult/copy code from any source including a website, book, or friend/colleague to complete these tests, though may reference language documentation or use an IDE that has code completion features."
                            labelPlacement="end"
                          />
                        </FormGroup>
                        <FormHelperText>Please accept the declaration statement to start the test.</FormHelperText>
                      </FormControl>
                    </Box>
                    <br />
                    {/* href or onclick */}
                    <Button onClick={() => handleBegin()} style={{marginLeft: 10}} variant="contained" color="primary">Let's Begin!</Button>
                    {
                      isInvited === false &&
                      <Button onClick={() => handleLeaderBoardChange()} style={{marginLeft: 10}} variant="contained" color="default">Leader Board</Button>
                    }
                  </>
                }
                {
                  (isParticipated === true && examination.startAt <= Date.now() && examination.endAt >= Date.now()) &&
                  <>
                    <Typography variant="h5" style={{color: 'red', fontWeight: 'bolder'}}>You have already joined this contest!</Typography>
                    <br />
                    <Button style={{marginLeft: 10}} variant="contained" color="primary" disabled>Let's Begin!</Button>
                    {
                      isInvited === false &&
                      <Button onClick={() => handleLeaderBoardChange()} style={{marginLeft: 10}} variant="contained" color="default">Leader Board</Button>
                    }
                  </>
                }
                {
                  examination.startAt > Date.now() &&
                  <>
                    <Typography variant="h5" style={{color: 'red', fontWeight: 'bolder'}}>The contest has not yet started!</Typography>
                    <br />
                    <Button style={{marginLeft: 10}} variant="contained" color="primary" disabled>Let's Begin!</Button>
                    {
                      isInvited === false &&
                      <Button onClick={() => handleLeaderBoardChange()} style={{marginLeft: 10}} variant="contained" color="default">Leader Board</Button>
                    }
                  </>
                }
                {
                  examination.endAt < Date.now() &&
                  <>
                    <Typography variant="h5" style={{color: 'red', fontWeight: 'bolder'}}>The contest ended!</Typography>
                    <br />
                    <Button style={{marginLeft: 10}} variant="contained" color="primary" disabled>Let's Begin!</Button>
                    {
                      isInvited === false &&
                      <Button onClick={() => handleLeaderBoardChange()} style={{marginLeft: 10}} variant="contained" color="default">Leader Board</Button>
                    }
                  </>
                }
              </Box>

              <Box className={classes.rules}>
                <Typography variant="h5" style={{fontWeight: 'bolder'}}>The Rules</Typography>
                <br />
                <Typography variant="subtitle1">
                  1. This contest is for individuals; teams are not allowed.
                </Typography>
                <br />
                <Typography variant="subtitle1">
                  2. Any competitor found cheating will be disqualified and banned from future coding contests.
                </Typography>
                <br />
                <Typography variant="subtitle1">
                  3. By participating and selecting "I'm interested in new job opportunities", you are indicating that you are willing to be considered for employment by companies using HackerRank for recruitment purposes.
                </Typography>
                <br />

                <Typography variant="h6">Scoring:</Typography>
                <Typography variant="subtitle1">
                  Participants are ranked by score. Your score is determined by the number of test cases your code submission successfully passes. If two participants have the same score, the tie is broken by the contestant with the lowest amount of time taken.
                </Typography>
                <br />
              </Box>
            </Paper>
          </Grid>
        }
        {
          leaderBoard === true &&
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" square  style={{backgroundColor: 'lightgray', paddingLeft: 80, paddingTop: 80, paddingRight: 80, maxHeight: windowHeight, height: windowHeight, overflow: 'auto'}}>
              <Box className={classes.leaderBoard}>
                <Button onClick={() => handleLeaderBoardChange()} variant='contained' color='primary'>Back to Welcome!</Button>
                <Typography style={{marginTop: 10}} variant="h4">Leader Board</Typography>
                <br />
              </Box>
              <LeaderBoard examSubmissions={examSubmissions} />
            </Paper>
          </Grid>
        }
      </Grid>
    </>
  );
}

export async function getServerSideProps({ params, req }) {
  const cookies = parseCookies(req);
  let user = null;
  let isInvited = false;
  let isParticipated = false;

  const examination = await exams.get({examId: params.id });

  if(examination.published === undefined ||  examination.published === false){
    return {
      redirect: {
        permanent: false,
        destination: "/examination/reject/unpublished_forbidden"
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

          if(examination.isPrivate === true){

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
              destination: `/login?returnURL=examination/${params.id}`
            }
          }
        }
      }
      else{
        return {
          redirect: {
            permanent: false,
            destination: `/login?returnURL=examination/${params.id}`
          }
        }
      }
    }
    else{
      return {
        redirect: {
          permanent: false,
          destination: `/login?returnURL=examination/${params.id}`
        }
      }
    }
  }
  catch (e){
    console.log(e);
  }

  const joinedExams = await developers.getJoinedExams(user);
  for(let i = 0; i < joinedExams.length; i+=1){
    if(joinedExams[i].id === params.id){
      isParticipated = true;
    }
  }

  // Redirect to /examination/start/examId if you have participated but not submitted yet
  const isSubmitted = await developers.getExamResults(user.id, params.id);
  if(isParticipated === true && isSubmitted.length === 0 && examination.endAt >= Date.now()){
    return {
      redirect: {
        permanent: false,
        destination: `/examination/start/${params.id}`
      }
    }
  }


  const examSubmissions = await exams.getAllExamSubmissions(params.id);


  return {
    props: {
      // user,
      examId: params.id,
      examination,
      isInvited,
      isParticipated,
      examSubmissions
    },
  };
}

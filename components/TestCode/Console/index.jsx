import React from 'react';
import {
  makeStyles,
  AppBar,
  Tabs,
  Tab,
  Paper
} from '@material-ui/core';


function TabPanel(props) {
  const { children, value, index } = props;

  return (
    <>
      {value === index && (
        <Paper style={{ height: 160, overflow: 'auto' }}>
          <pre>{children}</pre>
        </Paper>
      )}
    </>
  );
}

const useStyles = makeStyles({
  Tabs: {
    alignItems: 'center',
    height: 30,
    minHeight: 30,
  },
  Tab: {
    fontSize: 10,
    fontWeight: 'bolder',
  },
});

export default function Console({ cases, testCodeResult, width }) {
  const classes = useStyles();

  const [value, setValue] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          indicatorColor="primary"
          textColor="primary"
          className={classes.Tabs}
          onChange={handleChange}
          aria-label="tabs example"
          style={{ width }}
        >
          <Tab
            style={{ backgroundColor: value === 0 ? 'white' : '' }}
            className={classes.Tab}
            label="Testcase"
          />
          <Tab
            style={{ backgroundColor: value === 1 ? 'white' : '' }}
            className={classes.Tab}
            label="Run Code Result"
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        {cases.map((testCase, index) => (
          <>
            <h3 style={{ marginBottom: '0px', marginLeft: '15px' }}>
              Test case {index + 1}:
            </h3>
            <div style={{ marginLeft: '30px' }}>Input: {testCase.input}</div>
            <div style={{ marginLeft: '30px' }}>Output: {testCase.output}</div>
          </>
        ))}
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div style={{ marginLeft: '15px' }}>{testCodeResult}</div>
      </TabPanel>
    </>
  );
}

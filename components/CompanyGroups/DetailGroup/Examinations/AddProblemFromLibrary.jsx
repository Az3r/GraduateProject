import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import AddIcon from '@material-ui/icons/Add';
import {
  Box,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  OutlinedInput,
  Select,
  Typography,
} from '@material-ui/core';
import HTMLReactParser from 'html-react-parser';
import { Pagination } from '@material-ui/lab';
import { get } from '@libs/client/problems';

const useStyles = makeStyles({
  container: {
    width: 500,
  },
  listItem: {
    width: '100%',
  },
  titleStyle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: 40,
  },
  outlinedInput: {
    height: 30,
    margin: 20,
    width: 350,
    borderRadius: 16,
  },
  typeStyle: {
    margin: '20px',
  },
});

const ITEMS_PER_PAGE = 10;

export default function AddProblemFromLibrary({
  idCompany,
  questionsList,
  handleAddQuestionFromLibrary,
  problemsData,
}) {
  const [filterQuestions, setFilterQuestions] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [page, setPage] = useState(1);
  const [numberOfPages, setNumberOfPages] = useState(1);

  useEffect(async () => {
    const filtered = getDisplayListForPagination(
      problemsData,
      0,
      ITEMS_PER_PAGE,
      searchKey,
      type
    );
    setFilterQuestions(filtered);
    setNumberOfPages(getNumberOfPages(problemsData));
  }, []);

  const classes = useStyles();
  const [type, setType] = useState(0);

  const handleChangeType = (e) => {
    setType(e.target.value);
    const newList = getListAfterSearch(problemsData, searchKey, e.target.value);
    const pages = getNumberOfPages(newList);
    setNumberOfPages(pages);
    const filtered = getDisplayListForPagination(
      problemsData,
      0,
      ITEMS_PER_PAGE,
      searchKey,
      e.target.value
    );
    setFilterQuestions(filtered);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const newList = getListAfterSearch(problemsData, searchKey, type);
      const pages = getNumberOfPages(newList);
      setNumberOfPages(pages);
      const filtered = getDisplayListForPagination(
        problemsData,
        0,
        ITEMS_PER_PAGE,
        searchKey,
        type
      );
      setFilterQuestions(filtered);
      setPage(1);
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    const filtered = getDisplayListForPagination(
      problemsData,
      value - 1,
      ITEMS_PER_PAGE,
      searchKey,
      type
    );
    setFilterQuestions(filtered);
  };

  return (
    <Box m={3} p={2} className={clsx(classes.container)}>
      <Typography variant="h5">Choose questions from library</Typography>
      <Box display="flex" justifyContent="center">
        <OutlinedInput
          className={classes.outlinedInput}
          placeholder="Search..."
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </Box>
      <Box display="flex" justifyContent="center">
        <Select
          native
          value={type}
          onChange={handleChangeType}
          className={classes.typeStyle}
        >
          <option value={0}>All</option>
          <option value={1}>Coding questions</option>
          <option value={2}>Multiple choice questions</option>
        </Select>
      </Box>
      <List>
        {filterQuestions?.map((item) => (
          <ListItem key={item.id}>
            <ListItemIcon>
              {questionsList.find((question) => question.id === item.id) ? (
                <IconButton variant="contained" color="primary" disabled>
                  <AddIcon />
                </IconButton>
              ) : (
                <IconButton
                  variant="contained"
                  color="primary"
                  onClick={async () =>
                    handleAddQuestionFromLibrary(
                      await get({ problemId: item.id })
                    )
                  }
                >
                  <AddIcon />
                </IconButton>
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <>
                  {item.isMCQ ? (
                    <>
                      <div className={classes.titleStyle}>
                        {HTMLReactParser(formatMCQTitle(item.title))}
                      </div>
                      <b>Multiple choice question</b>
                    </>
                  ) : (
                    <>
                      <Typography className={classes.titleStyle}>
                        {item.title}
                      </Typography>
                      <b>Coding question</b>
                    </>
                  )}
                </>
              }
              secondary={
                <>
                  <Link
                    href={`/company-groups/${idCompany}/questions-bank/detail?question=${item.id}`}
                    target="_blank"
                  >
                    Go to detail question
                  </Link>
                  <Divider />
                </>
              }
            />
          </ListItem>
        ))}
      </List>
      <Box display="flex" justifyContent="center" p={2}>
        <Pagination
          count={numberOfPages}
          page={page}
          color="primary"
          onChange={handleChangePage}
        />
      </Box>
    </Box>
  );
}

function getNumberOfPages(list) {
  return list.length % ITEMS_PER_PAGE === 0
    ? Math.floor(list.length / ITEMS_PER_PAGE)
    : Math.floor(list.length / ITEMS_PER_PAGE) + 1;
}

function getListAfterSearch(list, filterName, type) {
  let result = list.filter((item) =>
    item.title.toLowerCase().includes(filterName.toLowerCase())
  );
  if (type === '1') {
    result = result.filter((item) => item.isMCQ === undefined);
  } else if (type === '2') {
    result = result.filter((item) => item.isMCQ === true);
  }
  return result;
}

function getDisplayListForPagination(
  list,
  start,
  numberOfItemsPerPage,
  filterName,
  type
) {
  let result = list.filter((item) =>
    item.title.toLowerCase().includes(filterName.toLowerCase())
  );
  if (type === '1') {
    result = result.filter((item) => item.isMCQ === undefined);
  } else if (type === '2') {
    result = result.filter((item) => item.isMCQ === true);
  }
  result = result.slice(
    start * numberOfItemsPerPage,
    (start + 1) * numberOfItemsPerPage
  );
  return result;
}

function formatMCQTitle(title) {
  title = title.replace('<h2>', '<p>');
  title = title.replace('</h2>', '</p>');
  title = title.replace('<h3>', '<p>');
  title = title.replace('</h3>', '</p>');
  title = title.replace('<h4>', '<p>');
  title = title.replace('</h4>', '</p>');
  title = title.replace('<strong>', '<p>');
  title = title.replace('</strong>', '</p>');
  title = title.replace('<i>', '<p>');
  title = title.replace('</i>', '</p>');
  return title;
}

import { Box, Button, Container, Grid, makeStyles, NativeSelect, TextField, Typography } from '@material-ui/core';
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CodeEditor from '../../../../CodeEditor';
import SkewLoader from "react-spinners/SkewLoader";


const useStyles = makeStyles({
    textSuccess: {
        color: '#52C41A'
    },
    textFail: {
        color: '#F74B4D'
    }
})



export default function CodingProblem({
        NO,value,
        handleChangeCPTitle,handleChangeCPInfo,handleChangeCPDifficulty,handleChangeScore,
        handleChangeLanguague,handleChangeCPCode,handleChangeSimpleTest,handleTestCode,isTestSuccess,handleChangeCPFiles,testResponse}){
    
    const classes = useStyles();

    const handleChangeInfo = (event,editor) => {
        const value = editor.getData();
        handleChangeCPInfo(NO,value);
    }

    const handleOnChangeCode = (newCode) => {
        handleChangeCPCode(NO,newCode);
    }

    return(
        <Box boxShadow={4} p={2}>
            <Typography variant="h5" >Question #{NO+1}</Typography>
            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Enter title: </Typography>
                <TextField
                    id={"CP_"+NO}
                    onChange={handleChangeCPTitle} fullWidth>
                </TextField>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Enter information: </Typography>
                <CKEditor
                    editor={ ClassicEditor }
                    data=""
                    onChange={handleChangeInfo}>
                </CKEditor>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Choose level of difficulty: </Typography>
                <NativeSelect id={"CP_"+NO}
                    onChange={handleChangeCPDifficulty}>
                    <option value={0}>Easy</option>
                    <option value={1}>Medium</option>
                    <option value={2}>Hard</option>
                </NativeSelect>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Enter score: </Typography>
                <input id={"CP_"+NO} onChange={handleChangeScore} type="number" max="100" min="0" value={value.Score}></input>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Choose programming language: </Typography>
                <NativeSelect
                    onChange={handleChangeLanguague} id={"CP_"+NO}>
                    <option value={"Csharp"}>C#</option>
                    <option value={"Java"}>Java</option>
                    <option value={"Python"}>Python</option>
                </NativeSelect>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Grid container>
                    <Grid item lg={6}>

                        <Typography variant={"h5"}>Enter code: </Typography>
                        <CodeEditor language={value.Language}  code={value.Code} onCodeChange={handleOnChangeCode} ></CodeEditor>

                    </Grid>
                    <Grid item lg={6}>
                        <Typography variant="h5">Notes:</Typography>
                        <ul>
                            <li><Typography>Write full your code in the coding editor</Typography></li>
                            <li><Typography>Enter simple input and output to test your code (include only one test case)</Typography></li>
                            <li><Typography>Click "Test code" button to test your code and input, output</Typography></li>
                        </ul>

                        <div>
                            <TextField id={"CP_"+NO+"_SimpleIn"} multiline label="Enter simple input" onChange={handleChangeSimpleTest}>
                            </TextField>
                        </div>
                        <div>
                            <TextField id={"CP_"+NO+"_SimpleOut"} multiline label="Enter simple output" onChange={handleChangeSimpleTest}>
                            </TextField>
                        </div>
                        <br></br>

                        <Typography className={value.TestCodeSuccess ? classes.textSuccess : classes.textFail}>{value.MessageTestCode}</Typography>
                        <div>
                            <SkewLoader color={"#088247"}  loading={value.IsLoadingTestCode} size={20} />
                        </div>
                        <Button variant="primary" id={"CP_"+NO} onClick={handleTestCode}>Test code</Button>
                    </Grid>
                </Grid>
            </Box>

            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Submit input file: </Typography>
                <input id={"CP_"+NO+"_In"} type="file" onChange={handleChangeCPFiles}></input>
            </Box>
            <Box boxShadow={1} p={2} m={3}>
                <Typography variant={"h5"}>Submit expected output file: </Typography>
                <input id={"CP_"+NO+"_Out"} type="file" onChange={handleChangeCPFiles}></input>
            </Box>
        </Box>
    )
}
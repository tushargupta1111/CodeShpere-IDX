import { Box ,Button,Text, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { executeCode } from '../API';

const Output = ({editorRef, language}) => {
  const toast = useToast();
  const [output,setOutput] = useState(null);
  const [isLoading,setIsLoading] =useState(false);
  const [isError,setIsError] = useState(false);

  const runCode = async () =>{
    const sourceCode = editorRef.current.getValue();
    if(!sourceCode) return;
    try{
      setIsLoading(true);
      const {run : result } =await executeCode(language, sourceCode);
      setOutput(result.output.split('\n'));
      result.stderr ? setIsError(true) : setIsError(false);
    }
    catch(error)
    {
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    }
    finally{
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
        <Box display="flex" flexDirection="column" alignItems="flex-end" w="100%">
            <Text mb={2} fontSize="lg">Output</Text>
            <Button 
                variant="outline"  
                colorScheme="blue" 
                mb={4} 
                isLoading={isLoading} 
                onClick={runCode}
            >
                Run Code
            </Button>
        </Box>

        <Box height='80vh' p={2} color={isError ? "red.400" : ""} border='1px solid' borderRadius={4} borderColor='#333'>
            {output ? output.map((line,i) => <Text key={i}>{line}</Text>): 'Click "Run Code" to see the output here'}
        </Box>
    </Box>
  )
}

export default Output
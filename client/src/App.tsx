import React from 'react';
import { Box } from '@chakra-ui/react';
import Clientes from './pages/Clientes';

function App() {
  return (
    <Box maxWidth="1200px" margin="0 auto" p={4}>
      <Clientes />
    </Box>
  );
}

export default App;

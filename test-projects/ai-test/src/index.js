import { h } from 'preact';
import { render } from 'preact/compat';
import { Suspense, lazy } from 'preact/compat';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';

// Lazy load components
const SearchInput = lazy(() => import('./components/SearchInput'));
const DatePicker = lazy(() => import('./components/DatePicker'));
const IconGallery = lazy(() => import('./components/IconGallery'));

// Create theme
const theme = createTheme();

const Container = styled('div')`
  padding: 24px;
`;

const Title = styled('h1')`
  margin-bottom: 24px;
`;

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container>
      <Title>Test App</Title>
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchInput />
      </Suspense>
      <Suspense fallback={<div>Loading date picker...</div>}>
        <DatePicker />
      </Suspense>
      <Suspense fallback={<div>Loading icons...</div>}>
        <IconGallery />
      </Suspense>
    </Container>
  </ThemeProvider>
);

const container = document.getElementById('root');
render(<App />, container);

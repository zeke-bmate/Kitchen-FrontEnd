import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#D97706'
        },
        secondary: {
            main: '#656b6e'
        },
        background: {
            default: '#F9FAFB',
            paper: '#FFFFFF'
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

export default theme;
import React from 'react';
import {useDarkMode} from '../../components/DarkMode/useDarkMode';
import {darkTheme
    // , lightTheme
} from '../../components/DarkMode/theme';
import {GlobalStyles} from '../../components/DarkMode/global';
import {ThemeProvider} from 'styled-components';
import Icon from "../../components/Icon";

const Darktheme = () => {
    const [theme, ] = useDarkMode();
    const themeMode = theme === 'light' ? darkTheme : darkTheme;
    // console.log(toggleTheme);
    return (
        <ThemeProvider theme={themeMode}>
            <GlobalStyles/>
            <button onClick={e=>e.preventDefault()} className="dark-mode-button hidden"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                <Icon
                    viewClass="icon"
                    icon={theme === 'light' ? 'dayMode' : 'dayMode'}
                />
            </button>
        </ThemeProvider>
    );
};

export default Darktheme;

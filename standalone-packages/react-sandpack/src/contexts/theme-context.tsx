import * as React from 'react';
import { createThemeObject, codesandboxLightTheme } from '../themes';
import {
  SandpackPartialTheme,
  SandpackPredefinedTheme,
  SandpackTheme,
} from '../types';
import { injectThemeStyleSheet } from '../utils/dom-utils';

const SandpackThemeContext = React.createContext<{
  theme: SandpackTheme;
  id: string;
}>({
  theme: codesandboxLightTheme,
  id: 'codesandbox-light',
});

const SandpackThemeProvider: React.FC<{
  theme?: SandpackPredefinedTheme | SandpackPartialTheme;
}> = props => {
  const { theme, id } = createThemeObject(props.theme);

  // If theme is not explicitly set, don't inject any stylesheet
  if (props.theme) {
    injectThemeStyleSheet(theme, id);
  }

  return (
    <SandpackThemeContext.Provider
      value={{
        theme,
        id,
      }}
    >
      <div className={`sp-wrapper ${id}`}>{props.children}</div>
    </SandpackThemeContext.Provider>
  );
};

const SandpackThemeConsumer = SandpackThemeContext.Consumer;

export { SandpackThemeProvider, SandpackThemeConsumer, SandpackThemeContext };

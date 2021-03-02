import React, { useState } from 'react';
import { useOvermind } from 'app/overmind';
import { useDebouncedCallback } from 'use-debounce';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';

import {
  Stack,
  Input,
  Button,
  Link,
  Icon,
  IconButton,
  List,
  Text,
} from '@codesandbox/components';
import css from '@styled-system/css';
import LogoIcon from '@codesandbox/common/lib/components/Logo';
import { UserMenu } from 'app/pages/common/UserMenu';

import { Notifications } from 'app/components/Notifications';
import { dashboard as dashboardUrls } from '@codesandbox/common/lib/utils/url-generator';
import { ENTER } from '@codesandbox/common/lib/utils/keycodes';

interface HeaderProps {
  onSidebarToggle: () => void;
}

/** poor man's feature flag - to ship the unfinished version */
const SHOW_COMMUNITY_SEARCH = localStorage.SHOW_COMMUNITY_SEARCH;

export const Header: React.FC<HeaderProps> = React.memo(
  ({ onSidebarToggle }) => {
    const {
      actions: { openCreateSandboxModal },
      state: { user, activeWorkspaceAuthorization },
    } = useOvermind();

    return (
      <Stack
        as="header"
        justify="space-between"
        align="center"
        paddingX={4}
        css={css({
          boxSizing: 'border-box',
          fontFamily: 'Inter, sans-serif',
          height: 12,
          backgroundColor: 'titleBar.activeBackground',
          color: 'titleBar.activeForeground',
          borderBottom: '1px solid',
          borderColor: 'titleBar.border',
        })}
      >
        <Link
          href="/?from-app=1"
          as="a"
          css={css({ display: ['none', 'none', 'block'] })}
        >
          <LogoIcon
            style={{
              marginLeft: -6, // Logo positioning tweak
            }}
            height={24}
          />
        </Link>
        <IconButton
          name="menu"
          size={18}
          title="Menu"
          onClick={onSidebarToggle}
          css={css({ display: ['block', 'block', 'none'] })}
        />

        <SearchInputGroup />

        <Stack align="center" gap={2}>
          <Button
            variant="primary"
            css={css({ width: 'auto', paddingX: 3 })}
            disabled={activeWorkspaceAuthorization === 'READ'}
            onClick={() => {
              openCreateSandboxModal({});
            }}
          >
            Create Sandbox
          </Button>

          {user && <Notifications />}

          <UserMenu>
            <Button
              as={UserMenu.Button}
              variant="secondary"
              css={css({ size: 26 })}
            >
              <Icon name="more" size={12} title="User actions" />
            </Button>
          </UserMenu>
        </Stack>
      </Stack>
    );
  }
);

const SearchInputGroup = () => {
  const {
    state: { activeTeam },
  } = useOvermind();

  const history = useHistory();
  const location = useLocation();

  const [value, setValue] = useState(
    new URLSearchParams(window.location.search).get('query') || ''
  );

  const searchType = location.pathname.includes('/explore')
    ? 'COMMUNITY'
    : 'WORKSPACE';

  const search = (query: string) => {
    if (searchType === 'COMMUNITY') {
      history.push(dashboardUrls.exploreSearch(query, activeTeam));
    } else {
      history.push(dashboardUrls.search(query, activeTeam));
    }
  };
  const [debouncedSearch] = useDebouncedCallback(search, 100);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    if (event.target.value.length >= 2) debouncedSearch(event.target.value);
    if (!event.target.value) {
      history.push(dashboardUrls.allSandboxes('/', activeTeam));
    }
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.which === ENTER) event.currentTarget.blur();
  };

  return (
    <Stack
      css={css({
        flexGrow: 1,
        maxWidth: 480,
        display: ['none', 'none', 'block'],
        position: 'relative',
      })}
    >
      <Combobox
        openOnFocus
        onSelect={() => {
          // switch to the other search
          if (searchType === 'COMMUNITY') {
            history.push(dashboardUrls.search(value, activeTeam));
          } else {
            history.push(dashboardUrls.exploreSearch(value, activeTeam));
          }
        }}
      >
        <ComboboxInput
          as={Input}
          value={value}
          onChange={onChange}
          onKeyPress={handleEnter}
          placeholder="Search all sandboxes"
        />
        {SHOW_COMMUNITY_SEARCH && (
          <ComboboxPopover
            css={css({
              zIndex: 4,
              fontFamily: 'Inter, sans-serif',
              fontSize: 3,
            })}
          >
            <ComboboxList
              as={List}
              css={css({
                backgroundColor: 'menuList.background',
                borderRadius: 3,
                boxShadow: 2,
                border: '1px solid',
                borderColor: 'menuList.border',
              })}
            >
              <ComboboxOption
                value={value}
                justify="space-between"
                css={css({
                  outline: 'none',
                  height: 7,
                  paddingX: 2,
                  color: 'list.foreground',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  ':hover, &[aria-selected="true"]': {
                    color: 'list.hoverForeground',
                    backgroundColor: 'list.hoverBackground',
                  },
                })}
              >
                <span>{value}</span>
                <span>
                  {searchType === 'COMMUNITY' ? 'Workspace' : 'Community'} ⏎
                </span>
              </ComboboxOption>
            </ComboboxList>
            <Text
              size={3}
              variant="muted"
              css={css({
                position: 'absolute',
                width: 'fit-content',
                top: -5,
                right: 0,
                paddingX: 2,
              })}
            >
              {searchType === 'COMMUNITY' ? 'in community' : 'in workspace'} ⏎
            </Text>
          </ComboboxPopover>
        )}
      </Combobox>
    </Stack>
  );
};

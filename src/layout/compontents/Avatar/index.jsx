import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Menu, Avatar, Dropdown
} from '@arco-design/web-react';
import { IconUser, IconPoweroff } from '@arco-design/web-react/icon';
import { logout } from '@/store/actions/user';

export default function AvatarCompontent() {
  const dispatch = useDispatch();

  const iconStyle = {
    marginRight: 8,
    fontSize: 16,
    transform: 'translateY(1px)'
  };

  const handleClickMenuItem = (key) => {
    if (key === 'logout') dispatch(logout());
  };
  return (
    <Dropdown
      position="br"
      droplist={
        <Menu onClickMenuItem={handleClickMenuItem}>
          <Menu.Item key="admin">
            <IconUser style={iconStyle} />
            Profile
          </Menu.Item>
          <Menu.Item key="logout">
            <IconPoweroff style={iconStyle} />
            Logout
          </Menu.Item>
        </Menu>
      }
    >
      <Avatar
        style={{
          backgroundColor: '#165DFF'
        }}
      >
        H
      </Avatar>
    </Dropdown>
  );
}

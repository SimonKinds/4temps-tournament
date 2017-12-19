// @flow

import React, { PureComponent } from 'react';
import { Modal } from 'semantic-ui-react';
import type { RouterHistory, Location } from 'react-router-dom';

import LoginComponent from './component';
import { loginUser } from '../../api/user';

import type { UserCredentials } from '../../../models/user';

type Props = {
  updatedAuthenticationState: () => void,
  location: Location,
  history: RouterHistory
}

type State = {
  isValidInput: boolean,
  isValidEmail: boolean,
  isValidPassword: boolean,
  wasCorrectCredentials: boolean,
};

class LoginContainer extends PureComponent<Props, State> {
  state = {
    isValidInput: true,
    isValidEmail: false,
    isValidPassword: false,
    wasCorrectCredentials: false
  };

  _onSubmit = async (credentials: UserCredentials) => {
    const { isValid, isValidEmail, isValidPassword, doesUserExist } =
      await loginUser(credentials);

    this.setState({
      isValidInput: isValid,
      isValidEmail,
      isValidPassword,
      wasCorrectCredentials: doesUserExist
    });

    if (isValid) {
      window.isAuthenticated = true;
      this.props.updatedAuthenticationState();
      const referer = this.props.location.search.replace(/\?referer=/, '');
      setTimeout(() =>
        this.props.history.push(referer), 1000);
    }
  }

  render() {
    return (
      <div>
        <Modal
          open={this.state.wasCorrectCredentials}
          header='Success!'
          content='Redirecting...'
        />
        <LoginComponent
          {...this.state}
          onSubmit={this._onSubmit}
        />);
      </div>);
  }
}

export default LoginContainer;
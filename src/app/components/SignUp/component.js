// @flow
import React, { Component } from 'react';
import { Form, FormInput, Button, Message } from 'semantic-ui-react';
import type { UserCreateValidationSummary } from './validator';
import type { UserWithPassword } from './user';

import './styles.css';

type Props = {
    onSubmit: (user: UserWithPassword) => Promise<void>,
    validation: UserCreateValidationSummary,
};

class SignUp extends Component<Props, UserWithPassword> {
    state = {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };

    _onChangeFirstName = (event: SyntheticInputEvent<HTMLInputElement>) => {
      this.setState({ firstName: event.target.value });
    };

    _onChangeLastName = (event: SyntheticInputEvent<HTMLInputElement>) => {
      this.setState({ lastName: event.target.value });
    };

    _onChangeEmail = (event: SyntheticInputEvent<HTMLInputElement>) => {
      this.setState({ email: event.target.value });
    };

    _onChangePassword = (event: SyntheticInputEvent<HTMLInputElement>) => {
      this.setState({ password: event.target.value });
    };

    _onSubmit = () => {
      this.props.onSubmit(this.state);
    };

    render() {
      return (
        <div styleName='wrapper'>
          <Form error={!this.props.validation.isValid}>
            <FormInput
              label='First name'
              placeholder='John'
              value={this.state.firstName}
              onChange={this._onChangeFirstName}
            />
            {!this.props.validation.isValidFirstName &&
            <Message error content='Invalid first name' />}
            <FormInput
              label='Last name'
              placeholder='Smith'
              value={this.state.lastName}
              onChange={this._onChangeLastName}
            />
            {!this.props.validation.isValidLastName &&
            <Message error content='Invalid last name' />}
            <FormInput
              label='Email'
              placeholder='john@gmail.com'
              value={this.state.email}
              onChange={this._onChangeEmail}
            />
            {!this.props.validation.isValidEmail &&
            <Message error content='Invalid email' />}
            <FormInput
              label='Password'
              type='password'
              value={this.state.password}
              placeholder='P4ssw0rd'
              onChange={this._onChangePassword}
            />
            {!this.props.validation.isValidPassword &&
            <Message error content='Come on now, everyone knows a password is at least 8 characters' />}
            <Button onClick={this._onSubmit} type='submit'>Submit</Button>
          </Form >
        </div>
      );
    }
}

export default SignUp;
// @flow
import React, { Component } from 'react';
import { Form, FormInput, Message } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import type Moment from 'moment';

type Props = {
  isLoading: boolean,

  name: string,
  date: Moment,

  isValidName: boolean,
  isValidDate: boolean,

  onChangeName: (name: string) => void,
  onChangeDate: (date: Moment) => void
}

class ModifyGeneral extends Component<Props> {

  _onChangeName = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.onChangeName(event.target.value);
  }

  _onChangeDate = (date: ?Moment) => {
    if (date != null) {
      this.props.onChangeDate(date);
    }
  }

  render() {
    return (
      <Form loading={this.props.isLoading} >
        <FormInput
          label='Name'
          placeholder='4Temps World Championship'
          value={this.props.name}
          onChange={this._onChangeName}
        />
        {!this.props.isValidName &&
          <Message error content='Invalid name' />}
        <div className='field'>
          <label htmlFor='date'>Date
            <DatePicker
              id='date'
              allowSameDay
              selected={this.props.date}
              onChange={this._onChangeDate}
            />
          </label>
        </div>
        {!this.props.isValidDate &&
          <Message error content='Invalid date' />}
      </Form>
    );
  }
}

export default ModifyGeneral;
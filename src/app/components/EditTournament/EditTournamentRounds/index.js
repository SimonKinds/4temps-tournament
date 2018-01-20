// @flow

import React, { Component } from 'react';
import {
  Header, Divider, Button, Message,
  Form, FormGroup, FormInput, FormRadio, FormButton
} from 'semantic-ui-react';

import validateRound from '../../../../validators/validate-round';

type CriterionType = 'none' | 'both' | 'one' | 'follower' | 'leader';

type Criterion = {
  name: string,
  minValue: ?number,
  maxValue: ?number,
  description: string,
  type: CriterionType
}

type TieRule = 'none' | 'random' | 'all';
type RoundScoringRule = 'none' | 'average' | 'averageWithoutOutliers';
type MultipleDanceScoringRule = 'none' | 'average' | 'best' | 'worst';

type State = {
  danceCount: ?number,
  minPairCount: ?number,
  maxPairCount: ?number,
  tieRule: TieRule,
  roundScoringRule: RoundScoringRule,
  multipleDanceScoringRule: MultipleDanceScoringRule,
  criteria: Array<Criterion>,

  validation: RoundValidationSummary
}

class EditTournamentRounds extends Component<{}, State> {
  state = {
    danceCount: null,
    minPairCount: null,
    maxPairCount: null,
    tieRule: 'none',
    roundScoringRule: 'none',
    multipleDanceScoringRule: 'none',
    criteria: [{
      name: '',
      description: '',
      minValue: null,
      maxValue: null,
      type: 'none'
    }],

    validation: {
      isValidRound: true,
      isValidDanceCount: true,
      isValidMinPairCount: true,
      isValidMaxPairCount: true,
      isMaxPairGreaterOrEqualToMinPair: true,
      isValidTieRule: true,
      isValidRoundScoringRule: true,
      isValidMultipleDanceScoringRule: true,
      isValidAmountOfCriteria: true,
      isValidCriteria: true,
      criteriaValidation: [{
        isValidCriterion: true,
        isValidName: true,
        isValidMinValue: true,
        isValidMaxValue: true,
        isValidValueCombination: true,
        isValidType: true,
        isValidDescription: true
      }]
    }
  }

  _onChangeDanceCount = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ danceCount: this._parseCount(event) });
  }

  _onChangeMinPairCount = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ minPairCount: this._parseCount(event) });
  }

  _onChangeMaxPairCount = (event: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ maxPairCount: this._parseCount(event) });
  }

  _parseCount = (event: SyntheticInputEvent<HTMLInputElement>): ?number => {
    const count = parseInt(event.target.value);
    return isNaN(count) ? null : count;
  }

  _onChangeTieRule = (event: SyntheticInputEvent<HTMLInputElement>,
    { value }: { value: TieRule }) => this.setState({ tieRule: value });

  _onChangeRoundScoringRule = (event: SyntheticInputEvent<HTMLInputElement>,
    { value }: { value: RoundScoringRule }) =>
    this.setState({ roundScoringRule: value });

  _onChangeMultipleDanceScoringRule =
    (event: SyntheticInputEvent<HTMLInputElement>,
      { value }: { value: MultipleDanceScoringRule }) =>
      this.setState({ multipleDanceScoringRule: value });

  _countOrEmptyString = (count: ?number): string | number => {
    return count != null ? count : '';
  }

  _renderDanceRule = () => {
    const { danceCount, multipleDanceScoringRule, validation } = this.state;
    if (danceCount != null && danceCount > 1) {
      return (
        <span>
          <span className='field'>
            <label htmlFor='dance-rule'>
              How are the score of multiple dances handled?
            </label>
          </span>
          <FormGroup id='dance-rule' widths='equal'>
            <FormRadio
              label='Average of all dances'
              value='average'
              onChange={this._onChangeMultipleDanceScoringRule}
              checked={multipleDanceScoringRule === 'average'}
            />
            <FormRadio
              label='Only the best dance'
              value='best'
              onChange={this._onChangeMultipleDanceScoringRule}
              checked={multipleDanceScoringRule === 'best'}
            />
            <FormRadio
              label='Only the worst dance'
              value='worst'
              onChange={this._onChangeMultipleDanceScoringRule}
              checked={multipleDanceScoringRule === 'worst'}
            />
          </FormGroup>
          {!validation.isValidMultipleDanceScoringRule &&
            <Message error content='Must pick at least one rule' />}
        </span>
      );
    }
  }

  _renderCriteria = () => this.state.criteria.map(this._renderCriterion);

  _renderCriterion = (criterion: Criterion, index: number) => {
    const onChangeString = (key: string) =>
      (event) => this._onChangeCriterion({
        ...criterion,
        [key]: event.target.value
      }, index);
    const onChangeInt = (key: string) =>
      (event) => {
        this._onChangeCriterion({
          ...criterion,
          [key]: this._parseCount(event)
        }, index);
      };
    const onChangeRadio = (event, { value }) =>
      this._onChangeCriterion({
        ...criterion,
        type: value
      }, index);

    const { type } = criterion;
    const { validation } = this.state;

    const criterionValidation = index < validation.criteriaValidation.length ?
      validation.criteriaValidation[index] : {
        isValidCriterion: true,
        isValidName: true,
        isValidMinValue: true,
        isValidMaxValue: true,
        isValidValueCombination: true,
        isValidType: true,
        isValidDescription: true
      };

    return (
      <div key={index}>
        <FormGroup widths='equal'>
          <FormInput
            label='Name'
            placeholder='Style'
            value={criterion.name}
            onChange={onChangeString('name')}
            error={!criterionValidation.isValidName}
          />
          <FormInput
            label='Description'
            placeholder='How well they incorporate their own style...'
            value={criterion.description}
            onChange={onChangeString('description')}
            error={!criterionValidation.isValidDescription}
          />
        </FormGroup>
        <FormGroup widths='equal'>
          <FormInput
            label='Minimum value'
            placeholder='0'
            type='number'
            value={this._countOrEmptyString(criterion.minValue)}
            onChange={onChangeInt('minValue')}
            error={!criterionValidation.isValidMinValue
              || !criterionValidation.isValidValueCombination}
          />
          <FormInput
            label='Maximum value'
            placeholder='7'
            type='number'
            value={this._countOrEmptyString(criterion.maxValue)}
            onChange={onChangeInt('maxValue')}
            error={!criterionValidation.isValidMaxValue
              || !criterionValidation.isValidValueCombination}
          />
        </FormGroup>
        <FormGroup widths='equal'>
          <FormRadio
            label='Criterion affects both dancers'
            value='both'
            onChange={onChangeRadio}
            checked={type === 'both'}
          />
          <FormRadio
            label='Affects one dancer'
            value='one'
            onChange={onChangeRadio}
            checked={type === 'one'}
          />
          <FormRadio
            label='Affects only leaders'
            value='leader'
            onChange={onChangeRadio}
            checked={type === 'leader'}
          />
          <FormRadio
            label='Affects only follower'
            value='leader'
            onChange={onChangeRadio}
            checked={type === 'leader'}
          />
        </FormGroup>
        {!criterionValidation.isValidType &&
          <Message error content='Must pick a type' />}
        <Divider />
      </div>
    );
  }

  _onChangeCriterion = (criterion: Criterion, index: number) => {
    const criteria = [...this.state.criteria];
    criteria[index] = criterion;
    this.setState({ criteria });
  }

  _addCriterion = () => this.setState({
    criteria:
      [
        ...this.state.criteria,
        {
          name: '',
          description: '',
          minValue: null,
          maxValue: null,
          type: 'none'
        },
      ]
  })

  _onSubmit = () => {
    const { validation, ...rest } = this.state;
    const round = { _id: '', ...rest };

    this.setState({ validation: validateRound(round) });
  }

  render() {
    const { tieRule, roundScoringRule, validation } = this.state;
    return (
      <Form error={!validation.isValidRound}>
        <FormGroup widths='equal'>
          <FormInput
            label='Amount of dances'
            placeholder='1'
            type='number'
            value={this._countOrEmptyString(this.state.danceCount)}
            onChange={this._onChangeDanceCount}
            error={!validation.isValidDanceCount}
          />
          <FormInput
            label='Minimum amount of pairs'
            placeholder='5'
            type='number'
            value={this._countOrEmptyString(this.state.minPairCount)}
            onChange={this._onChangeMinPairCount}
            error={!validation.isValidMinPairCount
              || !validation.isMaxPairGreaterOrEqualToMinPair}
          />
          <FormInput
            label='Maximum amount of pairs'
            placeholder='8'
            type='number'
            value={this._countOrEmptyString(this.state.maxPairCount)}
            onChange={this._onChangeMaxPairCount}
            error={!validation.isValidMaxPairCount
              || !validation.isMaxPairGreaterOrEqualToMinPair}
          />
        </FormGroup>
        {this._renderDanceRule()}
        <span className='field'>
          <label htmlFor='tie-rules'>
            How are ties settled?
          </label>
        </span>
        <FormGroup id='tie-rules' widths='equal'>
          <FormRadio
            label='Randomly pick one pair'
            value='random'
            onChange={this._onChangeTieRule}
            checked={tieRule === 'random'}
          />
          <FormRadio
            label='Pick both'
            value='all'
            onChange={this._onChangeTieRule}
            checked={tieRule === 'all'}
          />
        </FormGroup>
        {!validation.isValidTieRule &&
          <Message error content='Must pick at least one rule' />}
        <span className='field'>
          <label htmlFor='judge-merge'>
            How are the judges scores merged?
          </label>
        </span>
        <FormGroup id='judge-merge' widths='equal'>
          <FormRadio
            label='Average of all judges'
            value='average'
            onChange={this._onChangeRoundScoringRule}
            checked={roundScoringRule === 'average'}
          />
          <FormRadio
            label='Average of all judges, with outliers removed'
            value='averageWithoutOutliers'
            onChange={this._onChangeRoundScoringRule}
            checked={roundScoringRule === 'averageWithoutOutliers'}
          />
        </FormGroup>
        {!validation.isValidRoundScoringRule &&
          <Message error content='Must pick at least one rule' />}
        <Divider />
        <Header as='h2'>
          Criteria
          <Button
            attached
            floated='right'
            content='Add another criterion'
            onClick={this._addCriterion}
          />
        </Header>
        {this._renderCriteria()}
        <FormButton type='submit' onClick={this._onSubmit}>Submit</FormButton>
      </Form>
    );
  }
}

export default EditTournamentRounds;
// @flow

function validateRound(
  { danceCount,
    minPairCount,
    maxPairCount,
    tieRule,
    roundScoringRule,
    multipleDanceScoringRule,
    criteria
  }: Round): RoundValidationSummary {

  const isValidDanceCount = danceCount != null && danceCount >= 1;
  const isValidMinPairCount = minPairCount != null && minPairCount >= 1;
  const isValidMaxPairCount = maxPairCount != null && maxPairCount >= 1;

  const isMaxPairGreaterOrEqualToMinPair =
    (minPairCount == null || maxPairCount == null)
    || maxPairCount >= minPairCount;

  const isValidTieRule = tieRule === 'random' || tieRule === 'all';

  const isValidRoundScoringRule = roundScoringRule === 'average'
    || roundScoringRule === 'averageWithoutOutliers';

  const isValidMultipleDanceScoringRule =
    multipleDanceScoringRule === 'average'
    || multipleDanceScoringRule === 'best'
    || multipleDanceScoringRule === 'worst';

  const isValidAmountOfCriteria = criteria.length > 0;

  const { isValidCriteria, criteriaValidation } = validateCriteria(criteria);

  return {
    isValidRound: isValidDanceCount && isValidMinPairCount
      && isValidMaxPairCount && isMaxPairGreaterOrEqualToMinPair
      && isValidTieRule && isValidRoundScoringRule
      && isValidMultipleDanceScoringRule && isValidAmountOfCriteria
      && isValidCriteria,
    isValidDanceCount,
    isValidMinPairCount,
    isValidMaxPairCount,
    isMaxPairGreaterOrEqualToMinPair,
    isValidTieRule,
    isValidRoundScoringRule,
    isValidMultipleDanceScoringRule,
    isValidAmountOfCriteria,
    isValidCriteria,
    criteriaValidation,
  };
}

function validateCriteria(criteria: Array<RoundCriterion>) {
  if (criteria.length === 0) {
    return { isValidCriteria: true, criteriaValidation: [] };
  }

  const criteriaValidation = criteria.map(validateCriterion);
  const isValidCriteria =
    criteriaValidation.reduce(
      (acc, cur) => (acc && cur.isValidCriterion), true);

  return {
    isValidCriteria,
    criteriaValidation
  };
}

function validateCriterion({ name,
  description, minValue, maxValue, type }: RoundCriterion) {

  const isValidName = name.length > 0;
  const isValidMinValue = minValue != null && minValue >= 0;
  const isValidMaxValue = maxValue != null && maxValue >= 0;

  const isValidValueCombination =
    maxValue != null && minValue != null ? maxValue > minValue : true;
  // it has to be at least on of these types
  const isValidType =
    ['both', 'one', 'follower', 'leader']
      .reduce((acc, cur) => acc || (cur === type), false);

  const isValidDescription = description.length > 0;

  return {
    isValidCriterion: isValidName && isValidMinValue && isValidMaxValue
      && isValidValueCombination && isValidType && isValidDescription,
    isValidName,
    isValidMinValue,
    isValidMaxValue,
    isValidValueCombination,
    isValidType,
    isValidDescription
  };
}

export default validateRound;
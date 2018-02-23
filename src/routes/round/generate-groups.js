// @flow
import ObjectId from 'bson-objectid';
import type { TournamentRepository } from '../../data/tournament';
import NextGroupGenerator from '../../domain/next-group-generator';

export default class GenerateGroupsRoute {
  _repository: TournamentRepository;

  constructor(repository: TournamentRepository) {
    this._repository = repository;
  }

  route = async (req: ServerApiRequest, res: ServerApiResponse) => {
    try {
      const tournamentId = req.params.tournamentId;
      const handler = new GenerateGroupsRouteHandler(
        this._repository,
        tournamentId,
        req.params.roundId
      );

      await handler.startRound();
      res.json(handler.getUpdatedRound());
    } catch (e) {
      res.sendStatus(this._statusFromError(e));
    }
  };

  _statusFromError = (e: mixed) => {
    if (
      e instanceof RoundNotFoundError ||
      e instanceof TournamentNotFoundError
    ) {
      return 404;
    } else if (
      e instanceof DanceStartedError ||
      e instanceof NotStartedError ||
      e instanceof AlreadyFinishedError
    ) {
      return 400;
    }
    return 500;
  };
}

class GenerateGroupsRouteHandler {
  _repository: TournamentRepository;
  _tournamentId: string;
  _roundId: string;

  _tournament: Tournament;
  _round: Round;

  constructor(
    repository: TournamentRepository,
    tournamentId: string,
    roundId: string
  ) {
    this._repository = repository;
    this._tournamentId = tournamentId;
    this._roundId = roundId;
  }

  getUpdatedRound = () => {
    return this._round;
  };

  startRound = async () => {
    this._tournament = await this._getTournament();
    this._round = this._getRound();

    if (!this._round.active) {
      throw new NotStartedError();
    } else if (this._hasActiveOrFinishedDance()) {
      throw new DanceStartedError();
    } else if (this._round.finished) {
      throw new AlreadyFinishedError();
    }

    this._generateGroups();

    await this._repository.updateRound(this._tournamentId, this._round);
  };

  _generateGroups = () => {
    const groupOne = this._generateGroup();

    if (groupOne != null) {
      this._round.groups = [groupOne];
    }

    const groupTwo = this._generateGroup();

    if (groupTwo != null) {
      this._round.groups.push(groupTwo);
    }
  };

  _generateGroup = (): ?DanceGroup => {
    const generator = new NextGroupGenerator(this._tournament, []);
    return generator.generateForRound(this._round.id);
  };

  _createDances = (danceCount: number) => {
    let dances: Array<Dance> = [];
    for (let i = 0; i < danceCount; ++i) {
      dances.push({ id: ObjectId.generate(), active: false, finished: false });
    }
    return dances;
  };

  _getTournament = async (): Promise<Tournament> => {
    const tournament = await this._repository.get(this._tournamentId);
    if (tournament == null) {
      throw new TournamentNotFoundError();
    }

    return tournament;
  };

  _getRound = (): Round => {
    const matches = this._tournament.rounds.filter(
      ({ id }) => id === this._roundId
    );

    if (matches.length === 0) {
      throw new RoundNotFoundError();
    }

    return matches[0];
  };

  _hasActiveOrFinishedDance = (): boolean => {
    return this._round.groups.reduce(
      (acc, group) =>
        acc ||
        group.dances.reduce(
          (acc, dance) => acc || dance.active || dance.finished,
          false
        ),
      false
    );
  };
}

function TournamentNotFoundError() {}
function RoundNotFoundError() {}
function NotStartedError() {}
function DanceStartedError() {}
function AlreadyFinishedError() {}
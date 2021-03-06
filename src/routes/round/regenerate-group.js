// @flow
import NextGroupGenerator from '../../domain/next-group-generator';
import type { TournamentRepository } from '../../data/tournament';
import type { NoteRepository } from '../../data/note';

export default function regenerateGroupRoute(
  tournamentRepository: TournamentRepository,
  noteRepository: NoteRepository
) {
  return async (req: ServerApiRequest, res: ServerApiResponse) => {
    try {
      const tournament = await getTournament(
        tournamentRepository,
        req.params.tournamentId
      );
      const round = getRound(tournament, req.params.roundId);
      const group = getGroup(round, req.params.groupId);

      if (!isGroupActive(group)) {
        removeLaterGroupsIncluding(round, group);
        generateGroups(
          tournament,
          round,
          await getNotesForRound(noteRepository, round)
        );

        await tournamentRepository.updateRound(tournament.id, round);

        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } catch (e) {
      handleError(e, res);
    }
  };
}

async function getTournament(
  tournamentRepository: TournamentRepository,
  id: string
): Promise<Tournament> {
  const tournament = await tournamentRepository.get(id);

  if (tournament == null) {
    throw new NoTournamentError();
  }

  return tournament;
}

function getRound(tournament: Tournament, id: string): Round {
  const round = tournament.rounds.reduce(
    (res, round) => (round.id === id ? round : res),
    null
  );

  if (round == null) {
    throw new NoRoundError();
  }

  return round;
}

function getGroup(round: Round, id: string): DanceGroup {
  const group = round.groups.reduce(
    (res, group) => (group.id === id ? group : res),
    null
  );

  if (group == null) {
    throw new NoGroupError();
  }

  return group;
}

function isGroupActive(group: DanceGroup): boolean {
  return group.dances.reduce(
    (acc, { active, finished }) => acc || active || finished,
    false
  );
}

function removeLaterGroupsIncluding(round: Round, group: DanceGroup): void {
  const index = round.groups.indexOf(group);
  round.groups = round.groups.slice(0, index);
}

async function getNotesForRound(
  repo: NoteRepository,
  round: Round
): Promise<Array<JudgeNote>> {
  const dances = round.groups.reduce(
    (dances, group) => [...dances, ...group.dances],
    []
  );

  let notes: Array<JudgeNote> = [];
  for (const dance of dances) {
    notes = notes.concat(await repo.getForDance(dance.id));
  }

  return notes;
}

function generateGroups(
  tournament: Tournament,
  round: Round,
  notes: Array<JudgeNote>
) {
  let group = null;
  do {
    group = generateGroup(tournament, notes, round.id);
    if (group != null) {
      round.groups.push(group);
    }
  } while (group != null);
}

function generateGroup(
  tournament: Tournament,
  notes: Array<JudgeNote>,
  roundId: string
): ?DanceGroup {
  const generator = new NextGroupGenerator(tournament, notes);
  generator.disableReuseOfParticipants();
  return generator.generateForRound(roundId);
}

function handleError(e: mixed, res: ServerApiResponse) {
  if (
    e instanceof NoTournamentError ||
    e instanceof NoRoundError ||
    e instanceof NoGroupError
  ) {
    res.sendStatus(404);
  } else {
    res.sendStatus(500);
  }
}

function NoTournamentError() {}
function NoRoundError() {}
function NoGroupError() {}

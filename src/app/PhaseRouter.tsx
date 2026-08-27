import type { ComponentType } from 'react';
import type { GamePhase } from '../engine/phases';
import { HomeView } from '../features/home/HomeView';
import { CaseIntroView } from '../features/home/CaseIntroView';
import { PlayerSetupView } from '../features/setup/PlayerSetupView';
import { CharacterAssignmentView } from '../features/setup/CharacterAssignmentView';
import { PrivateBriefingsView } from '../features/briefing/PrivateBriefingsView';
import { TableView } from '../features/table/TableView';
import { EvidenceView } from '../features/evidence/EvidenceView';
import { DiscussionView } from '../features/discussion/DiscussionView';
import { DecisionReadyView } from '../features/voting/DecisionReadyView';
import { VotingView } from '../features/voting/VotingView';
import { VoteRevealView } from '../features/reveal/VoteRevealView';
import { TruthRevealView } from '../features/reveal/TruthRevealView';
import { CaseCompleteView } from '../features/reveal/CaseCompleteView';
import { useGameState } from './hooks';

/**
 * Phase -> view. Exhaustive by construction: adding a phase to the approved
 * set without a view here is a TypeScript error, not a blank screen.
 */
const VIEWS: Record<GamePhase, ComponentType> = {
  HOME: HomeView,
  CASE_INTRO: CaseIntroView,
  PLAYER_SETUP: PlayerSetupView,
  CHARACTER_ASSIGNMENT: CharacterAssignmentView,
  PRIVATE_BRIEFINGS: PrivateBriefingsView,
  TABLE: TableView,
  EVIDENCE: EvidenceView,
  DISCUSSION: DiscussionView,
  DECISION_READY: DecisionReadyView,
  VOTING: VotingView,
  VOTE_REVEAL: VoteRevealView,
  TRUTH_REVEAL: TruthRevealView,
  CASE_COMPLETE: CaseCompleteView,
};

export function PhaseRouter() {
  const { phase } = useGameState();
  const View = VIEWS[phase];
  // Remount on phase change so per-screen entrance motion and local
  // handoff state (e.g. "I am Ana") reset cleanly.
  return <View key={phase} />;
}

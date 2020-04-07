// Make polling timer from TalentTimer view object to repeatedly send dispatch requests?
// Maybe use sockets? Toggl style system, set it up with backend, should be easy with feather, etc.
// Hide away request latency from server's authoritative model of the talent's progression and or talent's session

import { TalentSession } from '../models/TalentSession';
import { Talent } from '../models/Talent';
import { START_SESSION, POLL_SESSION, STOP_SESSION } from './types';
import { IExchangeModel } from '../models/IExchangeModel';
import { updateTalent } from './talentActions';
import { ITalentIncubator } from '../models/ITalentIncubator';
import { NullTalentIncubator } from '../models/NullTalentIncubator';

let sessionModel: IExchangeModel<Talent, TalentSession>;

export const configureModel = (model: IExchangeModel<Talent, TalentSession>) => {
    sessionModel = model;
}

const assertModelActive = () => {
    if (sessionModel === null || sessionModel === undefined)
        throw new EvalError("Could not evaluate dispatch action. configureModel() has not been called on this action script.");
}

let incubator: ITalentIncubator = NullTalentIncubator.Null;

export const configureIncubator = (newIncubator: ITalentIncubator) => {
    incubator = newIncubator;
}

export const startSession = (talent: Talent) => (dispatch: any) => {
    assertModelActive();

    if (incubator.isIncubating()) {
        dispatch(stopSession());
    }

    let session: TalentSession = sessionModel.exchange(talent);

    incubator.incubate(talent, session);

    dispatch({
        type: START_SESSION,
        payload: {talent, session}
    });
}

export const stopSession = () => (dispatch: any) => {
    assertModelActive();

    // Save the latest changes before stopping
    console.log("I need you to save the latest changes.");
    dispatch(pollSession());
    console.log("I'm stopping the incubator.");
    incubator.stop();

    dispatch({
        type: STOP_SESSION
    });
}

export const pollSession = () => (dispatch: any) => {
    assertModelActive();

    let poll = null;
    try {
        poll = incubator.poll();
    } catch (EvalError) {
        // Return to resolve race condition
        return;
    }

    if (poll === null) return;

    console.log("I'm about to update both models.");

    sessionModel.update(poll.session);
    dispatch(updateTalent(poll.talent));

    console.log("I've updated both models.");

    dispatch({
        type: POLL_SESSION,
        payload: poll
    });
}